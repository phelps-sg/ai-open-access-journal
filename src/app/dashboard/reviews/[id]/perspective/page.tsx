"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  reviewerPerspectiveSchema,
  type ReviewerPerspectiveInput,
} from "@/lib/schemas/review";
import { Loader2, Send } from "lucide-react";

export default function PerspectivePage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submissionTitle, setSubmissionTitle] = useState<string>("");

  const form = useForm<ReviewerPerspectiveInput>({
    resolver: zodResolver(reviewerPerspectiveSchema),
    defaultValues: {
      content: "",
    },
  });

  useEffect(() => {
    // Fetch submission info and any existing perspective
    Promise.all([
      fetch(`/api/submissions/${params.id}`).then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      }),
      fetch(`/api/submissions/${params.id}/perspectives`).then((res) =>
        res.ok ? res.json() : []
      ),
    ])
      .then(([submission, perspectives]) => {
        setSubmissionTitle(submission.title);
        // If the current user already has a perspective, pre-fill for editing
        // We can't easily determine the current user's perspective from the list
        // without knowing the user ID, but if there's only one it's likely theirs
        // The API handles upsert, so pre-filling existing content is helpful
        if (perspectives.length > 0) {
          // Try to find the user's own perspective — the API will handle auth
          // For now, we'll let the form start empty and the user can re-submit
        }
      })
      .catch(() => router.push("/dashboard/reviews"))
      .finally(() => setLoading(false));
  }, [params.id, router]);

  const onSubmit = async (values: ReviewerPerspectiveInput) => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/submissions/${params.id}/perspectives`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(
          typeof err.error === "string" ? err.error : "Failed to submit perspective"
        );
      }

      toast.success("Perspective submitted successfully!");
      router.push("/dashboard/reviews");
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Failed to submit perspective"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight">
        Contribute Your Perspective
      </h1>
      {submissionTitle && (
        <p className="mt-2 text-lg text-muted-foreground">{submissionTitle}</p>
      )}
      <p className="mt-4 text-sm text-muted-foreground">
        Now that this paper has been accepted, you&apos;re invited to contribute
        a brief perspective that will appear alongside the published article.
        Share insights, connections to related work, or reflections on the
        findings. Your perspective will be published under your name.
      </p>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Your Perspective</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Perspective</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Share your insights, connections to related work, or reflections on the findings..."
                        rows={10}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button type="submit" disabled={submitting}>
                  {submitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  <Send className="mr-2 h-4 w-4" />
                  Submit Perspective
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

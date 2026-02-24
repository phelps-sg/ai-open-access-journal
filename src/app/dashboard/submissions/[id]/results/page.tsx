"use client";

import { useState, useEffect } from "react";
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
  FormDescription,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { resultsSchema, type Results } from "@/lib/schemas/results";
import { Loader2, Send } from "lucide-react";

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const form = useForm<Results>({
    resolver: zodResolver(resultsSchema),
    defaultValues: {
      summary: "",
      rawData: "",
      statisticalResults: "",
      figures: "",
      deviations: "",
      additionalNotes: "",
    },
  });

  useEffect(() => {
    fetch(`/api/submissions/${params.id}`)
      .then((res) => res.json())
      .then((sub) => {
        if (sub.status !== "pre_registered") {
          router.push(`/dashboard/submissions/${params.id}`);
        }
      })
      .catch(() => router.push("/dashboard/submissions"))
      .finally(() => setLoading(false));
  }, [params.id, router]);

  const onSubmit = async (values: Results) => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/submissions/${params.id}/results`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to submit results");
      }

      toast.success("Results submitted successfully!");
      router.push(`/dashboard/submissions/${params.id}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to submit results");
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
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Submit Results</h1>
      <p className="mt-2 text-muted-foreground">
        Submit your raw findings. The AI will write up the paper based on these
        results and your pre-registration.
      </p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Results Data</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="summary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Results Summary</FormLabel>
                    <FormDescription>
                      Summarize what you found. Be factual — the AI will handle
                      the narrative.
                    </FormDescription>
                    <FormControl>
                      <Textarea rows={6} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rawData"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Raw Data</FormLabel>
                    <FormDescription>
                      Paste raw data, summary statistics, or provide a link to
                      your dataset.
                    </FormDescription>
                    <FormControl>
                      <Textarea rows={6} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="statisticalResults"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Statistical Results</FormLabel>
                    <FormDescription>
                      Report test statistics, p-values, effect sizes, confidence
                      intervals, etc.
                    </FormDescription>
                    <FormControl>
                      <Textarea rows={6} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="figures"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Figures & Tables (optional)</FormLabel>
                    <FormDescription>
                      Describe or link to any figures or tables.
                    </FormDescription>
                    <FormControl>
                      <Textarea rows={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="deviations"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Deviations from Pre-registration (optional)
                    </FormLabel>
                    <FormDescription>
                      Document any deviations from the pre-registered plan.
                    </FormDescription>
                    <FormControl>
                      <Textarea rows={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="additionalNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Notes (optional)</FormLabel>
                    <FormControl>
                      <Textarea rows={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Send className="mr-2 h-4 w-4" />
              Submit Results
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

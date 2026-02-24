"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { reviewSchema, type ReviewInput } from "@/lib/schemas/review";
import { Loader2, Send, Plus, Trash2 } from "lucide-react";

interface Paper {
  id: string;
  version: number;
  content: {
    title: string;
    abstract: string;
    sections: { heading: string; body: string }[];
  };
  markdown: string;
}

export default function ReviewPage() {
  const params = useParams();
  const router = useRouter();
  const [paper, setPaper] = useState<Paper | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<ReviewInput>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      scores: {
        methodology: 5,
        clarity: 5,
        significance: 5,
        reproducibility: 5,
      },
      sectionFeedback: [{ section: "", comment: "" }],
      recommendation: "minor_revisions",
      summary: "",
    },
  });

  useEffect(() => {
    fetch(`/api/submissions/${params.id}/paper`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then(setPaper)
      .catch(() => router.push("/dashboard/reviews"))
      .finally(() => setLoading(false));
  }, [params.id, router]);

  const sectionFeedback = form.watch("sectionFeedback");

  const addFeedback = () => {
    form.setValue("sectionFeedback", [
      ...sectionFeedback,
      { section: "", comment: "" },
    ]);
  };

  const removeFeedback = (index: number) => {
    if (sectionFeedback.length <= 1) return;
    form.setValue(
      "sectionFeedback",
      sectionFeedback.filter((_, i) => i !== index)
    );
  };

  const onSubmit = async (values: ReviewInput) => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/submissions/${params.id}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to submit review");
      }

      toast.success("Review submitted successfully!");
      router.push("/dashboard/reviews");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to submit review");
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

  if (!paper) return null;

  const scoreFields = [
    { name: "scores.methodology" as const, label: "Methodology" },
    { name: "scores.clarity" as const, label: "Clarity" },
    { name: "scores.significance" as const, label: "Significance" },
    { name: "scores.reproducibility" as const, label: "Reproducibility" },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Paper viewer (left pane) */}
      <div className="space-y-4 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto lg:pr-4">
        <h2 className="text-xl font-bold sticky top-0 bg-background py-2">
          Paper (v{paper.version})
        </h2>

        <Card>
          <CardContent className="py-6">
            <h3 className="text-lg font-bold text-center">
              {paper.content.title}
            </h3>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Abstract</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
              {paper.content.abstract}
            </p>
          </CardContent>
        </Card>

        {paper.content.sections.map((section, i) => (
          <Card key={i}>
            <CardHeader>
              <CardTitle className="text-base">{section.heading}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                {section.body}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Review form (right pane) */}
      <div className="lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto lg:pl-4">
        <h2 className="text-xl font-bold sticky top-0 bg-background py-2">
          Your Review
        </h2>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Scores */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Scores (1-10)</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                {scoreFields.map(({ name, label }) => (
                  <FormField
                    key={name}
                    control={form.control}
                    name={name}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{label}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            max={10}
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </CardContent>
            </Card>

            {/* Section feedback */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Section Feedback</CardTitle>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addFeedback}
                  >
                    <Plus className="mr-1 h-3 w-3" />
                    Add
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {sectionFeedback.map((_, index) => (
                  <div key={index} className="space-y-2 rounded-md border p-3">
                    <div className="flex items-center justify-between">
                      <FormField
                        control={form.control}
                        name={`sectionFeedback.${index}.section`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Section</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g. Methods, Results"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {sectionFeedback.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="ml-2 mt-6"
                          onClick={() => removeFeedback(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <FormField
                      control={form.control}
                      name={`sectionFeedback.${index}.comment`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Comment</FormLabel>
                          <FormControl>
                            <Textarea rows={3} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recommendation */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recommendation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="recommendation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Decision</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="accept">Accept</SelectItem>
                          <SelectItem value="minor_revisions">
                            Minor Revisions
                          </SelectItem>
                          <SelectItem value="major_revisions">
                            Major Revisions
                          </SelectItem>
                          <SelectItem value="reject">Reject</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="summary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Review Summary</FormLabel>
                      <FormDescription>
                        Provide an overall assessment of the paper.
                      </FormDescription>
                      <FormControl>
                        <Textarea rows={6} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button type="submit" disabled={submitting}>
                {submitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                <Send className="mr-2 h-4 w-4" />
                Submit Review
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}

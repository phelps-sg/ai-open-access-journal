"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
import { TextareaWithUpload } from "@/components/textarea-with-upload";
import { toast } from "sonner";
import { resultsSchema, type Results } from "@/lib/schemas/results";
import { Loader2, Send, Upload } from "lucide-react";

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const jsonInputRef = useRef<HTMLInputElement>(null);

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

  const handleJsonUpload = useCallback(
    async (file: File) => {
      try {
        const text = await file.text();
        const json = JSON.parse(text);
        const result = resultsSchema.safeParse(json);
        if (!result.success) {
          const errors = result.error.issues
            .map((e) => `${e.path.join(".")}: ${e.message}`)
            .slice(0, 10);
          toast.error("Invalid results JSON", {
            description: errors.join("\n"),
          });
          return;
        }
        form.reset(result.data);
        toast.success("Results JSON loaded — review and submit below");
      } catch {
        toast.error("Failed to parse JSON file");
      }
    },
    [form]
  );

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

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Upload Results JSON</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 p-8 transition-colors hover:border-primary/50 hover:bg-muted/50"
            onClick={() => jsonInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const file = e.dataTransfer.files[0];
              if (file) handleJsonUpload(file);
            }}
          >
            <Upload className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium">
              Drop a .json file here or click to browse
            </p>
            <p className="text-xs text-muted-foreground">
              Populate all fields at once from a results JSON file
            </p>
            <input
              ref={jsonInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleJsonUpload(file);
                e.target.value = "";
              }}
            />
          </div>
        </CardContent>
      </Card>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-6">
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
                      <TextareaWithUpload
                        rows={6}
                        accept=".csv,.json,.txt,.tsv,.md"
                        onFileContent={(content) =>
                          form.setValue("rawData", content, {
                            shouldValidate: true,
                          })
                        }
                        {...field}
                      />
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
                      <TextareaWithUpload
                        rows={6}
                        accept=".csv,.json,.txt,.tsv,.md"
                        onFileContent={(content) =>
                          form.setValue("statisticalResults", content, {
                            shouldValidate: true,
                          })
                        }
                        {...field}
                      />
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
                      <TextareaWithUpload
                        rows={3}
                        accept=".txt,.md"
                        onFileContent={(content) =>
                          form.setValue("figures", content, {
                            shouldValidate: true,
                          })
                        }
                        {...field}
                      />
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

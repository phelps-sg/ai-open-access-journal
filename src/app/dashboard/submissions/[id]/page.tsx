"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusTimeline } from "@/components/status-timeline";
import { STATUS_LABELS, STATUS_COLORS, SubmissionStatus } from "@/lib/workflow";
import { ArrowRight, FileText, Loader2 } from "lucide-react";
import Link from "next/link";

interface Submission {
  id: string;
  title: string;
  studyType: string;
  status: SubmissionStatus;
  preRegistration: Record<string, unknown> | null;
  results: Record<string, unknown> | null;
  keywords: string[] | null;
  createdAt: string;
  updatedAt: string;
}

export default function SubmissionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/submissions/${params.id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then(setSubmission)
      .catch(() => router.push("/dashboard/submissions"))
      .finally(() => setLoading(false));
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!submission) return null;

  const statusLabel = STATUS_LABELS[submission.status] ?? submission.status;
  const statusColor = STATUS_COLORS[submission.status] ?? "";

  return (
    <div>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {submission.title}
          </h1>
          <div className="mt-2 flex items-center gap-3">
            <Badge variant="outline">{submission.studyType.replace("_", " ")}</Badge>
            <Badge className={statusColor}>{statusLabel}</Badge>
          </div>
          {submission.keywords && submission.keywords.length > 0 && (
            <div className="mt-2 flex gap-1">
              {submission.keywords.map((kw) => (
                <Badge key={kw} variant="secondary" className="text-xs">
                  {kw}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Status timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusTimeline currentStatus={submission.status} />
          </CardContent>
        </Card>

        {/* Actions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {submission.status === "pre_registered" && (
              <Button asChild>
                <Link href={`/dashboard/submissions/${submission.id}/results`}>
                  <FileText className="mr-2 h-4 w-4" />
                  Submit Results
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}

            {submission.status === "paper_generated" && (
              <div className="flex gap-2">
                <Button asChild variant="outline">
                  <Link href={`/dashboard/submissions/${submission.id}/paper`}>
                    <FileText className="mr-2 h-4 w-4" />
                    View Paper
                  </Link>
                </Button>
                <Button
                  onClick={async () => {
                    const res = await fetch(
                      `/api/submissions/${submission.id}/submit-for-review`,
                      { method: "POST" }
                    );
                    if (res.ok) {
                      setSubmission({ ...submission, status: "under_review" });
                    }
                  }}
                >
                  Submit for Review
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}

            {submission.status === "draft" && (
              <p className="text-sm text-muted-foreground">
                Complete and submit your pre-registration to proceed.
              </p>
            )}

            {submission.status === "results_submitted" && (
              <Button
                onClick={async () => {
                  await fetch(
                    `/api/submissions/${submission.id}/status`,
                    {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ status: "generating_paper" }),
                    }
                  );
                  router.push(`/dashboard/submissions/${submission.id}/paper`);
                }}
              >
                <FileText className="mr-2 h-4 w-4" />
                Generate Paper
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pre-registration data */}
      {submission.preRegistration && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">Pre-registration Data</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap rounded-md bg-muted p-4 text-sm">
              {JSON.stringify(submission.preRegistration, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

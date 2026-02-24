"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, PlusCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { STATUS_LABELS, STATUS_COLORS, SubmissionStatus } from "@/lib/workflow";

interface Submission {
  id: string;
  title: string;
  studyType: string;
  status: SubmissionStatus;
  createdAt: string;
  updatedAt: string;
}

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/submissions")
      .then((res) => res.json())
      .then(setSubmissions)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Submissions</h1>
          <p className="mt-2 text-muted-foreground">
            Manage your study submissions and track their progress.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/submissions/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Submission
          </Link>
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : submissions.length === 0 ? (
        <Card className="mt-8">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No submissions yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Create your first submission to get started.
            </p>
            <Button asChild className="mt-4">
              <Link href="/dashboard/submissions/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                New Submission
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-8 space-y-4">
          {submissions.map((sub) => (
            <Link key={sub.id} href={`/dashboard/submissions/${sub.id}`}>
              <Card className="cursor-pointer transition-colors hover:bg-muted/50">
                <CardContent className="flex items-center justify-between py-4">
                  <div>
                    <h3 className="font-medium">{sub.title}</h3>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge variant="outline">
                        {sub.studyType.replace("_", " ")}
                      </Badge>
                      <Badge className={STATUS_COLORS[sub.status]}>
                        {STATUS_LABELS[sub.status]}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Updated {new Date(sub.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

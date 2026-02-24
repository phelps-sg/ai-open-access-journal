"use client";

import { SUBMISSION_STATUSES, STATUS_LABELS, SubmissionStatus } from "@/lib/workflow";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface StatusTimelineProps {
  currentStatus: SubmissionStatus;
}

export function StatusTimeline({ currentStatus }: StatusTimelineProps) {
  const currentIdx = SUBMISSION_STATUSES.indexOf(currentStatus);

  // Show the main workflow path (skip revisions_requested and rejected)
  const mainPath: SubmissionStatus[] = [
    "draft",
    "pre_registered",
    "results_submitted",
    "generating_paper",
    "paper_generated",
    "under_review",
    "accepted",
    "published",
  ];

  return (
    <div className="space-y-2">
      {mainPath.map((status, i) => {
        const statusIdx = SUBMISSION_STATUSES.indexOf(status);
        const isComplete = currentIdx > statusIdx;
        const isCurrent = currentStatus === status;
        const isFuture = currentIdx < statusIdx;

        return (
          <div key={status} className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full border-2 text-xs",
                isComplete && "border-primary bg-primary text-primary-foreground",
                isCurrent && "border-primary bg-primary/10",
                isFuture && "border-muted-foreground/30"
              )}
            >
              {isComplete ? <Check className="h-3 w-3" /> : i + 1}
            </div>
            <span
              className={cn(
                "text-sm",
                isCurrent && "font-medium text-foreground",
                isFuture && "text-muted-foreground",
                isComplete && "text-muted-foreground line-through"
              )}
            >
              {STATUS_LABELS[status]}
            </span>
            {isCurrent && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                Current
              </span>
            )}
          </div>
        );
      })}

      {/* Show special statuses if active */}
      {(currentStatus === "revisions_requested" || currentStatus === "rejected") && (
        <div className="mt-2 flex items-center gap-3">
          <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-destructive bg-destructive/10 text-xs">
            !
          </div>
          <span className="text-sm font-medium">{STATUS_LABELS[currentStatus]}</span>
          <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
            Current
          </span>
        </div>
      )}
    </div>
  );
}

export const SUBMISSION_STATUSES = [
  "draft",
  "pre_registered",
  "results_submitted",
  "generating_paper",
  "paper_generated",
  "under_review",
  "revisions_requested",
  "accepted",
  "rejected",
  "published",
] as const;

export type SubmissionStatus = (typeof SUBMISSION_STATUSES)[number];

const validTransitions: Record<SubmissionStatus, SubmissionStatus[]> = {
  draft: ["pre_registered"],
  pre_registered: ["results_submitted"],
  results_submitted: ["generating_paper"],
  generating_paper: ["paper_generated"],
  paper_generated: ["under_review"],
  under_review: ["revisions_requested", "accepted", "rejected"],
  revisions_requested: ["generating_paper"],
  accepted: ["published"],
  rejected: [],
  published: [],
};

export function canTransition(
  from: SubmissionStatus,
  to: SubmissionStatus
): boolean {
  return validTransitions[from]?.includes(to) ?? false;
}

export const STATUS_LABELS: Record<SubmissionStatus, string> = {
  draft: "Draft",
  pre_registered: "Pre-registered",
  results_submitted: "Results Submitted",
  generating_paper: "Generating Paper",
  paper_generated: "Paper Generated",
  under_review: "Under Review",
  revisions_requested: "Revisions Requested",
  accepted: "Accepted",
  rejected: "Rejected",
  published: "Published",
};

export const STATUS_COLORS: Record<SubmissionStatus, string> = {
  draft: "bg-gray-100 text-gray-800",
  pre_registered: "bg-blue-100 text-blue-800",
  results_submitted: "bg-indigo-100 text-indigo-800",
  generating_paper: "bg-yellow-100 text-yellow-800",
  paper_generated: "bg-purple-100 text-purple-800",
  under_review: "bg-orange-100 text-orange-800",
  revisions_requested: "bg-amber-100 text-amber-800",
  accepted: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  published: "bg-emerald-100 text-emerald-800",
};

import { z } from "zod/v4";

export const reviewScoresSchema = z.object({
  methodology: z.number().min(1).max(10),
  clarity: z.number().min(1).max(10),
  significance: z.number().min(1).max(10),
  reproducibility: z.number().min(1).max(10),
});

export const sectionFeedbackSchema = z.object({
  section: z.string(),
  comment: z.string().min(1, "Comment is required"),
});

export const reviewSchema = z.object({
  scores: reviewScoresSchema,
  sectionFeedback: z.array(sectionFeedbackSchema).min(1, "At least one section comment is required"),
  recommendation: z.enum(["accept", "minor_revisions", "major_revisions", "reject"]),
  summary: z.string().min(50, "Please provide a detailed review summary"),
});

export const reviewerPerspectiveSchema = z.object({
  content: z.string().min(100, "Please provide a substantive perspective (at least 100 characters)"),
});

export type ReviewInput = z.infer<typeof reviewSchema>;
export type ReviewScores = z.infer<typeof reviewScoresSchema>;
export type ReviewerPerspectiveInput = z.infer<typeof reviewerPerspectiveSchema>;

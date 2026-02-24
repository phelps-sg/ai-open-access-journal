import { z } from "zod/v4";

export const resultsSchema = z.object({
  summary: z.string().min(50, "Please provide a detailed summary of your results"),
  rawData: z.string().min(10, "Provide your raw data or a link to it"),
  statisticalResults: z.string().min(20, "Describe the statistical results"),
  figures: z.string().optional(),
  deviations: z.string().optional(),
  additionalNotes: z.string().optional(),
});

export type Results = z.infer<typeof resultsSchema>;

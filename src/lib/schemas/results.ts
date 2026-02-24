import { z } from "zod/v4";

const dataFileSchema = z.object({
  label: z.string().min(1, "Provide a label for this file"),
  url: z.string().url("Provide a valid URL"),
  description: z.string().optional(),
});

export const resultsSchema = z.object({
  dataFiles: z.array(dataFileSchema).min(1, "Provide at least one data file or link"),
  codeRepository: z.string().url("Provide a valid URL").optional(),
  dataManifest: z.string().min(20, "Describe the data files and what they contain"),
  deviations: z.string().optional(),
  additionalNotes: z.string().optional(),
});

export type Results = z.infer<typeof resultsSchema>;

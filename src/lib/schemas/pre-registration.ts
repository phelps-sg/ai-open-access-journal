import { z } from "zod/v4";

// ----- Common fields shared across all study types -----

const commonFields = {
  title: z.string().min(10, "Title must be at least 10 characters"),
  researchQuestion: z.string().min(20, "Please provide a detailed research question"),
  background: z.string().min(50, "Please provide sufficient background context"),
  keywords: z.array(z.string()).optional().default([]),
};

// ----- Empirical study (based on OSF pre-registration template) -----

export const empiricalSchema = z.object({
  studyType: z.literal("empirical"),
  ...commonFields,
  hypotheses: z.string().min(20, "Please state your hypotheses clearly"),
  design: z.string().min(20, "Describe your study design"),
  samplingPlan: z.string().min(20, "Describe your sampling plan"),
  sampleSize: z.string().min(1, "Specify your target sample size and justification"),
  variables: z.object({
    independent: z.string().min(1, "Specify independent variables"),
    dependent: z.string().min(1, "Specify dependent variables"),
    covariates: z.string().optional(),
  }),
  analysisPlan: z.string().min(20, "Describe your planned analyses"),
  statisticalTests: z.string().min(10, "Specify statistical tests"),
  inferenceoCriteria: z.string().min(10, "Specify criteria for inference (e.g. alpha level)"),
  dataExclusion: z.string().optional(),
  missingData: z.string().optional(),
});

// ----- Simulation study (ADEMP framework) -----

export const simulationSchema = z.object({
  studyType: z.literal("simulation"),
  ...commonFields,
  aims: z.string().min(20, "State the aims of the simulation study"),
  dataGeneratingMechanisms: z.string().min(20, "Describe the data-generating mechanisms"),
  estimands: z.string().min(10, "Define the target estimands"),
  methods: z.string().min(20, "Describe the methods to be compared"),
  performanceMeasures: z.string().min(10, "Specify performance measures (e.g. bias, coverage, MSE)"),
  simulationParameters: z.string().min(10, "Describe simulation parameter ranges"),
  numberOfReplications: z.string().min(1, "Specify number of replications"),
  softwareEnvironment: z.string().optional(),
});

// ----- Replication study -----

export const replicationSchema = z.object({
  studyType: z.literal("replication"),
  ...commonFields,
  originalStudy: z.object({
    title: z.string().min(1, "Provide the original study title"),
    authors: z.string().min(1, "Provide original study authors"),
    doi: z.string().optional(),
    keyFindings: z.string().min(20, "Summarize the key findings to replicate"),
  }),
  replicationDesign: z.string().min(20, "Describe how you will replicate the study"),
  deviations: z.string().optional(),
  successCriteria: z.string().min(10, "Define criteria for replication success"),
  powerAnalysis: z.string().min(10, "Describe your power analysis"),
});

// ----- Negative results -----

export const negativeResultsSchema = z.object({
  studyType: z.literal("negative_results"),
  ...commonFields,
  hypotheses: z.string().min(20, "State the hypotheses that were not supported"),
  design: z.string().min(20, "Describe your study design"),
  samplingPlan: z.string().min(20, "Describe your sampling plan"),
  sampleSize: z.string().min(1, "Specify your sample size and justification"),
  variables: z.object({
    independent: z.string().min(1, "Specify independent variables"),
    dependent: z.string().min(1, "Specify dependent variables"),
    covariates: z.string().optional(),
  }),
  analysisPlan: z.string().min(20, "Describe your planned analyses"),
  equivalenceBounds: z.string().min(10, "Specify equivalence bounds / smallest effect size of interest"),
  equivalenceTest: z.string().min(10, "Describe the equivalence testing approach"),
  powerForEquivalence: z.string().min(10, "Describe power analysis for equivalence test"),
});

// ----- Discriminated union -----

export const preRegistrationSchema = z.discriminatedUnion("studyType", [
  empiricalSchema,
  simulationSchema,
  replicationSchema,
  negativeResultsSchema,
]);

export type PreRegistration = z.infer<typeof preRegistrationSchema>;
export type EmpiricalPreReg = z.infer<typeof empiricalSchema>;
export type SimulationPreReg = z.infer<typeof simulationSchema>;
export type ReplicationPreReg = z.infer<typeof replicationSchema>;
export type NegativeResultsPreReg = z.infer<typeof negativeResultsSchema>;

// ----- Submission schemas for API -----

export const createSubmissionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  studyType: z.enum(["empirical", "simulation", "replication", "negative_results"]),
});

export const updateSubmissionSchema = z.object({
  title: z.string().min(1).optional(),
  preRegistration: preRegistrationSchema.optional(),
  keywords: z.array(z.string()).optional(),
});

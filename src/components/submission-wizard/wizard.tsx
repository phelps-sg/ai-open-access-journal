"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { toast } from "sonner";
import { StudyTypeSelector } from "./study-type-selector";
import { CommonFields } from "./common-fields";
import { EmpiricalFields } from "./empirical-fields";
import { SimulationFields } from "./simulation-fields";
import { ReplicationFields } from "./replication-fields";
import { NegativeResultsFields } from "./negative-results-fields";
import {
  empiricalSchema,
  simulationSchema,
  replicationSchema,
  negativeResultsSchema,
  preRegistrationSchema,
  type PreRegistration,
} from "@/lib/schemas/pre-registration";
import { ArrowLeft, ArrowRight, Save, Send, Upload } from "lucide-react";
import { useRef } from "react";

type StudyType = "empirical" | "simulation" | "replication" | "negative_results";

const schemaMap = {
  empirical: empiricalSchema,
  simulation: simulationSchema,
  replication: replicationSchema,
  negative_results: negativeResultsSchema,
};

const defaultValues: Record<StudyType, Record<string, unknown>> = {
  empirical: {
    studyType: "empirical",
    title: "",
    researchQuestion: "",
    background: "",
    keywords: [],
    hypotheses: "",
    design: "",
    samplingPlan: "",
    sampleSize: "",
    variables: { independent: "", dependent: "", covariates: "" },
    analysisPlan: "",
    statisticalTests: "",
    inferenceoCriteria: "",
    dataExclusion: "",
    missingData: "",
  },
  simulation: {
    studyType: "simulation",
    title: "",
    researchQuestion: "",
    background: "",
    keywords: [],
    aims: "",
    dataGeneratingMechanisms: "",
    estimands: "",
    methods: "",
    performanceMeasures: "",
    simulationParameters: "",
    numberOfReplications: "",
    softwareEnvironment: "",
  },
  replication: {
    studyType: "replication",
    title: "",
    researchQuestion: "",
    background: "",
    keywords: [],
    originalStudy: { title: "", authors: "", doi: "", keyFindings: "" },
    replicationDesign: "",
    deviations: "",
    successCriteria: "",
    powerAnalysis: "",
  },
  negative_results: {
    studyType: "negative_results",
    title: "",
    researchQuestion: "",
    background: "",
    keywords: [],
    hypotheses: "",
    design: "",
    samplingPlan: "",
    sampleSize: "",
    variables: { independent: "", dependent: "", covariates: "" },
    analysisPlan: "",
    equivalenceBounds: "",
    equivalenceTest: "",
    powerForEquivalence: "",
  },
};

const STEPS = ["Study Type", "Common Details", "Type-Specific Details", "Review & Submit"];

interface SubmissionWizardProps {
  submissionId?: string;
  initialData?: {
    studyType: StudyType;
    preRegistration?: PreRegistration;
  };
}

export function SubmissionWizard({ submissionId, initialData }: SubmissionWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(initialData?.studyType ? 1 : 0);
  const [studyType, setStudyType] = useState<StudyType | null>(
    initialData?.studyType ?? null
  );
  const [saving, setSaving] = useState(false);

  const schema = studyType ? schemaMap[studyType] : empiricalSchema;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const form = useForm<Record<string, any>>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: initialData?.preRegistration
      ? (initialData.preRegistration as Record<string, unknown>)
      : studyType
        ? defaultValues[studyType]
        : defaultValues.empirical,
  });

  const handleStudyTypeSelect = (type: StudyType) => {
    setStudyType(type);
    form.reset(defaultValues[type]);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleJsonUpload = useCallback(
    async (file: File) => {
      try {
        const text = await file.text();
        const json = JSON.parse(text);
        const result = preRegistrationSchema.safeParse(json);
        if (!result.success) {
          const errors = result.error.issues
            .map((e) => `${e.path.join(".")}: ${e.message}`)
            .slice(0, 10);
          toast.error("Invalid JSON", {
            description: errors.join("\n"),
          });
          return;
        }
        const data = result.data;
        setStudyType(data.studyType as StudyType);
        form.reset(data as Record<string, unknown>);
        setStep(3);
        toast.success("JSON loaded — review your pre-registration below");
      } catch {
        toast.error("Failed to parse JSON file");
      }
    },
    [form]
  );

  const handleSubmitClick = async () => {
    const valid = await form.trigger();
    if (valid) {
      onSubmit(form.getValues());
    } else {
      const errors = form.formState.errors;
      const fieldNames = Object.keys(errors);
      toast.error("Validation errors", {
        description: `Fix the following fields: ${fieldNames.join(", ")}`,
      });
    }
  };

  const nextStep = async () => {
    if (step === 0 && !studyType) {
      toast.error("Please select a study type");
      return;
    }

    // Validate current step fields before advancing
    if (step === 1) {
      const valid = await form.trigger(["title", "researchQuestion", "background", "keywords"]);
      if (!valid) return;
    }

    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const prevStep = () => setStep((s) => Math.max(s - 1, 0));

  const saveDraft = async () => {
    setSaving(true);
    try {
      const values = form.getValues();
      if (!submissionId) {
        // Create new submission
        const res = await fetch("/api/submissions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: values.title || "Untitled Submission",
            studyType,
          }),
        });
        if (!res.ok) throw new Error("Failed to create submission");
        const submission = await res.json();

        // Save pre-registration data
        await fetch(`/api/submissions/${submission.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: values.title,
            preRegistration: values,
            keywords: values.keywords,
          }),
        });

        toast.success("Draft saved");
        router.push(`/dashboard/submissions/${submission.id}`);
      } else {
        // Update existing
        await fetch(`/api/submissions/${submissionId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: values.title,
            preRegistration: values,
            keywords: values.keywords,
          }),
        });
        toast.success("Draft saved");
      }
    } catch {
      toast.error("Failed to save draft");
    } finally {
      setSaving(false);
    }
  };

  const onSubmit = async (values: Record<string, unknown>) => {
    setSaving(true);
    try {
      let id = submissionId;
      if (!id) {
        const res = await fetch("/api/submissions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: values.title,
            studyType,
          }),
        });
        if (!res.ok) throw new Error("Failed to create submission");
        const submission = await res.json();
        id = submission.id;
      }

      // Save pre-registration data
      await fetch(`/api/submissions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: values.title,
          preRegistration: values,
          keywords: values.keywords,
        }),
      });

      // Transition to pre_registered
      const statusRes = await fetch(`/api/submissions/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "pre_registered" }),
      });

      if (!statusRes.ok) throw new Error("Failed to submit pre-registration");

      toast.success("Pre-registration submitted successfully!");
      router.push(`/dashboard/submissions/${id}`);
    } catch {
      toast.error("Failed to submit pre-registration");
    } finally {
      setSaving(false);
    }
  };

  const TypeSpecificFields = studyType
    ? {
        empirical: EmpiricalFields,
        simulation: SimulationFields,
        replication: ReplicationFields,
        negative_results: NegativeResultsFields,
      }[studyType]
    : null;

  return (
    <div>
      {/* Step indicator */}
      <div className="mb-8 flex items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                i <= step
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {i + 1}
            </div>
            <span
              className={`text-sm ${
                i <= step ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {label}
            </span>
            {i < STEPS.length - 1 && (
              <div className="mx-2 h-px w-8 bg-border" />
            )}
          </div>
        ))}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {/* Step 0: Study Type */}
          {step === 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Select Study Type</CardTitle>
              </CardHeader>
              <CardContent>
                <StudyTypeSelector
                  value={studyType}
                  onChange={handleStudyTypeSelect}
                />

                <div className="relative my-6 flex items-center">
                  <div className="flex-grow border-t border-border" />
                  <span className="mx-4 text-sm text-muted-foreground">or</span>
                  <div className="flex-grow border-t border-border" />
                </div>

                <div
                  className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 p-8 transition-colors hover:border-primary/50 hover:bg-muted/50"
                  onClick={() => fileInputRef.current?.click()}
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
                  <p className="text-sm font-medium">Upload pre-registration JSON</p>
                  <p className="text-xs text-muted-foreground">
                    Drop a .json file here or click to browse
                  </p>
                  <input
                    ref={fileInputRef}
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
          )}

          {/* Step 1: Common fields */}
          {step === 1 && studyType && (
            <Card>
              <CardHeader>
                <CardTitle>Study Details</CardTitle>
              </CardHeader>
              <CardContent>
                <CommonFields form={form} />
              </CardContent>
            </Card>
          )}

          {/* Step 2: Type-specific fields */}
          {step === 2 && studyType && TypeSpecificFields && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {studyType === "empirical" && "Empirical Study Details"}
                  {studyType === "simulation" && "Simulation Study Details (ADEMP)"}
                  {studyType === "replication" && "Replication Study Details"}
                  {studyType === "negative_results" && "Negative Results Details"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TypeSpecificFields form={form} />
              </CardContent>
            </Card>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Review & Submit</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Review your pre-registration before submitting. Once
                    submitted, the pre-registration is locked and cannot be
                    modified. This ensures transparency in the research process.
                  </p>
                  <div className="rounded-md border bg-muted/50 p-4">
                    <pre className="whitespace-pre-wrap text-sm">
                      {JSON.stringify(form.getValues(), null, 2)}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation */}
          <div className="mt-6 flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={step === 0}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            <div className="flex gap-2">
              {step > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={saveDraft}
                  disabled={saving}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save Draft
                </Button>
              )}

              {step < STEPS.length - 1 ? (
                <Button type="button" onClick={nextStep}>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button type="button" onClick={handleSubmitClick} disabled={saving}>
                  <Send className="mr-2 h-4 w-4" />
                  Submit Pre-registration
                </Button>
              )}
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}

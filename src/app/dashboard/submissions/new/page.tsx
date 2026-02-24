import { SubmissionWizard } from "@/components/submission-wizard/wizard";

export default function NewSubmissionPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">New Submission</h1>
      <p className="mt-2 text-muted-foreground">
        Pre-register your study design before collecting data.
      </p>
      <div className="mt-8">
        <SubmissionWizard />
      </div>
    </div>
  );
}

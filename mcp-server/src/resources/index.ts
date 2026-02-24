import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const WORKFLOW_DOC = `# Submission Workflow State Machine

## States
- draft: Initial state when a submission is created
- pre_registered: Pre-registration form has been completed with study design
- results_submitted: Research results have been submitted
- generating_paper: AI is actively generating the paper (transient state)
- paper_generated: AI-generated paper is ready for review
- under_review: Paper is being reviewed by peers
- revisions_requested: Revisions requested based on reviewer feedback
- accepted: Paper accepted after peer review
- rejected: Paper rejected after peer review
- published: Paper published to the public journal

## Valid Transitions
draft -> pre_registered (via update_submission with preRegistration data)
pre_registered -> results_submitted (via submit_results)
results_submitted -> generating_paper (via generate_paper)
generating_paper -> paper_generated (automatic on generation completion)
paper_generated -> under_review (via submit_for_review)
under_review -> revisions_requested (via record_decision)
under_review -> accepted (via record_decision)
under_review -> rejected (via record_decision)
revisions_requested -> generating_paper (via generate_paper to re-generate)
accepted -> published (via update_status)
rejected -> (terminal state)
published -> (terminal state)

## Typical Workflow
1. create_submission -> creates draft
2. update_submission with preRegistration -> becomes pre_registered
3. submit_results -> becomes results_submitted
4. generate_paper -> transitions through generating_paper to paper_generated
5. submit_for_review -> becomes under_review
6. submit_review (by reviewers) -> adds reviews
7. compile_reviews (editor AI) -> synthesizes reviews
8. record_decision -> accepted/rejected/revisions_requested
9. update_status to published (if accepted)
`;

const PRE_REGISTRATION_SCHEMA_DOC = `# Pre-Registration Schemas

Pre-registration data is a discriminated union on the "studyType" field. All schemas share common fields, plus type-specific fields.

## Common Fields (all study types)
- studyType: "empirical" | "simulation" | "replication" | "negative_results" (required, discriminator)
- title: string (min 10 chars)
- researchQuestion: string (min 20 chars)
- background: string (min 50 chars)
- keywords: string[] (optional)

## Empirical Study (studyType: "empirical")
Based on the OSF pre-registration template:
- hypotheses: string (min 20 chars)
- design: string (min 20 chars)
- samplingPlan: string (min 20 chars)
- sampleSize: string (min 1 char)
- variables: { independent: string, dependent: string, covariates?: string }
- analysisPlan: string (min 20 chars)
- statisticalTests: string (min 10 chars)
- inferenceoCriteria: string (min 10 chars) — note the "o" typo is in the actual schema
- dataExclusion?: string
- missingData?: string

## Simulation Study (studyType: "simulation")
Based on the ADEMP framework:
- aims: string (min 20 chars)
- dataGeneratingMechanisms: string (min 20 chars)
- estimands: string (min 10 chars)
- methods: string (min 20 chars)
- performanceMeasures: string (min 10 chars)
- simulationParameters: string (min 10 chars)
- numberOfReplications: string (min 1 char)
- softwareEnvironment?: string

## Replication Study (studyType: "replication")
- originalStudy: { title: string, authors: string, doi?: string, keyFindings: string (min 20 chars) }
- replicationDesign: string (min 20 chars)
- deviations?: string
- successCriteria: string (min 10 chars)
- powerAnalysis: string (min 10 chars)

## Negative Results Study (studyType: "negative_results")
- hypotheses: string (min 20 chars)
- design: string (min 20 chars)
- samplingPlan: string (min 20 chars)
- sampleSize: string (min 1 char)
- variables: { independent: string, dependent: string, covariates?: string }
- analysisPlan: string (min 20 chars)
- equivalenceBounds: string (min 10 chars)
- equivalenceTest: string (min 10 chars)
- powerForEquivalence: string (min 10 chars)
`;

const RESULTS_SCHEMA_DOC = `# Results Schema

Submit research results with the submit_results tool. All fields are strings.

## Required Fields
- summary: string (min 50 chars) — detailed summary of results
- rawData: string (min 10 chars) — raw data or a link to it
- statisticalResults: string (min 20 chars) — description of statistical results

## Optional Fields
- figures: string — figures or links to figures
- deviations: string — any deviations from the pre-registered plan
- additionalNotes: string — any additional notes
`;

const REVIEW_SCHEMA_DOC = `# Review Schema

Submit a peer review with the submit_review tool.

## scores (required object)
- methodology: number 1-10
- clarity: number 1-10
- significance: number 1-10
- reproducibility: number 1-10

## sectionFeedback (required array, min 1 item)
Array of objects:
- section: string — the section name being reviewed
- comment: string — feedback for that section

## recommendation (required)
One of: "accept", "minor_revisions", "major_revisions", "reject"

## summary (required)
string (min 50 chars) — overall review summary

## Notes
- Reviewers cannot review their own submissions
- Only one review per reviewer per paper version
- Submission must be in "under_review" status
`;

export function register(server: McpServer) {
  server.registerResource("workflow", "journal://workflow", {
    description: "Submission workflow state machine — states, valid transitions, and typical workflow",
    mimeType: "text/plain",
  }, async (uri) => ({
    contents: [{ uri: uri.href, text: WORKFLOW_DOC }],
  }));

  server.registerResource("pre-registration-schema", "journal://schemas/pre-registration", {
    description: "Pre-registration schemas for all 4 study types with field names, types, and minimum lengths",
    mimeType: "text/plain",
  }, async (uri) => ({
    contents: [{ uri: uri.href, text: PRE_REGISTRATION_SCHEMA_DOC }],
  }));

  server.registerResource("results-schema", "journal://schemas/results", {
    description: "Results submission schema — required and optional fields",
    mimeType: "text/plain",
  }, async (uri) => ({
    contents: [{ uri: uri.href, text: RESULTS_SCHEMA_DOC }],
  }));

  server.registerResource("review-schema", "journal://schemas/review", {
    description: "Peer review schema — scores, section feedback, recommendation, and summary",
    mimeType: "text/plain",
  }, async (uri) => ({
    contents: [{ uri: uri.href, text: REVIEW_SCHEMA_DOC }],
  }));
}

import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod/v4";
import { getDb } from "@/lib/db";
import { editorActions, users } from "@/lib/db/schema";

const EDITOR_SYSTEM_PROMPT = `You are the AI editor of an open-access scientific journal. Your role is to:

1. Suggest appropriate reviewers based on expertise matching
2. Compile peer reviews into editorial recommendations
3. Check consistency between pre-registrations and generated papers
4. Provide reasoning for all decisions

You must be fair, transparent, and base all decisions on scientific merit.
All your actions are logged in an audit trail for full transparency.`;

// ----- Reviewer Matching -----

export async function suggestReviewers(
  submissionId: string,
  submissionKeywords: string[],
  preRegistration: Record<string, unknown>
) {
  const db = getDb();

  // Get all users with expertise
  const allUsers = await db.select().from(users);
  const usersWithExpertise = allUsers.filter(
    (u) => u.expertise && (u.expertise as string[]).length > 0
  );

  if (usersWithExpertise.length === 0) {
    return { suggestedReviewers: [], reasoning: "No users with expertise found in the system." };
  }

  const { text } = await generateText({
    model: anthropic("claude-opus-4-6"),
    system: EDITOR_SYSTEM_PROMPT,
    prompt: `Given a submission with these keywords: ${submissionKeywords.join(", ")}

Pre-registration summary:
${JSON.stringify(preRegistration, null, 2).slice(0, 2000)}

Available reviewers and their expertise:
${usersWithExpertise.map((u) => `- ${u.name} (${u.id}): ${(u.expertise as string[]).join(", ")}`).join("\n")}

Suggest the most suitable reviewers (up to 3) and explain why each is a good match.
Format your response as:
REVIEWERS:
1. [user_id] - [reasoning]
2. [user_id] - [reasoning]

OVERALL_REASONING:
[explanation of selection criteria]`,
    maxOutputTokens: 1000,
  });

  // Log the action
  await db.insert(editorActions).values({
    submissionId,
    actionType: "suggest_reviewers",
    reasoning: text,
    data: { keywords: submissionKeywords, candidateCount: usersWithExpertise.length },
  });

  return { suggestedReviewers: usersWithExpertise.map((u) => u.id), reasoning: text };
}

// ----- Review Compilation -----

interface ReviewData {
  reviewerId: string;
  scores: Record<string, number>;
  recommendation: string;
  summary: string;
  sectionFeedback: { section: string; comment: string }[];
}

export async function compileReviews(
  submissionId: string,
  reviews: ReviewData[]
) {
  const db = getDb();

  const { text } = await generateText({
    model: anthropic("claude-opus-4-6"),
    system: EDITOR_SYSTEM_PROMPT,
    prompt: `Compile the following peer reviews into an editorial recommendation.

Reviews:
${reviews
  .map(
    (r, i) => `
Review ${i + 1}:
- Scores: methodology=${r.scores.methodology}, clarity=${r.scores.clarity}, significance=${r.scores.significance}, reproducibility=${r.scores.reproducibility}
- Recommendation: ${r.recommendation}
- Summary: ${r.summary}
- Section Feedback: ${r.sectionFeedback.map((f) => `  ${f.section}: ${f.comment}`).join("\n")}
`
  )
  .join("\n")}

Provide:
1. A summary of reviewer consensus and disagreements
2. Average scores across all dimensions
3. An editorial recommendation (accept / minor_revisions / major_revisions / reject)
4. Key points the authors should address if revisions are needed

Format:
CONSENSUS:
[summary]

AVERAGE_SCORES:
methodology: [avg], clarity: [avg], significance: [avg], reproducibility: [avg]

RECOMMENDATION: [decision]

KEY_POINTS:
[list of points]`,
    maxOutputTokens: 1500,
  });

  // Log the action
  await db.insert(editorActions).values({
    submissionId,
    actionType: "compile_reviews",
    reasoning: text,
    data: { reviewCount: reviews.length },
  });

  // Parse recommendation
  const recMatch = text.match(/RECOMMENDATION:\s*(accept|minor_revisions|major_revisions|reject)/i);
  const recommendation = recMatch?.[1]?.toLowerCase() ?? "minor_revisions";

  return { compilation: text, recommendation };
}

// ----- Consistency Check -----

export async function checkConsistency(
  submissionId: string,
  preRegistration: Record<string, unknown>,
  paperContent: { title: string; abstract: string; sections: { heading: string; body: string }[] }
) {
  const db = getDb();

  const { text } = await generateText({
    model: anthropic("claude-opus-4-6"),
    system: EDITOR_SYSTEM_PROMPT,
    prompt: `Check the consistency between the pre-registration and the generated paper.

Pre-registration:
${JSON.stringify(preRegistration, null, 2).slice(0, 3000)}

Paper:
Title: ${paperContent.title}
Abstract: ${paperContent.abstract}
${paperContent.sections.map((s) => `${s.heading}: ${s.body.slice(0, 500)}...`).join("\n\n")}

Check for:
1. Are all pre-registered hypotheses addressed?
2. Are the planned analyses reported?
3. Are any deviations flagged appropriately?
4. Is the reporting faithful and unbiased?

Format:
CONSISTENCY_SCORE: [1-10]
ISSUES:
- [list of issues, if any]
ASSESSMENT:
[overall assessment]`,
    maxOutputTokens: 1000,
  });

  await db.insert(editorActions).values({
    submissionId,
    actionType: "consistency_check",
    reasoning: text,
    data: { paperTitle: paperContent.title },
  });

  return { report: text };
}

import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/api-auth";
import { getDb } from "@/lib/db";
import { submissions, papers } from "@/lib/db/schema";
import { canTransition, SubmissionStatus } from "@/lib/workflow";
import { generateFullPaper, paperToMarkdown } from "@/lib/ai/paper-generator";
import { eq, and, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // Allow up to 60s for paper generation

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAuthUser(req);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const db = getDb();

  const [submission] = await db
    .select()
    .from(submissions)
    .where(and(eq(submissions.id, id), eq(submissions.userId, session.user.id)));

  if (!submission) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!submission.preRegistration || !submission.results) {
    return NextResponse.json(
      { error: "Pre-registration and results are required" },
      { status: 400 }
    );
  }

  // Transition to generating_paper
  const currentStatus = submission.status as SubmissionStatus;
  if (
    !canTransition(currentStatus, "generating_paper") &&
    currentStatus !== "generating_paper"
  ) {
    return NextResponse.json(
      { error: "Cannot generate paper in current state" },
      { status: 400 }
    );
  }

  await db
    .update(submissions)
    .set({ status: "generating_paper", updatedAt: new Date() })
    .where(eq(submissions.id, id));

  try {
    const preReg = submission.preRegistration as Record<string, unknown>;
    const results = submission.results as Record<string, unknown>;

    const paperContent = await generateFullPaper(preReg, results);
    const markdown = paperToMarkdown(paperContent);

    // Determine version number
    const existingPapers = await db
      .select()
      .from(papers)
      .where(eq(papers.submissionId, id))
      .orderBy(desc(papers.version));

    const version = existingPapers.length > 0 ? existingPapers[0].version + 1 : 1;

    const [paper] = await db
      .insert(papers)
      .values({
        submissionId: id,
        version,
        content: paperContent,
        markdown,
      })
      .returning();

    // Transition to paper_generated
    await db
      .update(submissions)
      .set({ status: "paper_generated", updatedAt: new Date() })
      .where(eq(submissions.id, id));

    return NextResponse.json(paper);
  } catch (error) {
    // Revert status on failure
    await db
      .update(submissions)
      .set({ status: "results_submitted", updatedAt: new Date() })
      .where(eq(submissions.id, id));

    console.error("Paper generation failed:", error);
    return NextResponse.json(
      { error: "Paper generation failed" },
      { status: 500 }
    );
  }
}

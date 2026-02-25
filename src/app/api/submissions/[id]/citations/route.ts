import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/api-auth";
import { getDb } from "@/lib/db";
import { submissions, papers } from "@/lib/db/schema";
import { verifyCitations } from "@/lib/ai/citation-verifier";
import { eq, and, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

async function getLatestPaper(db: ReturnType<typeof getDb>, submissionId: string) {
  const [paper] = await db
    .select()
    .from(papers)
    .where(eq(papers.submissionId, submissionId))
    .orderBy(desc(papers.version))
    .limit(1);
  return paper ?? null;
}

/** GET — return current citation validation results from the paper record. */
export async function GET(
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

  const paper = await getLatestPaper(db, id);
  if (!paper) {
    return NextResponse.json({ error: "No paper generated yet" }, { status: 404 });
  }

  return NextResponse.json({
    paperId: paper.id,
    citationValidations: paper.citationValidations ?? null,
  });
}

/** POST — re-run citation verification, update DB, and return results. */
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

  const paper = await getLatestPaper(db, id);
  if (!paper?.content) {
    return NextResponse.json({ error: "No paper generated yet" }, { status: 404 });
  }

  const content = paper.content as {
    sections: { heading: string; body: string }[];
  };

  const validation = await verifyCitations(content);

  await db
    .update(papers)
    .set({ citationValidations: validation })
    .where(eq(papers.id, paper.id));

  return NextResponse.json({
    paperId: paper.id,
    citationValidations: validation,
  });
}

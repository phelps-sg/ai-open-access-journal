import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/api-auth";
import { getDb } from "@/lib/db";
import { submissions, papers, reviews } from "@/lib/db/schema";
import { compileReviews } from "@/lib/ai/editor-agent";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

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
    .where(eq(submissions.id, id));

  if (!submission) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Get latest paper
  const [paper] = await db
    .select()
    .from(papers)
    .where(eq(papers.submissionId, id))
    .orderBy(desc(papers.version))
    .limit(1);

  if (!paper) {
    return NextResponse.json({ error: "No paper found" }, { status: 404 });
  }

  // Get all reviews for this paper
  const paperReviews = await db
    .select()
    .from(reviews)
    .where(eq(reviews.paperId, paper.id));

  if (paperReviews.length === 0) {
    return NextResponse.json(
      { error: "No reviews to compile" },
      { status: 400 }
    );
  }

  const reviewData = paperReviews.map((r) => ({
    reviewerId: r.reviewerId,
    scores: r.scores as Record<string, number>,
    recommendation: r.recommendation ?? "minor_revisions",
    summary: r.summary ?? "",
    sectionFeedback: (r.sectionFeedback as { section: string; comment: string }[]) ?? [],
  }));

  const result = await compileReviews(id, reviewData);
  return NextResponse.json(result);
}

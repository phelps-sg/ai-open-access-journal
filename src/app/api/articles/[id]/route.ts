import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { submissions, papers, reviews, users, editorActions } from "@/lib/db/schema";
import { eq, desc, asc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = getDb();

  const [submission] = await db
    .select()
    .from(submissions)
    .where(eq(submissions.id, id));

  if (!submission || submission.status !== "published") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Get author
  const [author] = await db
    .select({ name: users.name, image: users.image })
    .from(users)
    .where(eq(users.id, submission.userId));

  // Get latest paper
  const [paper] = await db
    .select()
    .from(papers)
    .where(eq(papers.submissionId, id))
    .orderBy(desc(papers.version))
    .limit(1);

  // Get reviews with reviewer names
  const paperReviews = paper
    ? await db
        .select()
        .from(reviews)
        .where(eq(reviews.paperId, paper.id))
    : [];

  const enrichedReviews = await Promise.all(
    paperReviews.map(async (review) => {
      const [reviewer] = await db
        .select({ name: users.name })
        .from(users)
        .where(eq(users.id, review.reviewerId));
      return {
        ...review,
        reviewerName: reviewer?.name ?? "Anonymous",
      };
    })
  );

  // Get editor actions (audit trail)
  const auditTrail = await db
    .select()
    .from(editorActions)
    .where(eq(editorActions.submissionId, id))
    .orderBy(asc(editorActions.createdAt));

  return NextResponse.json({
    submission,
    author: author ?? { name: "Unknown", image: null },
    paper,
    reviews: enrichedReviews,
    auditTrail,
  });
}

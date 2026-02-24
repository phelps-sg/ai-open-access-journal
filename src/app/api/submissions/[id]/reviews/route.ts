import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/api-auth";
import { getDb } from "@/lib/db";
import { submissions, papers, reviews } from "@/lib/db/schema";
import { reviewSchema } from "@/lib/schemas/review";
import { eq, and, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

// GET reviews for a submission's latest paper
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

  const paperReviews = await db
    .select()
    .from(reviews)
    .where(eq(reviews.paperId, paper.id));

  return NextResponse.json(paperReviews);
}

// POST a new review
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

  // Verify submission exists and is under review
  const [submission] = await db
    .select()
    .from(submissions)
    .where(eq(submissions.id, id));

  if (!submission) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (submission.status !== "under_review") {
    return NextResponse.json(
      { error: "Submission is not under review" },
      { status: 400 }
    );
  }

  // Reviewers cannot review their own submissions
  if (submission.userId === session.user.id) {
    return NextResponse.json(
      { error: "Cannot review your own submission" },
      { status: 400 }
    );
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

  // Check for existing review by this user
  const [existing] = await db
    .select()
    .from(reviews)
    .where(
      and(
        eq(reviews.paperId, paper.id),
        eq(reviews.reviewerId, session.user.id)
      )
    );

  if (existing) {
    return NextResponse.json(
      { error: "You have already reviewed this paper" },
      { status: 400 }
    );
  }

  const body = await req.json();
  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const [review] = await db
    .insert(reviews)
    .values({
      paperId: paper.id,
      reviewerId: session.user.id,
      scores: parsed.data.scores,
      sectionFeedback: parsed.data.sectionFeedback,
      recommendation: parsed.data.recommendation,
      summary: parsed.data.summary,
    })
    .returning();

  return NextResponse.json(review, { status: 201 });
}

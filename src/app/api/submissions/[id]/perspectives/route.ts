import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/api-auth";
import { getDb } from "@/lib/db";
import { submissions, reviews, papers, reviewerPerspectives, users } from "@/lib/db/schema";
import { reviewerPerspectiveSchema } from "@/lib/schemas/review";
import { eq, and, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

// GET all perspectives for a submission
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = getDb();

  const perspectives = await db
    .select({
      id: reviewerPerspectives.id,
      content: reviewerPerspectives.content,
      createdAt: reviewerPerspectives.createdAt,
      updatedAt: reviewerPerspectives.updatedAt,
      reviewerName: users.name,
    })
    .from(reviewerPerspectives)
    .innerJoin(users, eq(reviewerPerspectives.reviewerId, users.id))
    .where(eq(reviewerPerspectives.submissionId, id));

  return NextResponse.json(perspectives);
}

// POST (or update) a reviewer perspective
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

  // Verify submission exists and is accepted or published
  const [submission] = await db
    .select()
    .from(submissions)
    .where(eq(submissions.id, id));

  if (!submission) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (submission.status !== "accepted" && submission.status !== "published") {
    return NextResponse.json(
      { error: "Perspectives can only be submitted for accepted or published papers" },
      { status: 400 }
    );
  }

  // Verify user has reviewed this submission (check reviews table via papers)
  const [paper] = await db
    .select()
    .from(papers)
    .where(eq(papers.submissionId, id))
    .orderBy(desc(papers.version))
    .limit(1);

  if (!paper) {
    return NextResponse.json({ error: "No paper found" }, { status: 404 });
  }

  const [review] = await db
    .select()
    .from(reviews)
    .where(
      and(
        eq(reviews.paperId, paper.id),
        eq(reviews.reviewerId, session.user.id)
      )
    );

  if (!review) {
    return NextResponse.json(
      { error: "Only reviewers who reviewed this paper can contribute perspectives" },
      { status: 403 }
    );
  }

  // Validate body
  const body = await req.json();
  const parsed = reviewerPerspectiveSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // Upsert — allow editing until published
  const [existing] = await db
    .select()
    .from(reviewerPerspectives)
    .where(
      and(
        eq(reviewerPerspectives.submissionId, id),
        eq(reviewerPerspectives.reviewerId, session.user.id)
      )
    );

  if (existing) {
    const [updated] = await db
      .update(reviewerPerspectives)
      .set({
        content: parsed.data.content,
        updatedAt: new Date(),
      })
      .where(eq(reviewerPerspectives.id, existing.id))
      .returning();
    return NextResponse.json(updated);
  }

  const [perspective] = await db
    .insert(reviewerPerspectives)
    .values({
      submissionId: id,
      reviewerId: session.user.id,
      content: parsed.data.content,
    })
    .returning();

  return NextResponse.json(perspective, { status: 201 });
}

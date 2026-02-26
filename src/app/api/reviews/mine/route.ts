import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/api-auth";
import { getDb } from "@/lib/db";
import { reviews, papers, submissions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getAuthUser(req);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();

  const userReviews = await db
    .select({
      reviewId: reviews.id,
      recommendation: reviews.recommendation,
      createdAt: reviews.createdAt,
      paperId: reviews.paperId,
      submissionId: submissions.id,
      submissionTitle: submissions.title,
      submissionStatus: submissions.status,
    })
    .from(reviews)
    .innerJoin(papers, eq(reviews.paperId, papers.id))
    .innerJoin(submissions, eq(papers.submissionId, submissions.id))
    .where(eq(reviews.reviewerId, session.user.id));

  return NextResponse.json(userReviews);
}

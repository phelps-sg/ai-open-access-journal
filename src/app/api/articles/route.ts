import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { submissions, papers, users } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const db = getDb();

  // Get all published submissions
  const published = await db
    .select({
      id: submissions.id,
      title: submissions.title,
      studyType: submissions.studyType,
      keywords: submissions.keywords,
      userId: submissions.userId,
      createdAt: submissions.createdAt,
    })
    .from(submissions)
    .where(eq(submissions.status, "published"))
    .orderBy(desc(submissions.createdAt));

  // Enrich with author info and paper data
  const articles = await Promise.all(
    published.map(async (sub) => {
      const [author] = await db
        .select({ name: users.name, image: users.image })
        .from(users)
        .where(eq(users.id, sub.userId));

      const [paper] = await db
        .select()
        .from(papers)
        .where(eq(papers.submissionId, sub.id))
        .orderBy(desc(papers.version))
        .limit(1);

      return {
        id: sub.id,
        title: sub.title,
        studyType: sub.studyType,
        keywords: sub.keywords,
        author: author ?? { name: "Unknown", image: null },
        abstract: (paper?.content as { abstract?: string })?.abstract ?? "",
        publishedAt: sub.createdAt,
      };
    })
  );

  return NextResponse.json(articles);
}

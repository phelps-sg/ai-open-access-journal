import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/api-auth";
import { getDb } from "@/lib/db";
import { submissions, papers } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

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

  // Verify ownership
  const [submission] = await db
    .select()
    .from(submissions)
    .where(and(eq(submissions.id, id), eq(submissions.userId, session.user.id)));

  if (!submission) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Get latest paper version
  const [paper] = await db
    .select()
    .from(papers)
    .where(eq(papers.submissionId, id))
    .orderBy(desc(papers.version))
    .limit(1);

  if (!paper) {
    return NextResponse.json({ error: "No paper generated yet" }, { status: 404 });
  }

  return NextResponse.json(paper);
}

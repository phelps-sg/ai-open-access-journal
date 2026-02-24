import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { submissions } from "@/lib/db/schema";
import { canTransition, SubmissionStatus } from "@/lib/workflow";
import { eq, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
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

  if (!canTransition(submission.status as SubmissionStatus, "under_review")) {
    return NextResponse.json(
      { error: "Cannot submit for review in current state" },
      { status: 400 }
    );
  }

  const [updated] = await db
    .update(submissions)
    .set({ status: "under_review", updatedAt: new Date() })
    .where(eq(submissions.id, id))
    .returning();

  return NextResponse.json(updated);
}

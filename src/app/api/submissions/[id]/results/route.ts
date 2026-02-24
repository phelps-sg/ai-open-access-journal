import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/api-auth";
import { getDb } from "@/lib/db";
import { submissions } from "@/lib/db/schema";
import { resultsSchema } from "@/lib/schemas/results";
import { canTransition, SubmissionStatus } from "@/lib/workflow";
import { eq, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

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

  if (!canTransition(submission.status as SubmissionStatus, "results_submitted")) {
    return NextResponse.json(
      { error: "Cannot submit results in current state" },
      { status: 400 }
    );
  }

  const body = await req.json();
  const parsed = resultsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const [updated] = await db
    .update(submissions)
    .set({
      results: parsed.data,
      status: "results_submitted",
      updatedAt: new Date(),
    })
    .where(eq(submissions.id, id))
    .returning();

  return NextResponse.json(updated);
}

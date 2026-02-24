import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { submissions } from "@/lib/db/schema";
import { canTransition, SubmissionStatus } from "@/lib/workflow";
import { eq, and } from "drizzle-orm";
import { z } from "zod/v4";

export const dynamic = "force-dynamic";

const statusUpdateSchema = z.object({
  status: z.enum([
    "draft",
    "pre_registered",
    "results_submitted",
    "generating_paper",
    "paper_generated",
    "under_review",
    "revisions_requested",
    "accepted",
    "rejected",
    "published",
  ]),
});

export async function PATCH(
  req: NextRequest,
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

  const body = await req.json();
  const parsed = statusUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const currentStatus = submission.status as SubmissionStatus;
  const newStatus = parsed.data.status as SubmissionStatus;

  if (!canTransition(currentStatus, newStatus)) {
    return NextResponse.json(
      { error: `Cannot transition from ${currentStatus} to ${newStatus}` },
      { status: 400 }
    );
  }

  const [updated] = await db
    .update(submissions)
    .set({ status: newStatus, updatedAt: new Date() })
    .where(eq(submissions.id, id))
    .returning();

  return NextResponse.json(updated);
}

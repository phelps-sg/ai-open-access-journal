import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/api-auth";
import { getDb } from "@/lib/db";
import { submissions } from "@/lib/db/schema";
import { canTransition, SubmissionStatus } from "@/lib/workflow";
import { eq } from "drizzle-orm";
import { z } from "zod/v4";

export const dynamic = "force-dynamic";

const decisionSchema = z.object({
  decision: z.enum(["accepted", "rejected", "revisions_requested"]),
});

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

  const body = await req.json();
  const parsed = decisionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const newStatus = parsed.data.decision as SubmissionStatus;
  if (!canTransition(submission.status as SubmissionStatus, newStatus)) {
    return NextResponse.json(
      { error: `Cannot transition from ${submission.status} to ${newStatus}` },
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

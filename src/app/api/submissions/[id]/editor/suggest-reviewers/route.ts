import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/api-auth";
import { getDb } from "@/lib/db";
import { submissions } from "@/lib/db/schema";
import { suggestReviewers } from "@/lib/ai/editor-agent";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

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

  if (!submission.preRegistration) {
    return NextResponse.json(
      { error: "Pre-registration required" },
      { status: 400 }
    );
  }

  const result = await suggestReviewers(
    id,
    (submission.keywords as string[]) ?? [],
    submission.preRegistration as Record<string, unknown>
  );

  return NextResponse.json(result);
}

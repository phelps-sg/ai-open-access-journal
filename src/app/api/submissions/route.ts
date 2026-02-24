import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/api-auth";
import { getDb } from "@/lib/db";
import { submissions } from "@/lib/db/schema";
import { createSubmissionSchema } from "@/lib/schemas/pre-registration";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getAuthUser(req);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  const userSubmissions = await db
    .select()
    .from(submissions)
    .where(eq(submissions.userId, session.user.id))
    .orderBy(desc(submissions.createdAt));

  return NextResponse.json(userSubmissions);
}

export async function POST(req: NextRequest) {
  const session = await getAuthUser(req);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = createSubmissionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const db = getDb();
  const [submission] = await db
    .insert(submissions)
    .values({
      userId: session.user.id,
      title: parsed.data.title,
      studyType: parsed.data.studyType,
      status: "draft",
    })
    .returning();

  return NextResponse.json(submission, { status: 201 });
}

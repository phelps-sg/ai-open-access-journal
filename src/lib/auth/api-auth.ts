import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function getAuthUser(req: NextRequest) {
  const authHeader = req.headers.get("authorization");

  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const apiKey = process.env.API_KEY;

    if (!apiKey || token !== apiKey) {
      return null;
    }

    const email = process.env.API_KEY_USER_EMAIL;
    if (!email) {
      return null;
    }

    const db = getDb();
    const [user] = await db
      .select({ id: users.id, email: users.email, name: users.name })
      .from(users)
      .where(eq(users.email, email));

    if (!user) {
      return null;
    }

    return { user: { id: user.id, email: user.email, name: user.name } };
  }

  // Fall back to NextAuth session
  return await auth();
}

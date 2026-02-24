import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { getDb } from "@/lib/db";

const createAuth = () =>
  NextAuth({
    adapter: DrizzleAdapter(getDb()),
    providers: [GitHub],
    callbacks: {
      session({ session, user }) {
        session.user.id = user.id;
        return session;
      },
    },
  });

let _instance: ReturnType<typeof createAuth> | undefined;
function getInstance() {
  if (!_instance) _instance = createAuth();
  return _instance;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export const handlers = {
  GET: (req: any) => getInstance().handlers.GET(req),
  POST: (req: any) => getInstance().handlers.POST(req),
};

export const auth = (...args: any[]) => (getInstance().auth as any)(...args);
export const signIn = (...args: any[]) => (getInstance().signIn as any)(...args);
export const signOut = (...args: any[]) => (getInstance().signOut as any)(...args);
/* eslint-enable @typescript-eslint/no-explicit-any */

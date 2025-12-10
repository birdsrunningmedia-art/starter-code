import { betterAuth, BetterAuthOptions } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import * as schema from "@/db/schema/schema";
import { nextCookies } from "better-auth/next-js";
import { customSession } from "better-auth/plugins";

const options = {
  database: drizzleAdapter(db, {
    provider: "pg",
    schema, // <-- REQUIRED
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  plugins: [nextCookies()],
} satisfies BetterAuthOptions;

export const auth = betterAuth({
  ...options,
  plugins: [
    ...(options.plugins ?? []),
    customSession(async ({ user, session }) => {
      const profile = await db.query.userProfile.findFirst({
        where: (p, { eq }) => eq(p.userId, user.id),
      });
      return {
        role: profile?.role,
        paymentStatus: profile?.paymentStatus,
        user: {
          ...user,
        },
        session,
      };
    }, options), // pass options here
  ],
});

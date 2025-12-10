"use server";

import { headers } from "next/headers";
import { auth } from "../auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { userProfile } from "@/db/schema/schema";

// this creates user
const createUser = async (email: string, password: string, name: string) => {
  const result = await auth.api.signUpEmail({
    body: {
      email,
      password,
      name,
      callbackURL: "/dashboard",
    },
  });

  const newUser = await db.query.user.findFirst({
    where: (u, { eq }) => eq(u.email, email),
  });

  if (!newUser) {
    throw new Error("Use not found after signup");
  }

  await db.insert(userProfile).values({
    userId: newUser.id,
    role: "user",
    paymentStatus: "free",
  });

  return result;
};

// to be removed
export const signUp = async (email: string, password: string, name: string) => {
  const result = await createUser(email, password, name);
  return result;
};

// to be removed
export const signIn = async (email: string, password: string) => {
  const result = await auth.api.signInEmail({
    body: {
      email,
      password,
      callbackURL: "/dashboard",
    },
  });

  return result;
};

export const signInSocial = async (provider: "github" | "google") => {
  const { url } = await auth.api.signInSocial({
    body: {
      provider,
      callbackURL: "/dashboard",
    },
  });

  if (url) {
    redirect(url);
  }
};

export const signOut = async () => {
  const result = await auth.api.signOut({ headers: await headers() });

  return result;
};

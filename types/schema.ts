import { z } from "zod";

// zod userSchema
export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  emailVerified: z.boolean(),
  image: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// zod userProfile
export const UserProfileSchema = z.object({
  userId: z.string(),
  role: z.enum(["user", "admin"]),
  paymentStatus: z.enum(["free", "paid"]),
  plan: z.string(),
  createdAt: z.date(),
});

export const UserWithProfile = UserSchema.extend({
  profile: UserProfileSchema.nullable(),
});

// export type UserWithProfile = User & {

//   profile: UserProfile | null; // could be null if no profile exists
// };

// export type Session = {
//   id: string;
//   expiresAt: Date;
//   token: string;
//   createdAt: Date;
//   updatedAt: Date;
//   ipAddress: string | null;
//   userAgent: string | null;
//   userId: string;
// };

// zod representation of session
export const sessionSchema = z.object({
  id: z.string(),
  expireAt: z.date(),
  token: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  ipAddress: z.string().nullable(),
  userAgent: z.string().nullable(),
  userId: z.string(),
});

export const SessionWithUserSchema = sessionSchema.extend({
  user: UserWithProfile.nullable(),
});

// export type SessionWithUser = Session & {
//   userWithProfile: UserWithProfile;
// };

export type user = z.infer<typeof UserSchema>;
export type userWithProfile = z.infer<typeof UserWithProfile>;
export type session = z.infer<typeof sessionSchema>;
export type sessionWithUser = z.infer<typeof SessionWithUserSchema>;

import { createAuthClient } from "better-auth/react";
import { customSessionClient } from "better-auth/client/plugins";
import type { auth } from "@/lib/auth";
export const authClient = createAuthClient({
  baseURL: process.env.BASE_URL, // The base URL of your auth server
  plugins: [customSessionClient<typeof auth>()],
});
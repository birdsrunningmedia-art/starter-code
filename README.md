# 🛡️ Better Auth + Drizzle + Next.js (App Router) Setup Guide

“If you want to learn something, read about it.
If you want to understand something, write about it.
If you want to master something, teach it.”
— Yogi Bhajan.

This guide documents the full setup process for integrating Better Auth, Drizzle ORM, NeonDB, and Next.js App Router.
It’s written as a personal reference so that future setups are fast and mistake-free.

## 📚 Overview

Authentication can feel overwhelming, so the process is broken down into two main areas:

### UI Setup

- Pages like login, signup, dashboard, etc.

### Auth Backend Setup

- Installing Better Auth, configuring the database, connecting sessions, and API routing.

This guide assumes:

- Next.js App Router
- No /src folder
- Drizzle ORM
- Neon Database (PostgreSQL)

## 🚀 1. Install Better Auth

```bash
npm install better-auth
```

## 🔐 2. Environment Variables

Create .env.local and add:

```bash
BETTER_AUTH_SECRET=your_generated_secret
BETTER_AUTH_URL=http://localhost:3000
DATABASE_URL=your_neon_database_url

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

Better Auth can generate a secret automatically — store it safely.

## 🗂️ 3. Recommended Project Structure

```bash
app
  api
    auth
      [...all]
        route.ts
  layout.tsx
  page.tsx

db
  schema
    schema.ts
  index.ts

drizzle/           # migrations output
lib
  auth.js
  actions
    auth-actions.ts

public/
node_modules/

```

## 🏗️ 4. Install Drizzle + Neon

```bash
npm i drizzle-orm @neondatabase/serverless dotenv
npm i -D drizzle-kit tsx
```

## 🏛️ 5. Create the Database Instance

Create db/index.ts:

```bash
import * as dotenv from "dotenv";

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

dotenv.config({ path: ".env.local" });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is missing");
}

const client = neon(connectionString);

export const db = drizzle(client);
```

## ⚙️ 6. Drizzle Config

Create drizzle.config.ts:

```bash
import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});

```

Make sure the paths match your project.

## 🔧 7. Generate Better Auth Schema

Run:

```bash
npx @better-auth/cli generate
```

This creates auth_schema.ts in the project root.
Move its contents into:

```graphql
db/schema/schema.ts
```

## 🔐 8. Configure Better Auth

Create lib/auth.ts:

```bash
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import * as schema from "@/db/schema/schema";
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
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
});
```

Important: Don’t forget schema — missing it breaks the setup.

## 🌐 9. Next.js API Route for Auth

Create:

```bash
app/api/auth/[...all]/route.ts
```

Add:

```bash
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { POST, GET } = toNextJsHandler(auth);

```

This exposes Better Auth’s backend routes.

## 🧰 10. Create Auth Actions (Frontend Helpers

Create:

```bash
lib/actions/auth-actions.ts

```

This file contains:

- signUp()
- signIn()
- signOut()

These call the Better Auth API.
(See the GitHub example you mentioned for a working implementation.)

## 🔒 11. Session Access (Use this to:Server Components)

Retrieve user session:

```bash
const session = await auth.api.getSession({
  headers: await headers(),
});

```

Use this to:

- Show login/logout buttons
- Restrict pages
- Display dashboard content

## 🌍 12. Google OAuth Setup

Retrieve user session:

```bash
const session = await auth.api.getSession({
  headers: await headers(),
});

```

## 🌍 12. Google OAuth Setup

- Go to Google Cloud Console

- Create OAuth credentials

- Add them to .env.local

- Enable in the socialProviders config (already done)

- Hook the Google login button to your frontend actions

## 🎉 Done!

At this point, you can:

- Register users

- Sign in

- Log out

- Use Google OAuth

- Access sessions

- Protect pages

- Use Drizzle migrations

Everything is fully compatible with Next.js App Router.

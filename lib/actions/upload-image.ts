// app/actions/upload-image.ts
"use server";

import { auth } from "../auth";
import { headers } from "next/headers";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { db } from "@/db"; // your db
import { images } from "@/db/schema/schema";
import { randomUUID } from "crypto";
import * as schema from "@/db/schema/schema";

const S3 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY!,
  },
});

export async function uploadImage(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    throw new Error("Unauthorized");
  }

  const file = formData.get("file") as File | null;

  if (!file) throw new Error("No file");

  // Optional validation
  if (!file.type.startsWith("image/")) {
    throw new Error("Invalid file type");
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  const id = randomUUID();
  const key = `images/${id}`;

  const url = `${process.env.CLOUDFLARE_PUBLIC_URL}/${key}`;

  // Upload to R2
  await S3.send(
    new PutObjectCommand({
      Bucket: "imfcp",
      Key: key,
      Body: buffer,
      ContentType: file.type,
      CacheControl: "public, max-age=31536000, immutable",
    })
  );

  // Store in DB
  await db.insert(images).values({
    id: id,
    userId: session.user.id,
    url: url,
  });

  // Returned value is sent back to the client automatically
  return { key, url };
}

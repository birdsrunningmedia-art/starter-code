// app/actions/download-image.ts
"use server";

// required imports
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { auth } from "../auth";
import { headers } from "next/headers";

// declaring the S3 clients
const S3 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY!,
  },
});

// the download image function
export async function downloadImage(imageKey: string | null) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    throw new Error("Unauthorized");
  }
  if (!imageKey) throw new Error("No file");

  const response = await S3.send(
    new GetObjectCommand({
      Bucket: "imfcp",
      Key: imageKey,
    })
  );
}

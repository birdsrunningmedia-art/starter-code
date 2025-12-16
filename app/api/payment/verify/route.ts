import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { userProfile } from "@/db/schema/schema";

const EXPECTED_AMOUNT = 500_000; // kobo (₦5,000)

export async function POST(req: Request) {
  // 1️⃣ Auth check
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2️⃣ Parse body
  const { reference } = await req.json();

  if (!reference || typeof reference !== "string") {
    return NextResponse.json(
      { error: "Missing or invalid reference" },
      { status: 400 }
    );
  }

  // 3️⃣ Verify with Paystack
  const res = await fetch(
    `https://api.paystack.co/transaction/verify/${reference}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!res.ok) {
    return NextResponse.json(
      { error: "Failed to verify payment" },
      { status: 502 }
    );
  }

  const result = await res.json();

  // 4️⃣ Defensive checks
  if (!result?.data) {
    return NextResponse.json(
      { error: "Invalid Paystack response" },
      { status: 502 }
    );
  }

  console.log(result);

  const { status, amount, currency, customer } = result.data;

  // 5️⃣ CRITICAL validations
  const isValid =
    status === "success" &&
    amount === EXPECTED_AMOUNT &&
    currency === "NGN" &&
    customer?.email === session.user.email;

  if (!isValid) {
    return NextResponse.json(
      { error: "Payment verification failed" },
      { status: 400 }
    );
  }

  console.log(session.user.id);
  const userId = session.user.id;

  // ✅ SUCCESS (DB write intentionally skipped)
  await db
    .insert(userProfile)
    .values({
      userId,
      paymentStatus: "paid",
      plan: "premium",
    })
    .onConflictDoUpdate({
      target: userProfile.userId,
      set: {
        paymentStatus: "paid",
        plan: "premium",
      },
    });

  return NextResponse.json({
    success: true,
    message: "Payment verified",
  });
}

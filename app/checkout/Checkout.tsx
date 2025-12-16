"use client";

import { redirect } from "next/navigation";

import { Session } from "@/types/session";

type Response = {
  reference: string;
  trans: string;
  status: string;
  message: string;
  transaction: string;
  trxref: string;
  redirecturl: string;
};

export default function CheckoutPage({ session }: { session: Session }) {
  if (!session) redirect("/login");

  async function handleClick() {
    // ✅ Load Paystack ONLY in the browser
    const Paystack = (await import("@paystack/inline-js")).default;
    const paystack = new Paystack();

    paystack.newTransaction({
      key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY, // public key here
      email: session.user.email, // email here
      amount: 500000, // amount goes here

      onSuccess: ({
        transaction,
        reference,
      }: {
        transaction: string;
        reference: string;
      }) => {},
      onCancel: () => {
        console.log("User cancelled");
      },

      callback: async (response: Response) => {
        const res = await fetch("/api/payment/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reference: response.reference }),
        });

        const data = await res.json();
        console.log(data);

        if (data.success) {
          window.location.href = "/dashboard"; // what is this?
        } else {
          alert("Payment verification failed");
        }
      },
    });
  }

  return (
    <div>
      <h1>Upgrade to Premium</h1>
      <p>₦5,000 / month</p>
      {/* Paystack button lives here */}
      {/* <PayButton email={session.user.email} /> */}
      <button onClick={handleClick} className="bg-yellow-400 p-4 rounded-full">
        Get full access for 5000 naira
      </button>
    </div>
  );
}

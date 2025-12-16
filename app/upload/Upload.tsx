
"use client";

import { uploadImage } from "@/lib/actions/upload-image";
import { useTransition } from "react";
import { Session } from "@/types/session";

export default function UploadPage({ session }: { session: Session }) {
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await uploadImage(formData);
      console.log("Uploaded:", result);
    });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      <form
        action={handleSubmit}
        className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-lg"
      >
        <h1 className="mb-6 text-xl font-semibold text-white">
          Upload Image
        </h1>

        <label className="block">
          <span className="mb-2 block text-sm text-zinc-400">
            Select image
          </span>

          <input
            type="file"
            name="file"
            accept="image/*"
            required
            className="block w-full cursor-pointer rounded-lg border border-zinc-700 bg-zinc-800 text-sm text-zinc-300
                       file:mr-4 file:rounded-md file:border-0
                       file:bg-zinc-700 file:px-4 file:py-2
                       file:text-sm file:font-medium file:text-white
                       hover:file:bg-zinc-600"
          />
        </label>

        <button
          disabled={pending}
          className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-indigo-600 px-4 py-2
                     text-sm font-medium text-white transition
                     hover:bg-indigo-500
                     disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Uploading..." : "Upload"}
        </button>
      </form>
    </div>
  );
}

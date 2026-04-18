"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@student-platform/ui";
import { trpc } from "@/lib/trpc";
import { authClient } from "@student-platform/auth/client";

export default function ViewNotePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;
  const { data: session } = authClient.useSession();
  const q = trpc.notes.get.useQuery({ id });
  const remove = trpc.notes.delete.useMutation({ onSuccess: () => router.push("/notes") });

  return (
    <AppShell email={session?.user?.email}>
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <Link href="/notes" className="text-sm font-medium text-[#2b3b90] hover:underline">
            ← All notes
          </Link>
        </div>
        {q.isLoading ? (
          <p className="text-sm text-[#5d6485]">Loading…</p>
        ) : q.isError || !q.data ? (
          <p className="text-sm text-red-600">Note not found.</p>
        ) : (
          <>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <h1 className="text-2xl font-semibold tracking-tight text-[#1f2454]">{q.data.title}</h1>
              <button
                type="button"
                className="rounded-lg border border-red-300 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
                onClick={() => {
                  if (confirm("Delete this note?")) remove.mutate({ id });
                }}
              >
                Delete
              </button>
            </div>
            <p className="text-xs text-[#6a7191]">
              Updated {new Date(q.data.updatedAt).toLocaleString()}
            </p>
            <article className="prose prose-slate max-w-none rounded-2xl border border-[#d9e0f4] bg-white p-6 shadow-sm">
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-[#2a3261]">
                {q.data.content}
              </pre>
            </article>
          </>
        )}
      </div>
    </AppShell>
  );
}

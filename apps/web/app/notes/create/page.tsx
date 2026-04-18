"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AppShell } from "@student-platform/ui";
import { trpc } from "@/lib/trpc";
import { authClient } from "@student-platform/auth/client";

export default function CreateNotePage() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const subjects = trpc.planner.subjectList.useQuery();
  const create = trpc.notes.create.useMutation({
    onSuccess: (d) => router.push(`/notes/view/${d.id}`),
  });
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [subjectId, setSubjectId] = useState<string>("");

  return (
    <AppShell email={session?.user?.email}>
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <Link href="/notes" className="text-sm font-medium text-[#2b3b90] hover:underline">
            ← Back
          </Link>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#1f2454]">New note</h1>
          <p className="mt-1 text-sm text-[#5d6485]">Use Markdown-style headings and lists in plain text.</p>
        </div>
        <form
          className="space-y-4 rounded-2xl border border-[#d9e0f4] bg-white p-5 shadow-sm"
          onSubmit={(e) => {
            e.preventDefault();
            create.mutate({
              title,
              content,
              subjectId: subjectId || null,
            });
          }}
        >
          <div>
            <label className="block text-sm font-medium text-[#485178]">Title</label>
            <input
              className="mt-1 w-full rounded-xl border border-[#cdd5ee] px-3 py-2 text-sm shadow-sm outline-none focus:border-[#8da0df]"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#485178]">Subject (optional)</label>
            <select
              className="mt-1 w-full rounded-xl border border-[#cdd5ee] px-3 py-2 text-sm shadow-sm outline-none focus:border-[#8da0df]"
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
            >
              <option value="">— None —</option>
              {subjects.data?.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#485178]">Content</label>
            <textarea
              className="mt-1 w-full rounded-xl border border-[#cdd5ee] px-3 py-2 font-mono text-sm shadow-sm outline-none focus:border-[#8da0df]"
              rows={16}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
          {create.error ? <p className="text-sm text-red-600">{create.error.message}</p> : null}
          <button
            type="submit"
            disabled={create.isPending}
            className="w-full rounded-xl bg-[#202654] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#161d45] disabled:opacity-60"
          >
            {create.isPending ? "Saving…" : "Save note"}
          </button>
        </form>
      </div>
    </AppShell>
  );
}

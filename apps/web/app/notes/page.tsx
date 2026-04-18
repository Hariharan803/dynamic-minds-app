"use client";

import Link from "next/link";
import { AppShell, NoteCard } from "@student-platform/ui";
import { trpc } from "@/lib/trpc";
import { authClient } from "@student-platform/auth/client";
import { useState } from "react";

export default function NotesPage() {
  const { data: session } = authClient.useSession();
  const [q, setQ] = useState("");
  const list = trpc.notes.list.useQuery({ q: q || undefined });

  return (
    <AppShell email={session?.user?.email}>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold tracking-tight text-[#1f2454]">Notes</h1>
          <Link
            href="/notes/create"
            className="rounded-lg bg-[#202654] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#161d45]"
          >
            New note
          </Link>
        </div>
        <input
          className="w-full max-w-md rounded-xl border border-[#cdd5ee] bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-[#8da0df]"
          placeholder="Search title or content…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        {list.isLoading ? (
          <p className="text-sm text-[#5d6485]">Loading…</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {list.data?.items?.map((n) => (
              <NoteCard key={n.id} note={n} href={`/notes/view/${n.id}`} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

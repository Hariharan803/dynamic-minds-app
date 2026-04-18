"use client";

import { AppShell, InternshipCard } from "@student-platform/ui";
import { trpc } from "@/lib/trpc";
import { authClient } from "@student-platform/auth/client";
import { useState } from "react";

const statuses = [
  "applied",
  "screening",
  "interview",
  "offer",
  "rejected",
  "withdrawn",
] as const;

export default function InternshipsPage() {
  const { data: session } = authClient.useSession();
  const list = trpc.internship.list.useQuery();
  const add = trpc.internship.add.useMutation({ onSuccess: () => list.refetch() });
  const updateStatus = trpc.internship.updateStatus.useMutation({ onSuccess: () => list.refetch() });
  const remove = trpc.internship.delete.useMutation({ onSuccess: () => list.refetch() });

  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");
  const [applied, setApplied] = useState("");

  return (
    <AppShell email={session?.user?.email}>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#1f2454]">Internship tracker</h1>
          <p className="mt-1 text-sm text-[#5d6485]">Log applications and move them through your pipeline.</p>
        </div>

        <form
          className="grid gap-3 rounded-2xl border border-[#d9e0f4] bg-white p-6 shadow-sm md:grid-cols-4"
          onSubmit={(e) => {
            e.preventDefault();
            add.mutate({
              company,
              position,
              appliedDate: applied ? new Date(applied) : new Date(),
            });
            setCompany("");
            setPosition("");
            setApplied("");
          }}
        >
          <input
            className="rounded-xl border border-[#cdd5ee] px-3 py-2 text-sm outline-none focus:border-[#8da0df]"
            placeholder="Company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            required
          />
          <input
            className="rounded-xl border border-[#cdd5ee] px-3 py-2 text-sm outline-none focus:border-[#8da0df]"
            placeholder="Position"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            required
          />
          <input
            type="date"
            className="rounded-xl border border-[#cdd5ee] px-3 py-2 text-sm outline-none focus:border-[#8da0df]"
            value={applied}
            onChange={(e) => setApplied(e.target.value)}
          />
          <button
            type="submit"
            className="rounded-xl bg-[#202654] px-3 py-2 text-sm font-semibold text-white hover:bg-[#161d45]"
          >
            Add
          </button>
        </form>

        <div className="grid gap-4 md:grid-cols-2">
          {list.data?.items?.map((i) => (
            <div key={i.id} className="space-y-3">
              <InternshipCard internship={i} />
              <div className="flex flex-wrap items-center gap-2">
                <select
                  className="rounded-lg border border-[#cdd5ee] px-2 py-1 text-xs outline-none focus:border-[#8da0df]"
                  value={i.status}
                  onChange={(e) =>
                    updateStatus.mutate({
                      id: i.id,
                      status: e.target.value as (typeof statuses)[number],
                    })
                  }
                >
                  {statuses.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="text-xs text-red-600 hover:underline"
                  onClick={() => remove.mutate({ id: i.id })}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

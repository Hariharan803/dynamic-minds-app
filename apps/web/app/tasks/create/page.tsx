"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AppShell } from "@student-platform/ui";
import { trpc } from "@/lib/trpc";
import { authClient } from "@student-platform/auth/client";

export default function CreateTaskPage() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const create = trpc.task.create.useMutation({
    onSuccess: (d) => router.push(`/tasks/edit/${d.id}`),
  });
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");

  return (
    <AppShell email={session?.user?.email}>
      <div className="mx-auto max-w-lg space-y-6">
        <div>
          <Link href="/tasks" className="text-sm font-medium text-[#2b3b90] hover:underline">
            ← Back to tasks
          </Link>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#1f2454]">New task</h1>
        </div>
        <form
          className="space-y-4 rounded-2xl border border-[#d9e0f4] bg-white p-5 shadow-sm"
          onSubmit={(e) => {
            e.preventDefault();
            create.mutate({
              title,
              description: description || undefined,
              dueDate: dueDate ? new Date(dueDate) : null,
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
            <label className="block text-sm font-medium text-[#485178]">Description</label>
            <textarea
              className="mt-1 w-full rounded-xl border border-[#cdd5ee] px-3 py-2 text-sm shadow-sm outline-none focus:border-[#8da0df]"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#485178]">Due date</label>
            <input
              type="datetime-local"
              className="mt-1 w-full rounded-xl border border-[#cdd5ee] px-3 py-2 text-sm shadow-sm outline-none focus:border-[#8da0df]"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
          {create.error ? (
            <p className="text-sm text-red-600">{create.error.message}</p>
          ) : null}
          <button
            type="submit"
            disabled={create.isPending}
            className="w-full rounded-xl bg-[#202654] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#161d45] disabled:opacity-60"
          >
            {create.isPending ? "Saving…" : "Create task"}
          </button>
        </form>
      </div>
    </AppShell>
  );
}

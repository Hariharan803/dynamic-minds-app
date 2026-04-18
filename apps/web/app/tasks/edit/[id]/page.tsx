"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AppShell } from "@student-platform/ui";
import { trpc } from "@/lib/trpc";
import { authClient } from "@student-platform/auth/client";

export default function EditTaskPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;
  const { data: session } = authClient.useSession();
  const list = trpc.task.list.useQuery({});
  const task = list.data?.items?.find((t) => t.id === id);
  const update = trpc.task.update.useMutation({ onSuccess: () => router.push("/tasks") });
  const remove = trpc.task.delete.useMutation({ onSuccess: () => router.push("/tasks") });

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"todo" | "in_progress" | "done">("todo");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    if (!task) return;
    setTitle(task.title);
    setDescription(task.description ?? "");
    setStatus(task.status);
    setPriority(task.priority);
    setDueDate(
      task.dueDate
        ? new Date(task.dueDate).toISOString().slice(0, 16)
        : "",
    );
  }, [task]);

  if (list.isLoading) {
    return (
      <AppShell email={session?.user?.email}>
        <p className="text-sm text-[#5d6485]">Loading…</p>
      </AppShell>
    );
  }

  if (!task) {
    return (
      <AppShell email={session?.user?.email}>
        <p className="text-sm text-red-600">Task not found.</p>
        <Link href="/tasks" className="mt-4 inline-block text-[#2b3b90] hover:underline">
          Back
        </Link>
      </AppShell>
    );
  }

  return (
    <AppShell email={session?.user?.email}>
      <div className="mx-auto max-w-lg space-y-6">
        <div>
          <Link href="/tasks" className="text-sm font-medium text-[#2b3b90] hover:underline">
            ← Back
          </Link>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#1f2454]">Edit task</h1>
        </div>
        <form
          className="space-y-4 rounded-2xl border border-[#d9e0f4] bg-white p-5 shadow-sm"
          onSubmit={(e) => {
            e.preventDefault();
            update.mutate({
              id,
              title,
              description,
              status,
              priority,
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-[#485178]">Status</label>
              <select
                className="mt-1 w-full rounded-xl border border-[#cdd5ee] px-3 py-2 text-sm shadow-sm outline-none focus:border-[#8da0df]"
                value={status}
                onChange={(e) => setStatus(e.target.value as typeof status)}
              >
                <option value="todo">To do</option>
                <option value="in_progress">In progress</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#485178]">Priority</label>
              <select
                className="mt-1 w-full rounded-xl border border-[#cdd5ee] px-3 py-2 text-sm shadow-sm outline-none focus:border-[#8da0df]"
                value={priority}
                onChange={(e) => setPriority(e.target.value as typeof priority)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
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
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={update.isPending}
              className="flex-1 rounded-xl bg-[#202654] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#161d45] disabled:opacity-60"
            >
              {update.isPending ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              className="rounded-lg border border-red-300 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50"
              onClick={() => {
                if (confirm("Delete this task?")) remove.mutate({ id });
              }}
            >
              Delete
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}

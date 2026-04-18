"use client";

import Link from "next/link";
import { AppShell, TaskCard } from "@student-platform/ui";
import { trpc } from "@/lib/trpc";
import { authClient } from "@student-platform/auth/client";

const statusColumns = [
  {
    key: "todo",
    label: "To do",
    headerClassName: "bg-[#ece9ff] text-[#3c3f8c]",
    emptyText: "No tasks in this column.",
  },
  {
    key: "in_progress",
    label: "In progress",
    headerClassName: "bg-[#fff2d8] text-[#9a6324]",
    emptyText: "No tasks in progress yet.",
  },
  {
    key: "done",
    label: "Complete",
    headerClassName: "bg-[#ccfff2] text-[#1f5a50]",
    emptyText: "Nothing completed yet.",
  },
] as const;

export default function TasksPage() {
  const { data: session } = authClient.useSession();
  const list = trpc.task.list.useQuery({});
  const complete = trpc.task.complete.useMutation({
    onSuccess: () => list.refetch(),
  });
  const tasks = list.data?.items ?? [];

  return (
    <AppShell email={session?.user?.email}>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-[#5d6485]">Company tasks</p>
            <h1 className="text-3xl font-semibold tracking-tight text-[#1f2454]">Task board</h1>
          </div>
          <Link
            href="/tasks/create"
            className="rounded-lg bg-[#202654] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#161d45]"
          >
            New task
          </Link>
        </div>
        {list.isLoading ? (
          <p className="text-sm text-[#5d6485]">Loading…</p>
        ) : (
          <div className="grid gap-4 xl:grid-cols-3">
            {statusColumns.map((column) => {
              const columnTasks = tasks.filter((task) => task.status === column.key);
              return (
                <section
                  key={column.key}
                  className="rounded-2xl border border-[#d9e0f4] bg-[#f9fbff] p-3"
                >
                  <header className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${column.headerClassName}`}>
                        {column.label}
                      </span>
                      <span className="text-xs font-medium text-[#5d6485]">{columnTasks.length}</span>
                    </div>
                  </header>
                  <div className="space-y-3">
                    {columnTasks.length ? (
                      columnTasks.map((t) => (
                        <TaskCard
                          key={t.id}
                          task={t}
                          actions={
                            <div className="flex flex-col gap-2">
                              {t.status !== "done" ? (
                                <button
                                  type="button"
                                  className="rounded-md bg-[#24a889] px-2 py-1 text-xs font-medium text-white hover:bg-[#1f8f76]"
                                  onClick={() => complete.mutate({ id: t.id })}
                                >
                                  Complete
                                </button>
                              ) : null}
                              <Link
                                href={`/tasks/edit/${t.id}`}
                                className="text-center text-xs font-medium text-[#2b3b90] hover:underline"
                              >
                                Edit
                              </Link>
                            </div>
                          }
                        />
                      ))
                    ) : (
                      <p className="rounded-xl border border-dashed border-[#d9e0f4] bg-white px-3 py-5 text-center text-xs text-[#5d6485]">
                        {column.emptyText}
                      </p>
                    )}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}

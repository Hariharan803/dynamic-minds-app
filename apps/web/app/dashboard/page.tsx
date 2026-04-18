"use client";

import Link from "next/link";
import { AppShell, InternshipCard, NoteCard, TaskCard } from "@student-platform/ui";
import { trpc } from "@/lib/trpc";
import { authClient } from "@student-platform/auth/client";

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function DashboardPage() {
  const { data: session } = authClient.useSession();
  const q = trpc.dashboard.overview.useQuery(undefined, { staleTime: 30_000 });

  return (
    <AppShell email={session?.user?.email}>
      <div className="space-y-8">
        <div className="relative overflow-hidden rounded-[1.9rem] bg-[#202654] px-6 py-7 text-white shadow-sm">
          <span className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#2f3779]/60" />
          <span className="absolute right-36 top-7 h-4 w-4 rounded-full bg-[#c8fff2]" />
          <span className="absolute right-20 bottom-10 h-3 w-3 rounded-full bg-[#ffdca8]" />
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#b8c5ff]">Learning hub</p>
              <h1 className="mt-1 text-4xl font-semibold tracking-tight">Dashboard</h1>
              <p className="mt-1 text-sm text-[#d2d8ff]">
              Today’s focus, upcoming exams, notes, and groups.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-2 sm:flex">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-white/70 bg-[#d9ecff] text-xs font-semibold text-[#1f2454]">
                  DM
                </span>
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-white/70 bg-[#fff6e4] text-xs font-semibold text-[#1f2454]">
                  AI
                </span>
              </div>
              <button
                type="button"
                className="rounded-xl bg-[#b8ffee] px-3 py-2 text-sm font-semibold text-[#162150] hover:bg-[#a4f5e1]"
                onClick={async () => {
                  await authClient.signOut();
                  window.location.href = "/login";
                }}
              >
                Sign out
              </button>
            </div>
          </div>
        </div>

        {q.isLoading ? (
          <p className="text-sm text-[#5d6485]">Loading…</p>
        ) : q.isError ? (
          <p className="text-sm text-red-600">Could not load dashboard.</p>
        ) : (
          <>
            <section className="rounded-2xl border border-[#d9e0f4] bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[#1f2454]">Today’s tasks</h2>
                <Link href="/tasks" className="text-sm font-medium text-[#2b3b90] hover:underline">
                  View all
                </Link>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {q.data?.todayTasks?.length ? (
                  q.data.todayTasks.map((t) => <TaskCard key={t.id} task={t} />)
                ) : (
                  <p className="text-sm text-[#5d6485]">No tasks due today.</p>
                )}
              </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-[#d9e0f4] bg-white p-5 shadow-sm">
                <h2 className="mb-3 text-lg font-semibold text-[#1f2454]">Upcoming exams</h2>
                <ul className="space-y-2">
                  {q.data?.upcomingExams?.length ? (
                    q.data.upcomingExams.map((ex) => (
                      <li
                        key={ex.id}
                        className="rounded-lg border border-[#d9e0f4] bg-white px-4 py-3 text-sm shadow-sm"
                      >
                        <span className="font-medium text-[#1f2454]">{ex.title}</span>
                        <span className="mt-1 block text-[#5d6485]">
                          {new Date(ex.date).toLocaleString()}
                        </span>
                      </li>
                    ))
                  ) : (
                    <li className="text-sm text-[#5d6485]">No exams in the next two weeks.</li>
                  )}
                </ul>
              </div>
              <div className="rounded-2xl border border-[#d9e0f4] bg-white p-5 shadow-sm">
                <h2 className="mb-3 text-lg font-semibold text-[#1f2454]">Recent notes</h2>
                <div className="grid gap-3">
                  {q.data?.recentNotes?.length ? (
                    q.data.recentNotes.map((n) => (
                      <NoteCard key={n.id} note={n} href={`/notes/view/${n.id}`} />
                    ))
                  ) : (
                    <p className="text-sm text-[#5d6485]">No notes yet.</p>
                  )}
                </div>
              </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-[#d9e0f4] bg-white p-5 shadow-sm">
                <h2 className="mb-3 text-lg font-semibold text-[#1f2454]">Internships</h2>
                <div className="grid gap-3">
                  {q.data?.recentInternships?.length ? (
                    q.data.recentInternships.map((i) => (
                      <InternshipCard key={i.id} internship={i} />
                    ))
                  ) : (
                    <p className="text-sm text-[#5d6485]">No applications tracked yet.</p>
                  )}
                </div>
                <Link
                  href="/internships"
                  className="mt-3 inline-block text-sm font-medium text-[#2b3b90] hover:underline"
                >
                  Manage internships
                </Link>
              </div>
              <div className="rounded-2xl border border-[#d9e0f4] bg-white p-5 shadow-sm">
                <h2 className="mb-3 text-lg font-semibold text-[#1f2454]">Study groups</h2>
                <p className="text-sm text-[#5d6485]">
                  You are in{" "}
                  <span className="font-semibold text-[#1f2454]">{q.data?.studyGroupCount ?? 0}</span>{" "}
                  groups.
                </p>
                <Link
                  href="/groups"
                  className="mt-3 inline-block text-sm font-medium text-[#2b3b90] hover:underline"
                >
                  Open groups
                </Link>
              </div>
            </section>

            <section className="rounded-2xl border border-[#d9e0f4] bg-white p-5 shadow-sm">
              <h2 className="mb-3 text-lg font-semibold text-[#1f2454]">Weekly planner snapshot</h2>
              <p className="text-sm text-[#5d6485]">
                Build your weekly plan on the{" "}
                <Link className="font-medium text-[#2b3b90] hover:underline" href="/planner">
                  Planner
                </Link>{" "}
                page. Days are labeled {days.join(", ")}.
              </p>
            </section>
          </>
        )}
      </div>
    </AppShell>
  );
}

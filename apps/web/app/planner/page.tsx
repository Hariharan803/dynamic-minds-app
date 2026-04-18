"use client";

import { AppShell } from "@student-platform/ui";
import { trpc } from "@/lib/trpc";
import { authClient } from "@student-platform/auth/client";
import { useMemo, useState } from "react";

const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function PlannerPage() {
  const { data: session } = authClient.useSession();
  const subjects = trpc.planner.subjectList.useQuery();
  const exams = trpc.planner.examList.useQuery();
  const plan = trpc.planner.planList.useQuery();
  const addSubject = trpc.planner.subjectCreate.useMutation({
    onSuccess: () => subjects.refetch(),
  });
  const delSubject = trpc.planner.subjectDelete.useMutation({
    onSuccess: () => {
      subjects.refetch();
      plan.refetch();
    },
  });
  const addExam = trpc.planner.examCreate.useMutation({ onSuccess: () => exams.refetch() });
  const delExam = trpc.planner.examDelete.useMutation({ onSuccess: () => exams.refetch() });
  const upsertPlan = trpc.planner.planUpsert.useMutation({ onSuccess: () => plan.refetch() });
  const delPlan = trpc.planner.planDelete.useMutation({ onSuccess: () => plan.refetch() });

  const [subjectName, setSubjectName] = useState("");
  const [examTitle, setExamTitle] = useState("");
  const [examDate, setExamDate] = useState("");
  const [examSubject, setExamSubject] = useState("");

  const [planDay, setPlanDay] = useState(1);
  const [planTitle, setPlanTitle] = useState("");
  const [planSubject, setPlanSubject] = useState("");

  const planByDay = useMemo(() => {
    type Row = NonNullable<typeof plan.data>[number];
    const m = new Map<number, Row[]>();
    for (let d = 0; d < 7; d++) m.set(d, []);
    for (const row of plan.data ?? []) {
      const list = m.get(row.dayOfWeek) ?? [];
      list.push(row);
      m.set(row.dayOfWeek, list);
    }
    return m;
  }, [plan.data]);

  return (
    <AppShell email={session?.user?.email}>
      <div className="space-y-10">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#1f2454]">Study planner</h1>
          <p className="mt-1 text-sm text-[#5d6485]">Subjects, exams, and a simple weekly rhythm.</p>
        </div>

        <section className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-2xl border border-[#d9e0f4] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#1f2454]">Subjects</h2>
            <form
              className="mt-4 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                addSubject.mutate({ name: subjectName });
                setSubjectName("");
              }}
            >
              <input
                className="flex-1 rounded-xl border border-[#cdd5ee] px-3 py-2 text-sm outline-none focus:border-[#8da0df]"
                placeholder="New subject"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                required
              />
              <button
                type="submit"
                className="rounded-xl bg-[#202654] px-3 py-2 text-sm font-semibold text-white hover:bg-[#161d45]"
              >
                Add
              </button>
            </form>
            <ul className="mt-4 space-y-2 text-sm">
              {subjects.data?.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between rounded-lg border border-[#eef2ff] bg-[#fbfcff] px-3 py-2"
                >
                  <span>{s.name}</span>
                  <button
                    type="button"
                    className="text-xs text-red-600 hover:underline"
                    onClick={() => delSubject.mutate({ id: s.id })}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-[#d9e0f4] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#1f2454]">Exams</h2>
            <form
              className="mt-4 space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                addExam.mutate({
                  title: examTitle,
                  date: new Date(examDate),
                  subjectId: examSubject || null,
                });
                setExamTitle("");
                setExamDate("");
                setExamSubject("");
              }}
            >
              <input
                className="w-full rounded-xl border border-[#cdd5ee] px-3 py-2 text-sm outline-none focus:border-[#8da0df]"
                placeholder="Exam title"
                value={examTitle}
                onChange={(e) => setExamTitle(e.target.value)}
                required
              />
              <input
                type="datetime-local"
                className="w-full rounded-xl border border-[#cdd5ee] px-3 py-2 text-sm outline-none focus:border-[#8da0df]"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                required
              />
              <select
                className="w-full rounded-xl border border-[#cdd5ee] px-3 py-2 text-sm outline-none focus:border-[#8da0df]"
                value={examSubject}
                onChange={(e) => setExamSubject(e.target.value)}
              >
                <option value="">— Subject (optional) —</option>
                {subjects.data?.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="w-full rounded-xl bg-[#202654] px-3 py-2 text-sm font-semibold text-white hover:bg-[#161d45]"
              >
                Add exam
              </button>
            </form>
            <ul className="mt-4 space-y-2 text-sm">
              {exams.data?.map((ex) => (
                <li
                  key={ex.id}
                  className="flex items-start justify-between gap-2 rounded-lg border border-[#eef2ff] bg-[#fbfcff] px-3 py-2"
                >
                  <div>
                    <div className="font-medium text-[#1f2454]">{ex.title}</div>
                    <div className="text-xs text-[#5d6485]">{new Date(ex.date).toLocaleString()}</div>
                  </div>
                  <button
                    type="button"
                    className="shrink-0 text-xs text-red-600 hover:underline"
                    onClick={() => delExam.mutate({ id: ex.id })}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="rounded-2xl border border-[#d9e0f4] bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[#1f2454]">Weekly plan</h2>
          <form
            className="mt-4 grid gap-3 sm:grid-cols-4"
            onSubmit={(e) => {
              e.preventDefault();
              upsertPlan.mutate({
                dayOfWeek: planDay,
                title: planTitle,
                subjectId: planSubject || null,
              });
              setPlanTitle("");
              setPlanSubject("");
            }}
          >
            <select
              className="rounded-xl border border-[#cdd5ee] px-3 py-2 text-sm outline-none focus:border-[#8da0df]"
              value={planDay}
              onChange={(e) => setPlanDay(Number(e.target.value))}
            >
              {dayLabels.map((label, i) => (
                <option key={label} value={i}>
                  {label}
                </option>
              ))}
            </select>
            <input
              className="sm:col-span-2 rounded-xl border border-[#cdd5ee] px-3 py-2 text-sm outline-none focus:border-[#8da0df]"
              placeholder="e.g. DSA practice"
              value={planTitle}
              onChange={(e) => setPlanTitle(e.target.value)}
              required
            />
            <select
              className="rounded-xl border border-[#cdd5ee] px-3 py-2 text-sm outline-none focus:border-[#8da0df]"
              value={planSubject}
              onChange={(e) => setPlanSubject(e.target.value)}
            >
              <option value="">— Subject —</option>
              {subjects.data?.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="rounded-xl bg-[#202654] px-3 py-2 text-sm font-semibold text-white hover:bg-[#161d45] sm:col-span-4"
            >
              Add to week
            </button>
          </form>

          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {dayLabels.map((label, day) => (
              <div key={label} className="rounded-xl border border-[#e6ecfb] bg-[#f7f9ff] p-3">
                <h3 className="text-sm font-semibold text-[#1f2454]">{label}</h3>
                <ul className="mt-2 space-y-2 text-sm text-[#4f5679]">
                  {(planByDay.get(day) ?? []).map((row) => (
                    <li
                      key={row.id}
                      className="flex items-start justify-between gap-2 rounded-md border border-[#eef2ff] bg-white px-2 py-1 shadow-sm"
                    >
                      <span>{row.title}</span>
                      <button
                        type="button"
                        className="text-xs text-red-600 hover:underline"
                        onClick={() => delPlan.mutate({ id: row.id })}
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}

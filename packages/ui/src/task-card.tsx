import type { ReactNode } from "react";

type Task = {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  priority: string;
  dueDate?: Date | null;
};

type Props = {
  task: Task;
  actions?: ReactNode;
};

export function TaskCard({ task, actions }: Props) {
  return (
    <article className="rounded-xl border border-[#d9e0f4] bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-[#1f2454]">{task.title}</h3>
          {task.description ? (
            <p className="mt-1 line-clamp-2 text-sm text-[#5d6485]">{task.description}</p>
          ) : null}
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full bg-[#edf0ff] px-2 py-0.5 text-[#353d76]">
              {task.priority}
            </span>
            {task.dueDate ? (
              <span className="text-[#6a7191]">
                Due {new Date(task.dueDate).toLocaleDateString()}
              </span>
            ) : null}
          </div>
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
    </article>
  );
}

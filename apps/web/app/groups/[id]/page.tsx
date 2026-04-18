"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { AppShell } from "@student-platform/ui";
import { trpc } from "@/lib/trpc";
import { authClient } from "@student-platform/auth/client";

export default function GroupDetailPage() {
  const params = useParams<{ id: string }>();
  const groupId = params.id;
  const { data: session } = authClient.useSession();
  const members = trpc.group.members.useQuery({ groupId });
  const leave = trpc.group.leave.useMutation();

  return (
    <AppShell email={session?.user?.email}>
      <div className="space-y-6">
        <Link href="/groups" className="text-sm font-medium text-[#2b3b90] hover:underline">
          ← All groups
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight text-[#1f2454]">Group members</h1>
        {members.isLoading ? (
          <p className="text-sm text-[#5d6485]">Loading…</p>
        ) : members.isError ? (
          <p className="text-sm text-red-600">You may not have access to this group.</p>
        ) : (
          <ul className="divide-y divide-[#e7ecfb] rounded-2xl border border-[#d9e0f4] bg-white shadow-sm">
            {members.data?.map((m) => (
              <li key={m.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <span className="font-mono text-xs text-[#4f5679]">{m.userId}</span>
                <span className="rounded-full bg-[#edf0ff] px-2 py-0.5 text-xs text-[#353d76]">
                  {m.role}
                </span>
              </li>
            ))}
          </ul>
        )}
        <button
          type="button"
          className="rounded-xl border border-[#cdd5ee] px-4 py-2 text-sm font-medium text-[#2f376b] hover:bg-[#f3f6ff]"
          onClick={async () => {
            await leave.mutateAsync({ groupId });
            window.location.href = "/groups";
          }}
        >
          Leave group
        </button>
      </div>
    </AppShell>
  );
}

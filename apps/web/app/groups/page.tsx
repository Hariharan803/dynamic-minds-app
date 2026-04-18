"use client";

import { useState } from "react";
import { AppShell, GroupCard } from "@student-platform/ui";
import { trpc } from "@/lib/trpc";
import { authClient } from "@student-platform/auth/client";

export default function GroupsPage() {
  const { data: session } = authClient.useSession();
  const groups = trpc.group.myGroups.useQuery();
  const create = trpc.group.create.useMutation({ onSuccess: () => groups.refetch() });
  const join = trpc.group.join.useMutation({ onSuccess: () => groups.refetch() });

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [joinId, setJoinId] = useState("");

  return (
    <AppShell email={session?.user?.email}>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#1f2454]">Study groups</h1>
          <p className="mt-1 text-sm text-[#5d6485]">Create a group, invite others with the group id, and collaborate.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <form
            className="space-y-3 rounded-2xl border border-[#d9e0f4] bg-white p-6 shadow-sm"
            onSubmit={(e) => {
              e.preventDefault();
              create.mutate({ name, description: description || undefined });
              setName("");
              setDescription("");
            }}
          >
            <h2 className="text-lg font-semibold text-[#1f2454]">Create group</h2>
            <input
              className="w-full rounded-xl border border-[#cdd5ee] px-3 py-2 text-sm outline-none focus:border-[#8da0df]"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <textarea
              className="w-full rounded-xl border border-[#cdd5ee] px-3 py-2 text-sm outline-none focus:border-[#8da0df]"
              placeholder="Description (optional)"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <button
              type="submit"
              className="w-full rounded-xl bg-[#202654] px-3 py-2 text-sm font-semibold text-white hover:bg-[#161d45]"
            >
              Create
            </button>
          </form>

          <form
            className="space-y-3 rounded-2xl border border-[#d9e0f4] bg-white p-6 shadow-sm"
            onSubmit={(e) => {
              e.preventDefault();
              join.mutate({ groupId: joinId });
              setJoinId("");
            }}
          >
            <h2 className="text-lg font-semibold text-[#1f2454]">Join with id</h2>
            <input
              className="w-full rounded-xl border border-[#cdd5ee] px-3 py-2 font-mono text-sm outline-none focus:border-[#8da0df]"
              placeholder="Group UUID"
              value={joinId}
              onChange={(e) => setJoinId(e.target.value)}
              required
            />
            <button
              type="submit"
              className="w-full rounded-xl border border-[#cdd5ee] px-3 py-2 text-sm font-semibold text-[#2f376b] hover:bg-[#f3f6ff]"
            >
              Join group
            </button>
          </form>
        </div>

        <div>
          <h2 className="mb-3 text-lg font-semibold text-[#1f2454]">Your groups</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {groups.data?.map(({ group, role }) => (
              <GroupCard
                key={group.id}
                id={group.id}
                name={group.name}
                description={group.description}
                role={role}
              />
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

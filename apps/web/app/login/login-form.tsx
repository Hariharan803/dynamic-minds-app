"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { authClient } from "@student-platform/auth/client";
import { getAuthErrorMessage } from "@/lib/auth-error";

export function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") ?? "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await authClient.signIn.email({ email, password });
      if (res.error) {
        setError(res.error.message ?? "Could not sign in");
        return;
      }
      router.push(next);
      router.refresh();
    } catch (error) {
      setError(getAuthErrorMessage(error, "sign in"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4">
      <div className="rounded-2xl border border-[#d9e0f4] bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-[#1f2454]">Sign in</h1>
        <p className="mt-2 text-sm text-[#5d6485]">
          New here?{" "}
          <Link className="font-medium text-[#2b3b90] hover:underline" href="/signup">
            Create an account
          </Link>
        </p>
        <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#485178]">Email</label>
          <input
            className="mt-1 w-full rounded-xl border border-[#cdd5ee] px-3 py-2 text-sm shadow-sm focus:border-[#8da0df] focus:outline-none focus:ring-2 focus:ring-[#d6e1ff]"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#485178]">Password</label>
          <input
            className="mt-1 w-full rounded-xl border border-[#cdd5ee] px-3 py-2 text-sm shadow-sm focus:border-[#8da0df] focus:outline-none focus:ring-2 focus:ring-[#d6e1ff]"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-[#202654] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#161d45] disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
        </form>
      </div>
    </div>
  );
}

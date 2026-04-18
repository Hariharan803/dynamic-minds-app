"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { authClient } from "@student-platform/auth/client";

type Props = {
  email?: string | null;
};

export function Navbar({ email }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark" | "system">(() => {
    if (typeof window === "undefined") return "system";
    const saved = window.localStorage.getItem("dynamic-minds-theme");
    return saved === "light" || saved === "dark" || saved === "system" ? saved : "system";
  });
  const menuRef = useRef<HTMLDivElement>(null);
  const accountName = useMemo(() => {
    if (!email) return "Account";
    return email.split("@")[0] || "Account";
  }, [email]);
  const initials = useMemo(() => {
    const base = accountName.replace(/[^a-zA-Z0-9 ]/g, "").trim();
    if (!base) return "DM";
    const parts = base.split(/\s+/).slice(0, 2);
    return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "DM";
  }, [accountName]);

  useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const applyTheme = () => {
      const isDark = theme === "dark" || (theme === "system" && media.matches);
      root.style.colorScheme = isDark ? "dark" : "light";
      root.classList.toggle("dm-dark", isDark);
    };
    applyTheme();
    const onMediaChange = () => {
      if (theme === "system") applyTheme();
    };
    media.addEventListener("change", onMediaChange);
    window.localStorage.setItem("dynamic-minds-theme", theme);
    return () => media.removeEventListener("change", onMediaChange);
  }, [theme]);

  useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  async function handleLogout() {
    await authClient.signOut();
    window.location.href = "/login";
  }

  return (
    <header
      className={`border-b border-[#d8def0] bg-white/95 backdrop-blur transition-[padding] duration-200 ${
        menuOpen ? "pb-72" : ""
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/dashboard" className="inline-flex items-center gap-3 text-xl font-semibold tracking-tight text-[#202654]">
          <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#202654] shadow-sm">
            <span className="absolute h-5 w-5 -translate-x-1.5 rounded-full bg-[#b8ffee]" />
            <span className="absolute h-2.5 w-2.5 translate-x-1.5 rounded-full bg-white" />
            <span className="absolute h-1.5 w-1.5 -translate-y-2 translate-x-2 rounded-full bg-[#ffdca8]" />
          </span>
          <span>Dynamic minds</span>
        </Link>
        <div ref={menuRef} className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#cad3ee] bg-gradient-to-br from-[#eff3ff] to-[#dff7f1] text-[#202654] shadow-sm transition hover:-translate-y-0.5 hover:shadow"
            aria-label="Open account menu"
          >
            <span className="relative inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#202654] text-[10px] font-bold text-white">
              {initials}
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border border-white bg-[#8ef4dc]" />
            </span>
          </button>
          <div
            className={`absolute right-0 top-14 z-40 w-72 origin-top-right rounded-2xl border border-[#d8def0] bg-white p-4 text-sm text-[#36406d] shadow-xl transition duration-200 ${
              menuOpen
                ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
                : "pointer-events-none -translate-y-1 scale-95 opacity-0"
            }`}
          >
              <div className="border-b border-[#e8edfa] pb-3">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#202654] text-xs font-bold text-white">
                    {initials}
                  </span>
                  <p className="font-semibold text-[#1f2454]">{accountName}</p>
                </div>
                <p className="mt-0.5 text-xs text-[#65709a]">{email ?? "No email available"}</p>
              </div>

              <div className="pt-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#65709a]">
                  Application settings
                </p>
                <div className="mt-2 space-y-2 rounded-xl border border-[#e8edfa] bg-[#f9fbff] p-3">
                  <p className="text-xs font-medium text-[#495481]">Theme</p>
                  <label className="flex items-center gap-2 text-xs">
                    <input
                      type="radio"
                      name="theme"
                      checked={theme === "light"}
                      onChange={() => setTheme("light")}
                    />
                    Light
                  </label>
                  <label className="flex items-center gap-2 text-xs">
                    <input
                      type="radio"
                      name="theme"
                      checked={theme === "dark"}
                      onChange={() => setTheme("dark")}
                    />
                    Dark
                  </label>
                  <label className="flex items-center gap-2 text-xs">
                    <input
                      type="radio"
                      name="theme"
                      checked={theme === "system"}
                      onChange={() => setTheme("system")}
                    />
                    System default
                  </label>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-3 w-full rounded-xl bg-[#202654] px-3 py-2 text-sm font-semibold text-white hover:bg-[#161d45]"
                >
                  Log out
                </button>
              </div>
          </div>
        </div>
      </div>
    </header>
  );
}

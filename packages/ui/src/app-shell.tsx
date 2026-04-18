import type { ReactNode } from "react";
import { Navbar } from "./navbar";
import { Sidebar } from "./sidebar";

type Props = {
  children: ReactNode;
  email?: string | null;
};

export function AppShell({ children, email }: Props) {
  return (
    <div className="min-h-screen bg-[#f6f9ff] text-[#1f274f]">
      <Navbar email={email} />
      <div className="mx-auto flex max-w-7xl gap-6 px-4 pb-12 pt-6 sm:px-6 lg:px-8">
        <Sidebar />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}

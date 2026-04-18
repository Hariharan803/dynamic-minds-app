import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Student Platform",
  description: "Tasks, notes, planner, internships, and study groups",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("dynamic-minds-theme")||"system";var d=t==="dark"||(t==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dm-dark",d);document.documentElement.style.colorScheme=d?"dark":"light";}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-screen bg-[#f6f9ff] font-sans antialiased text-[#1f274f]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

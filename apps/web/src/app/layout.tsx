import type { Metadata } from "next";
import Link from "next/link";

import { isAuthenticatedOwner } from "@/lib/auth";
import { env } from "@/lib/env";
import "./globals.css";

export const metadata: Metadata = {
  title: env.appName,
  description: "Private studio: still photos to calm premium property films",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const authed = await isAuthenticatedOwner().catch(() => false);
  return (
    <html lang="en">
      <body>
        {authed && (
          <nav className="topnav" aria-label="Main">
            <span className="brand">{env.appName}</span>
            <Link className="navlink" href="/projects">
              Projects
            </Link>
            <Link className="navlink" href="/system">
              System
            </Link>
            <span className="spacer" />
            <form action="/api/auth/logout" method="post">
              <button className="btn small" type="submit">
                Sign out
              </button>
            </form>
          </nav>
        )}
        {children}
      </body>
    </html>
  );
}

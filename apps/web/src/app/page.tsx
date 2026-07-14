import { redirect } from "next/navigation";

import { isAuthenticatedOwner } from "@/lib/auth";

export default async function Home() {
  const authed = await isAuthenticatedOwner().catch(() => false);
  redirect(authed ? "/projects" : "/login");
}

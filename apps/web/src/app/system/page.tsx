import { requireOwner } from "@/lib/auth";
import { SystemClient } from "./system-client";

export const dynamic = "force-dynamic";

export default async function SystemPage() {
  await requireOwner();
  return <SystemClient />;
}

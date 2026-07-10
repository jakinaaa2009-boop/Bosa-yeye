import type { Metadata } from "next";
import { isCallApiAdminEnabled } from "@/lib/callapiadmin-gate";
import CallApiAdminPanel from "@/components/CallApiAdminPanel";
import CallApiAdminSetup from "@/components/CallApiAdminSetup";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "CallApiAdmin",
  robots: { index: false, follow: false },
};

export default function CallApiAdminPage() {
  if (!isCallApiAdminEnabled()) {
    return <CallApiAdminSetup />;
  }

  return <CallApiAdminPanel />;
}

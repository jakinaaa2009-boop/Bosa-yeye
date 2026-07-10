import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isCallApiAdminEnabled } from "@/lib/callapiadmin-gate";
import CallApiAdminPanel from "@/components/CallApiAdminPanel";

export const metadata: Metadata = {
  title: "CallApiAdmin",
  robots: { index: false, follow: false },
};

export default function CallApiAdminPage() {
  if (!isCallApiAdminEnabled()) {
    notFound();
  }

  return <CallApiAdminPanel />;
}

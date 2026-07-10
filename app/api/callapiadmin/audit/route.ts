import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireCallApiAdminSession } from "@/lib/callapiadmin-auth";
import { isCallApiAdminEnabled, callApiAdminDisabledResponse } from "@/lib/callapiadmin-gate";
import { getCallApiAdminAuditLogs } from "@/lib/callapiadmin-audit";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!isCallApiAdminEnabled()) return callApiAdminDisabledResponse();

  const authResult = await requireCallApiAdminSession(request);
  if ("error" in authResult) return authResult.error;

  try {
    await connectDB();
    const logs = await getCallApiAdminAuditLogs(100);

    return NextResponse.json({
      success: true,
      logs: logs.map((log) => ({
        id: log._id.toString(),
        action: log.action,
        adminUsername: log.adminUsername,
        selectedUserId: log.selectedUserId,
        metadata: log.metadata,
        timestamp: log.createdAt,
      })),
    });
  } catch (error) {
    console.error("CallApiAdmin audit error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load audit log" },
      { status: 500 }
    );
  }
}

import CallApiAdminAuditLog, {
  type CallApiAdminAuditAction,
} from "@/models/CallApiAdminAuditLog";

export async function logCallApiAdminAction(params: {
  action: CallApiAdminAuditAction;
  adminUsername: string;
  selectedUserId?: string;
  metadata?: Record<string, unknown>;
}) {
  await CallApiAdminAuditLog.create({
    action: params.action,
    adminUsername: params.adminUsername,
    selectedUserId: params.selectedUserId,
    metadata: params.metadata,
  });
}

export async function getCallApiAdminAuditLogs(limit = 50) {
  return CallApiAdminAuditLog.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
}

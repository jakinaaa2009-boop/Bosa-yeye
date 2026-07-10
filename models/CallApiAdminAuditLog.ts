import mongoose, { Schema, Document, Model } from "mongoose";

export type CallApiAdminAuditAction =
  | "login_success"
  | "login_failed"
  | "logout"
  | "override_set"
  | "override_cleared"
  | "override_consumed"
  | "override_consumed_kept";

export interface ICallApiAdminAuditLog extends Document {
  action: CallApiAdminAuditAction;
  adminUsername: string;
  selectedUserId?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

const CallApiAdminAuditLogSchema = new Schema<ICallApiAdminAuditLog>(
  {
    action: { type: String, required: true, index: true },
    adminUsername: { type: String, required: true },
    selectedUserId: { type: String },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const CallApiAdminAuditLog: Model<ICallApiAdminAuditLog> =
  mongoose.models.CallApiAdminAuditLog ||
  mongoose.model<ICallApiAdminAuditLog>(
    "CallApiAdminAuditLog",
    CallApiAdminAuditLogSchema
  );

export default CallApiAdminAuditLog;

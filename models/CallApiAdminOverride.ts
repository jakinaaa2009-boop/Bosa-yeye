import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface ICallApiAdminOverride extends Document {
  userId: Types.ObjectId;
  userPhone: string;
  userEmail: string;
  prizeId: Types.ObjectId;
  prizeName: string;
  keepActive: boolean;
  setByUsername: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CallApiAdminOverrideSchema = new Schema<ICallApiAdminOverride>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    userPhone: { type: String, required: true },
    userEmail: { type: String, required: true },
    prizeId: { type: Schema.Types.ObjectId, ref: "Prize", required: true },
    prizeName: { type: String, required: true },
    keepActive: { type: Boolean, default: false },
    setByUsername: { type: String, required: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

const CallApiAdminOverride: Model<ICallApiAdminOverride> =
  mongoose.models.CallApiAdminOverride ||
  mongoose.model<ICallApiAdminOverride>(
    "CallApiAdminOverride",
    CallApiAdminOverrideSchema
  );

export default CallApiAdminOverride;

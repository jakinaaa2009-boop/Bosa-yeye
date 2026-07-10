import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IReceipt extends Document {
  userId: Types.ObjectId;
  receiptNumber: string;
  amount: number;
  productCount: number;
  imageUrl: string;
  imageKey: string;
  status: "pending" | "approved" | "rejected";
  assignedEntries: number;
  usedEntries: number;
  rejectionReason?: string;
  approvedAt?: Date;
  rejectedAt?: Date;
  entriesUpdatedAt?: Date;
  entriesUpdatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReceiptSchema = new Schema<IReceipt>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    receiptNumber: { type: String, required: true, unique: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    productCount: { type: Number, required: true, min: 1 },
    imageUrl: { type: String, required: true },
    imageKey: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    assignedEntries: { type: Number, default: 0, min: 0 },
    usedEntries: { type: Number, default: 0, min: 0 },
    rejectionReason: { type: String },
    approvedAt: { type: Date },
    rejectedAt: { type: Date },
    entriesUpdatedAt: { type: Date },
    entriesUpdatedBy: { type: String, trim: true },
  },
  { timestamps: true }
);

const Receipt: Model<IReceipt> =
  mongoose.models.Receipt || mongoose.model<IReceipt>("Receipt", ReceiptSchema);

export default Receipt;

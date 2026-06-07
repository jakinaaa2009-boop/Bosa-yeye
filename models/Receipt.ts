import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IReceipt extends Document {
  userId: Types.ObjectId;
  receiptNumber: string;
  amount: number;
  imageUrl: string;
  imageKey: string;
  status: "pending" | "approved" | "rejected";
  rejectionReason?: string;
  approvedAt?: Date;
  rejectedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ReceiptSchema = new Schema<IReceipt>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    receiptNumber: { type: String, required: true, unique: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    imageUrl: { type: String, required: true },
    imageKey: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    rejectionReason: { type: String },
    approvedAt: { type: Date },
    rejectedAt: { type: Date },
  },
  { timestamps: true }
);

const Receipt: Model<IReceipt> =
  mongoose.models.Receipt || mongoose.model<IReceipt>("Receipt", ReceiptSchema);

export default Receipt;

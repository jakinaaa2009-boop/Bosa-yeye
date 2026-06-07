import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IWinner extends Document {
  userId: Types.ObjectId;
  receiptId: Types.ObjectId;
  receiptNumber: string;
  prizeId: Types.ObjectId;
  prizeName: string;
  prizeType: "car" | "cash";
  prizeAmount?: number;
  carModel?: string;
  drawDate: Date;
  createdAt: Date;
}

const WinnerSchema = new Schema<IWinner>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    receiptId: { type: Schema.Types.ObjectId, ref: "Receipt", required: true },
    receiptNumber: { type: String, required: true },
    prizeId: { type: Schema.Types.ObjectId, ref: "Prize", required: true },
    prizeName: { type: String, required: true },
    prizeType: { type: String, enum: ["car", "cash"], required: true },
    prizeAmount: { type: Number },
    carModel: { type: String },
    drawDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Winner: Model<IWinner> =
  mongoose.models.Winner || mongoose.model<IWinner>("Winner", WinnerSchema);

export default Winner;

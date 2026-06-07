import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPrize extends Document {
  name: string;
  type: "car" | "cash";
  amount?: number;
  carModel?: string;
  quantity: number;
  remainingQuantity: number;
  description: string;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const PrizeSchema = new Schema<IPrize>(
  {
    name: { type: String, required: true },
    type: { type: String, enum: ["car", "cash"], required: true },
    amount: { type: Number },
    carModel: { type: String },
    quantity: { type: Number, required: true, min: 0 },
    remainingQuantity: { type: Number, required: true, min: 0 },
    description: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Prize: Model<IPrize> =
  mongoose.models.Prize || mongoose.model<IPrize>("Prize", PrizeSchema);

export default Prize;

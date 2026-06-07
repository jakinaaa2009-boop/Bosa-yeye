import Prize from "@/models/Prize";
import Winner from "@/models/Winner";
import { SEED_PRIZES } from "@/lib/prize-pool";

export async function ensurePrizePool() {
  const existingCount = await Prize.countDocuments();

  if (existingCount === 0) {
    await Prize.insertMany(SEED_PRIZES);
    return Prize.find({ isActive: true }).sort({ order: 1 });
  }

  for (const prizeData of SEED_PRIZES) {
    const existing = await Prize.findOne({ name: prizeData.name });

    if (!existing) {
      await Prize.create(prizeData);
      continue;
    }

    const awarded = await Winner.countDocuments({ prizeId: existing._id });
    const remainingQuantity = Math.max(0, prizeData.quantity - awarded);

    await Prize.findByIdAndUpdate(existing._id, {
      type: prizeData.type,
      amount: prizeData.amount,
      carModel: prizeData.carModel,
      quantity: prizeData.quantity,
      remainingQuantity,
      description: prizeData.description,
      order: prizeData.order,
      isActive: true,
    });
  }

  return Prize.find({ isActive: true }).sort({ order: 1 });
}

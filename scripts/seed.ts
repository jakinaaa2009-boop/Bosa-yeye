import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import User from "../models/User";
import Prize from "../models/Prize";
import Winner from "../models/Winner";
import { SEED_PRIZES } from "../lib/prize-pool";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/yeye-lucky-draw";

const ADMIN_PHONE = process.env.SEED_ADMIN_PHONE || "admin";
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || "admin@yeyecoffee.mn";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || "admin123";

async function seed() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log("Connected.");

  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);

  const existingAdmin =
    (await User.findOne({ role: "admin" })) ||
    (await User.findOne({ phone: "99999999" })) ||
    (await User.findOne({ phone: ADMIN_PHONE }));

  if (existingAdmin) {
    existingAdmin.phone = ADMIN_PHONE;
    existingAdmin.email = ADMIN_EMAIL;
    existingAdmin.password = hashedPassword;
    existingAdmin.role = "admin";
    await existingAdmin.save();
    console.log(`Admin user updated: username=${ADMIN_PHONE}`);
  } else {
    await User.create({
      phone: ADMIN_PHONE,
      email: ADMIN_EMAIL,
      age: 30,
      password: hashedPassword,
      role: "admin",
    });
    console.log(`Admin user created: username=${ADMIN_PHONE}`);
  }

  await Prize.deleteMany({
    name: {
      $in: [
        "Toyota Corolla Cross Hybrid",
        "10,000,000₮",
        "5,000,000₮",
        "3,000,000₮",
        "1,000,000₮",
      ],
    },
  });

  for (const prizeData of SEED_PRIZES) {
    const existing = await Prize.findOne({ name: prizeData.name });
    if (existing) {
      const awarded = await Winner.countDocuments({ prizeId: existing._id });
      const remainingQuantity = Math.max(0, prizeData.quantity - awarded);

      await Prize.findByIdAndUpdate(existing._id, {
        ...prizeData,
        remainingQuantity,
      });
      console.log(
        `Prize updated: ${prizeData.name} (remaining: ${remainingQuantity})`
      );
    } else {
      await Prize.create(prizeData);
      console.log(`Prize created: ${prizeData.name}`);
    }
  }

  console.log("Seed completed.");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});

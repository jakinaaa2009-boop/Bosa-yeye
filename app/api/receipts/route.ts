import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { validateReceipt } from "@/lib/validators";
import { uploadToR2 } from "@/lib/r2";
import Receipt from "@/models/Receipt";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if ("error" in authResult) return authResult.error;

    const { user } = authResult;
    await connectDB();

    const formData = await request.formData();
    const receiptNumber = formData.get("receiptNumber") as string;
    const amount = formData.get("amount") as string;
    const productCount = formData.get("productCount") as string;
    const image = formData.get("image") as File | null;

    const validationError = validateReceipt({ receiptNumber, amount, productCount });
    if (validationError) {
      return NextResponse.json(
        { success: false, message: validationError },
        { status: 400 }
      );
    }

    if (!image || !(image instanceof File)) {
      return NextResponse.json(
        { success: false, message: "Баримтын зураг оруулна уу" },
        { status: 400 }
      );
    }

    const existing = await Receipt.findOne({ receiptNumber: receiptNumber.trim() });
    if (existing) {
      return NextResponse.json(
        { success: false, message: "Энэ и-баримтын дугаар аль хэдийн бүртгэгдсэн байна" },
        { status: 409 }
      );
    }

    const buffer = Buffer.from(await image.arrayBuffer());
    const { url, key } = await uploadToR2(
      buffer,
      image.name,
      image.type,
      user._id.toString()
    );

    const receipt = await Receipt.create({
      userId: user._id,
      receiptNumber: receiptNumber.trim(),
      amount: Number(amount),
      productCount: Number(productCount),
      imageUrl: url,
      imageKey: key,
      status: "pending",
    });

    return NextResponse.json({
      success: true,
      message: "Таны баримт амжилттай бүртгэгдлээ. Админ шалгасны дараа баталгаажна.",
      receipt,
    });
  } catch (error) {
    console.error("Receipt upload error:", error);
    const message =
      error instanceof Error ? error.message : "Баримт бүртгэх амжилтгүй боллоо";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { signToken, setAuthCookie, sanitizeUser } from "@/lib/auth";
import { validateRegister } from "@/lib/validators";
import User from "@/models/User";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { phone, email, age, password } = body;

    const validationError = validateRegister({
      phone,
      email,
      age: Number(age),
      password,
    });
    if (validationError) {
      return NextResponse.json(
        { success: false, message: validationError },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({
      $or: [{ phone: phone.trim() }, { email: email.trim().toLowerCase() }],
    });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "Утас эсвэл email аль хэдийн бүртгэгдсэн байна" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
      phone: phone.trim(),
      email: email.trim().toLowerCase(),
      age: Number(age),
      password: hashedPassword,
      role: "user",
    });

    const token = await signToken({ userId: user._id.toString(), role: user.role });
    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { success: false, message: "Бүртгэл амжилтгүй боллоо" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { signToken, setAuthCookie, sanitizeUser } from "@/lib/auth";
import { validateLogin } from "@/lib/validators";
import User from "@/models/User";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { phone, password, identifier, scope = "user" } = body;

    const loginPhone = phone || identifier;
    const validationError = validateLogin({ phone: loginPhone, password });
    if (validationError) {
      return NextResponse.json(
        { success: false, message: validationError },
        { status: 400 }
      );
    }

    const user = await User.findOne({
      $or: [
        { phone: loginPhone.trim() },
        { email: loginPhone.trim().toLowerCase() },
      ],
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Утас эсвэл нууц үг буруу байна" },
        { status: 401 }
      );
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { success: false, message: "Утас эсвэл нууц үг буруу байна" },
        { status: 401 }
      );
    }

    if (scope === "user" && user.role === "admin") {
      return NextResponse.json(
        { success: false, message: "Утас эсвэл нууц үг буруу байна" },
        { status: 401 }
      );
    }

    if (scope === "admin" && user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Админ эрх шаардлагатай" },
        { status: 403 }
      );
    }

    const token = await signToken({ userId: user._id.toString(), role: user.role });
    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, message: "Нэвтрэх амжилтгүй боллоо" },
      { status: 500 }
    );
  }
}

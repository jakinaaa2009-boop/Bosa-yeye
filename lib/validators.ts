export interface RegisterInput {
  phone: string;
  email: string;
  age: number;
  password: string;
}

export interface LoginInput {
  phone: string;
  password: string;
}

export interface AdminLoginInput {
  identifier: string;
  password: string;
}

export function validateRegister(data: RegisterInput): string | null {
  if (!data.phone?.trim()) return "Утасны дугаар оруулна уу";
  if (!/^\d{8}$/.test(data.phone.trim())) {
    return "Утасны дугаар 8 оронтой байх ёстой";
  }
  if (!data.email?.trim()) return "Email хаяг оруулна уу";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
    return "Email хаяг буруу байна";
  }
  if (!data.age || data.age < 18 || data.age > 120) {
    return "Нас 18-120 хооронд байх ёстой";
  }
  if (!data.password || data.password.length < 6) {
    return "Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой";
  }
  return null;
}

export function validateLogin(data: LoginInput): string | null {
  if (!data.phone?.trim()) return "Утасны дугаар оруулна уу";
  if (!data.password) return "Нууц үг оруулна уу";
  return null;
}

export function validateReceipt(data: {
  receiptNumber?: string;
  amount?: string | number;
}): string | null {
  if (!data.receiptNumber?.trim()) return "Баримтын дугаар оруулна уу";
  const amount = Number(data.amount);
  if (!data.amount || isNaN(amount) || amount <= 0) {
    return "Үнийн дүн эерэг тоо байх ёстой";
  }
  return null;
}

export function validateRejectReason(reason?: string): string | null {
  if (reason && reason.length > 500) {
    return "Татгалзах шалтгаан хэт урт байна";
  }
  return null;
}

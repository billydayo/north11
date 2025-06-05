export function isNotValidString(value: any): boolean {
  return typeof value !== 'string' || value.trim().length === 0;
}

export function isNotValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return !emailRegex.test(email);
}

export function isNotValidPhoneNumber(phone: string): boolean {
  const phoneRegex = /^09\d{8}$/; // 台灣手機號碼格式
  return !phoneRegex.test(phone);
}
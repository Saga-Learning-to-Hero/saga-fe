import { z } from "zod";

export const loginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, "Tên đăng nhập hoặc Email không được để trống."),
  password: z
    .string()
    .min(1, "Mật khẩu không được để trống."),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "Họ và tên phải có ít nhất 2 ký tự.")
      .max(100, "Họ và tên không được vượt quá 100 ký tự."),
    studentCode: z
      .string()
      .trim()
      .toUpperCase()
      .regex(/^[A-Z0-9]{6,12}$/, "MSSV không đúng định dạng (Ví dụ: SE170001, HE170504)."),
    email: z
      .string()
      .trim()
      .email("Địa chỉ email không hợp lệ (Ví dụ: student@gmail.com).")
      .refine(
        (email) => !email.endsWith("@fpt.edu.vn") && !email.endsWith("@fe.edu.vn"),
        {
          message: "Email tổ chức (@fpt.edu.vn / @fe.edu.vn) bắt buộc phải đăng nhập bằng nút Google.",
        }
      ),
    password: z
      .string()
      .min(10, "Mật khẩu phải có tối thiểu 10 ký tự theo chính sách bảo mật SAGA.")
      .regex(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 chữ số."),
    confirmPassword: z
      .string()
      .min(1, "Vui lòng xác nhận lại mật khẩu."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp với mật khẩu đã nhập.",
    path: ["confirmPassword"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

export const setupPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(10, "Mật khẩu phải có tối thiểu 10 ký tự theo chính sách bảo mật SAGA.")
      .regex(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 chữ số."),
    confirmPassword: z
      .string()
      .min(1, "Vui lòng xác nhận lại mật khẩu mới."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp với mật khẩu mới.",
    path: ["confirmPassword"],
  });

export type SetupPasswordFormData = z.infer<typeof setupPasswordSchema>;

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

function extractZodErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const fieldName = issue.path[0]?.toString() || "form";
    if (!errors[fieldName]) {
      errors[fieldName] = issue.message;
    }
  }
  return errors;
}

export function validateLogin(identifier: string, password: string): ValidationResult {
  const result = loginSchema.safeParse({ identifier, password });
  if (result.success) {
    return { isValid: true, errors: {} };
  }
  return { isValid: false, errors: extractZodErrors(result.error) };
}

export function validateStudentRegistration(data: {
  fullName: string;
  email: string;
  studentCode: string;
  password: string;
  confirmPassword: string;
}): ValidationResult {
  const result = registerSchema.safeParse(data);
  if (result.success) {
    return { isValid: true, errors: {} };
  }
  return { isValid: false, errors: extractZodErrors(result.error) };
}

export function validatePasswordSetup(newPassword: string, confirmPassword: string): ValidationResult {
  const result = setupPasswordSchema.safeParse({ newPassword, confirmPassword });
  if (result.success) {
    return { isValid: true, errors: {} };
  }
  return { isValid: false, errors: extractZodErrors(result.error) };
}

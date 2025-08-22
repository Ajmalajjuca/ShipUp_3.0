// utils/validation.ts
import { z } from "zod";

export const registerSchema = z
  .object({
    fullName: z.string().min(3, "Full name must be at least 3 characters long"),
    phone: z
      .string()
      .min(10, "Phone number must be at least 10 digits")
      .regex(/^[0-9]{10,15}$/, "Phone number must contain only digits"),
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[a-z]/, "Must contain at least one lowercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

  export const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
  });

export const passwordResetSchema = z.object({
  email: z.string().email("Invalid email address"),
  newPassword: z
    .string()
    .min(8, "New password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[a-z]/, "Must contain at least one lowercase letter")
    .regex(/[0-9]/, "Must contain at least one number"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",  
  path: ["confirmPassword"],
});


export const editProfileSchema = z.object({
  fullName: z.string().min(3, "Full name must be at least 3 characters long"),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .regex(/^[0-9]{10,15}$/, "Phone number must contain only digits"),
  currentPassword: z.string().optional(),
  newPassword: z.string().optional(),
  confirmPassword: z.string().optional(),
}).refine((data) => {
  // If newPassword is provided, currentPassword must also be provided
  if (data.newPassword && !data.currentPassword) {
    return false;
  }
  return true;
}, {
  message: "Current password is required when setting a new password",
  path: ["currentPassword"],
}).refine((data) => {
  // If newPassword is provided, it must meet strength requirements
  if (data.newPassword && data.newPassword.length > 0) {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}$/;
    return passwordRegex.test(data.newPassword);
  }
  return true;
}, {
  message: "New password must be at least 8 characters with uppercase, lowercase, and number",
  path: ["newPassword"],
}).refine((data) => {
  // If newPassword is provided, confirmPassword must match
  if (data.newPassword && data.newPassword !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});



// Optional: sanitize input function
export const sanitizeInput = (input: string) =>
  input.trim().replace(/\s+/g, " ");

import { ZodError } from "zod";

export function extractZodErrors<T extends Record<string, any>>(
  error: ZodError<T>
): Partial<Record<keyof T, string>> {
  const fieldErrors = error.flatten().fieldErrors;
  const formatted: Partial<Record<keyof T, string>> = {};

  for (const key in fieldErrors) {
    const [msg] = fieldErrors[key] || [];
    if (msg) {
      formatted[key as keyof T] = msg;
    }
  }

  return formatted;
}   

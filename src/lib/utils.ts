import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Safe boolean coercion — avoids Boolean("false") === true footgun */
export const toBool = (v: unknown): boolean => v === true || v === "true" || v === 1;

/** Parse a date string/value safely — returns null instead of Invalid Date */
export function safeDate(val: unknown): Date | null {
  if (!val) return null;
  const d = new Date(val as string);
  return isNaN(d.getTime()) ? null : d;
}

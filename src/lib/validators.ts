import { z } from "zod";

// Reusable regexes
export const NAME_REGEX = /^[A-Za-z][A-Za-z\s'.-]*$/; // letters, spaces, ' . -
export const PHONE_REGEX = /^\+?[0-9\s().-]{7,20}$/;
export const URL_REGEX = /^https?:\/\/[^\s]+\.[^\s]+$/i;
export const INDUSTRY_CODE_REGEX = /^[A-Z0-9]{2,10}$/;
export const SKU_REGEX = /^[A-Za-z0-9-_]{1,32}$/;

// Live-input filters (use inside onChange to block invalid characters as the user types)
export const filterName = (v: string) => v.replace(/[^A-Za-z\s'.-]/g, "").slice(0, 60);
export const filterPhone = (v: string) => v.replace(/[^0-9+\s().-]/g, "").slice(0, 20);
export const filterDigits = (v: string) => v.replace(/[^0-9]/g, "");
export const filterIndustryCode = (v: string) => v.replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 10);
export const filterSku = (v: string) => v.replace(/[^A-Za-z0-9-_]/g, "").slice(0, 32);

// Field schemas
export const emailSchema = z
  .string()
  .trim()
  .min(1, "Email is required")
  .max(255, "Email is too long")
  .email("Please enter a valid email address");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password is too long")
  .regex(/[A-Za-z]/, "Password must contain a letter")
  .regex(/[0-9]/, "Password must contain a number");

export const personNameSchema = z
  .string()
  .trim()
  .min(2, "Name must be at least 2 characters")
  .max(60, "Name is too long")
  .regex(NAME_REGEX, "Name can only contain letters, spaces, apostrophes, hyphens or periods");

export const optionalPersonNameSchema = z
  .string()
  .trim()
  .max(60, "Name is too long")
  .regex(NAME_REGEX, "Name can only contain letters")
  .optional()
  .or(z.literal(""));

export const phoneSchema = z
  .string()
  .trim()
  .regex(PHONE_REGEX, "Enter a valid phone number (digits, +, spaces allowed)");

export const optionalPhoneSchema = z
  .string()
  .trim()
  .regex(PHONE_REGEX, "Enter a valid phone number")
  .optional()
  .or(z.literal(""));

export const urlSchema = z
  .string()
  .trim()
  .regex(URL_REGEX, "Enter a valid URL starting with http:// or https://")
  .max(2048, "URL is too long");

export const optionalUrlSchema = z
  .union([z.literal(""), urlSchema])
  .optional();

export const shopNameSchema = z
  .string()
  .trim()
  .min(2, "Shop name must be at least 2 characters")
  .max(100, "Shop name is too long")
  .regex(/^[A-Za-z0-9][A-Za-z0-9\s&'.,()-]*$/, "Shop name contains invalid characters");

export const productNameSchema = z
  .string()
  .trim()
  .min(2, "Product name must be at least 2 characters")
  .max(120, "Product name is too long")
  .regex(/^[A-Za-z0-9][A-Za-z0-9\s&'.,/()+-]*$/, "Product name contains invalid characters");

export const industryNameSchema = z
  .string()
  .trim()
  .min(2, "Industry name must be at least 2 characters")
  .max(80, "Industry name is too long")
  .regex(/^[A-Za-z][A-Za-z\s&'.,()-]*$/, "Industry name must start with a letter");

export const industryCodeSchema = z
  .string()
  .trim()
  .regex(INDUSTRY_CODE_REGEX, "Code must be 2-10 uppercase letters/digits");

export const priceSchema = z
  .string()
  .trim()
  .refine((v) => v === "" || (!isNaN(Number(v)) && Number(v) >= 0 && Number(v) < 1_000_000_000), {
    message: "Price must be a positive number",
  });

export const descriptionSchema = z
  .string()
  .trim()
  .max(2000, "Description is too long")
  .optional()
  .or(z.literal(""));

export const addressSchema = z
  .string()
  .trim()
  .max(300, "Address is too long")
  .optional()
  .or(z.literal(""));

// Helper to get the first zod error message
export const firstZodError = (err: z.ZodError): string =>
  err.errors[0]?.message ?? "Invalid input";

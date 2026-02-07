import { z } from "zod";
import sanitizeHtml from "sanitize-html";

// Utility function to sanitize HTML
export function sanitizeInput(input: string): string {
  return sanitizeHtml(input, {
    allowedTags: ["b", "i", "em", "strong", "u", "br", "p", "ul", "ol", "li"],
    allowedAttributes: {},
    disallowedTagsMode: "discard",
  });
}

// Post schema for creating/updating posts (journal entries with ratings)
export const postSchema = z.object({
  rating: z
    .number()
    .int()
    .min(1, "Rating must be at least 1")
    .max(5, "Rating must be at most 5"),
  body: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.length <= 5000,
      "Body must be less than 5000 characters"
    )
    .transform((val) => (val ? sanitizeInput(val) : undefined)),
  date: z
    .string()
    .datetime()
    .optional()
    .or(z.date().optional()),
  title: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.length <= 200,
      "Title must be less than 200 characters"
    ),
});

export type PostSchema = z.infer<typeof postSchema>;

// Comment schema for adding comments
export const commentSchema = z.object({
  body: z
    .string()
    .min(1, "Comment cannot be empty")
    .max(2000, "Comment must be less than 2000 characters")
    .transform((val) => sanitizeInput(val)),
});

export type CommentSchema = z.infer<typeof commentSchema>;

// Journal schema for journal entries
export const journalSchema = z.object({
  body: z
    .string()
    .min(1, "Journal entry cannot be empty")
    .max(10000, "Journal entry must be less than 10000 characters")
    .transform((val) => sanitizeInput(val)),
  title: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.length <= 200,
      "Title must be less than 200 characters"
    ),
});

export type JournalSchema = z.infer<typeof journalSchema>;

// Authentication schemas
export const loginSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be less than 30 characters"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password must be less than 100 characters"),
});

export type LoginSchema = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(30, "Username must be less than 30 characters")
      .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores, and hyphens"),
    email: z
      .string()
      .email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(100, "Password must be less than 100 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type RegisterSchema = z.infer<typeof registerSchema>;

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(100, "Password must be less than 100 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .email("Invalid email address"),
});

export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;

export const contactSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  email: z
    .string()
    .email("Invalid email address"),
  subject: z
    .string()
    .min(5, "Subject must be at least 5 characters")
    .max(200, "Subject must be less than 200 characters"),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(5000, "Message must be less than 5000 characters")
    .transform((val) => sanitizeInput(val)),
});

export type ContactSchema = z.infer<typeof contactSchema>;

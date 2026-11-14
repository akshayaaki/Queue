import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(60),
  email: z.string().email("Please enter a valid email address").toLowerCase(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address").toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

export const createQueueSchema = z.object({
  name: z.string().min(2, "Queue name must be at least 2 characters").max(60),
  description: z.string().max(255).optional().nullable(),
  queueCode: z
    .string()
    .min(2, "Queue code must be 2 to 6 characters")
    .max(6, "Queue code maximum is 6 characters")
    .regex(/^[A-Z0-9]+$/, "Queue code must be uppercase alphanumeric (e.g. GEN, BIL, VIP)")
    .transform((val) => val.toUpperCase()),
  capacity: z.number().int().positive().max(1000).optional().nullable(),
});

export const updateQueueSchema = z.object({
  name: z.string().min(2, "Queue name must be at least 2 characters").max(60).optional(),
  description: z.string().max(255).optional().nullable(),
  status: z.enum(["ACTIVE", "PAUSED", "INACTIVE", "ARCHIVED"]).optional(),
  capacity: z.number().int().positive().max(1000).optional().nullable(),
});

export const addCustomerSchema = z.object({
  queueId: z.string().min(1, "Queue is required"),
  customerName: z.string().min(1, "Customer name is required").max(80),
  phone: z.string().max(25).optional().nullable(),
  email: z.string().email("Invalid email format").optional().nullable().or(z.literal("")),
  notes: z.string().max(500).optional().nullable(),
});

export const reorderTokenSchema = z.object({
  tokenId: z.string().min(1, "Token ID is required"),
  direction: z.enum(["UP", "DOWN"]),
});

export const cancelTokenSchema = z.object({
  reason: z.string().max(300).optional().nullable(),
});

export const analyticsQuerySchema = z.object({
  queueId: z.string().optional(),
  period: z.enum(["today", "7days", "30days", "all"]).default("7days"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

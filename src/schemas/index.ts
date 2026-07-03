import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

const strongPassword = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");

export const RegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email"),
  password: strongPassword,
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email("Invalid email"),
});

export const ResetPasswordSchema = z.object({
  password: strongPassword,
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const ContactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email"),
  subject: z.string().min(3, "Subject must be at least 3 characters").max(200),
  message: z.string().min(10, "Message must be at least 10 characters").max(2000),
});

export const PlaceSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  slug: z.string().min(3).max(100).regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers and hyphens"),
  shortDescription: z.string().min(10, "Short description must be at least 10 characters").max(300),
  description: z.string().min(50, "Description must be at least 50 characters"),
  categoryId: z.string().min(1, "Category is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  country: z.string().min(2, "Country is required"),
  address: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  bestTimeToVisit: z.string().optional(),
  entryFee: z.string().optional(),
  openingHours: z.string().optional(),
  travelTips: z.string().optional(),
  thingsToDo: z.string().optional(),
  nearbyAttractions: z.string().optional(),
  featuredImage: z.string().optional(),
});

export const ReviewSchema = z.object({
  rating: z.number().min(1).max(5),
  title: z.string().max(100).optional(),
  body: z.string().min(10, "Review must be at least 10 characters").max(2000),
  images: z.array(z.string()).optional(),
});

export const QuestionSchema = z.object({
  body: z.string().min(5, "Question must be at least 5 characters").max(300),
});

export const AnswerSchema = z.object({
  body: z.string().min(1, "Answer can't be empty").max(1000),
});

export const ProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  bio: z.string().max(500).optional(),
  image: z.string().url().optional().or(z.literal("")),
});

export const CategorySchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  icon: z.string().optional(),
  image: z.string().optional(),
});

export const RedemptionSchema = z.object({
  rewardId: z.string().min(1),
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(7, "Valid phone number required").max(15),
  houseNumber: z.string().optional(),
  streetAddress: z.string().min(3, "Street address is required"),
  landmark: z.string().optional(),
  area: z.string().optional(),
  city: z.string().min(2, "City is required"),
  district: z.string().optional(),
  state: z.string().min(2, "State is required"),
  country: z.string().min(2, "Country is required"),
  postalCode: z.string().min(4, "Postal code is required").max(10),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  preferredDeliveryTime: z.string().optional(),
  deliveryInstructions: z.string().max(500).optional(),
});

export const TripPlannerSchema = z.object({
  prompt: z.string().min(10, "Tell us a bit more about your trip").max(500, "Keep it under 500 characters"),
});

export const AiSettingsSchema = z.object({
  tripPlannerEnabled: z.boolean(),
  chatbotEnabled: z.boolean(),
  unavailableMessage: z.string().min(1).max(500),
  cacheEnabled: z.boolean(),
  cacheDurationDays: z.number().int().min(1).max(365),
});

export const ApiServiceSchema = z.object({
  enabled: z.boolean(),
  dailyLimit: z.number().int().min(1).optional().nullable(),
  monthlyLimit: z.number().int().min(1).optional().nullable(),
  warningThresholdPct: z.number().int().min(1).max(100),
  maintenanceMessage: z.string().max(500).optional().nullable(),
});

export const ChatMessageSchema = z.object({
  message: z.string().min(1, "Message can't be empty").max(1000),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "model"]),
        content: z.string(),
      })
    )
    .max(20),
});

export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type PlaceInput = z.infer<typeof PlaceSchema>;
export type ReviewInput = z.infer<typeof ReviewSchema>;
export type QuestionInput = z.infer<typeof QuestionSchema>;
export type AnswerInput = z.infer<typeof AnswerSchema>;
export type ProfileInput = z.infer<typeof ProfileSchema>;
export type CategoryInput = z.infer<typeof CategorySchema>;
export type TripPlannerInput = z.infer<typeof TripPlannerSchema>;
export type AiSettingsInput = z.infer<typeof AiSettingsSchema>;
export type ApiServiceInput = z.infer<typeof ApiServiceSchema>;
export type ChatMessageInput = z.infer<typeof ChatMessageSchema>;

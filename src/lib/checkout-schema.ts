import { z } from "zod";

export const phoneDigits = (s: string) => s.replace(/\D/g, "");

function refineContactInfo(contactInfo: string, ctx: z.RefinementCtx) {
  const raw = contactInfo.trim();
  if (raw.includes("@")) {
    const ok = z.string().email().safeParse(raw).success;
    if (!ok) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["contactInfo"],
        message: "Enter a valid email address",
      });
    }
  } else if (phoneDigits(raw).length < 10) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["contactInfo"],
      message: "Enter a valid phone number or email",
    });
  }
}

const deliveryFields = {
  firstName: z.string().max(120).optional(),
  lastName: z.string().min(1, "Last name is required").max(120),
  address: z.string().min(5, "Enter a full street address").max(500),
  apartment: z.string().max(200).optional(),
  city: z.string().min(2, "City is required").max(120),
  postalCode: z.string().max(32).optional(),
  phone: z
    .string()
    .min(7, "Phone is required")
    .max(40)
    .refine((s) => phoneDigits(s).length >= 10, "Enter a valid phone number"),
};

/** Step 1 — contact only (multi-step checkout). */
export const checkoutStep1Schema = z
  .object({
    contactInfo: z.string().min(3, "Enter an email or phone number").max(200),
  })
  .superRefine((data, ctx) => refineContactInfo(data.contactInfo, ctx));

/** Step 2 — shipping address + phone. */
export const checkoutStep2Schema = z.object(deliveryFields);

export const checkoutFormSchema = z
  .object({
    contactInfo: z.string().min(3, "Enter an email or phone number").max(200),
    ...deliveryFields,
  })
  .superRefine((data, ctx) => refineContactInfo(data.contactInfo, ctx));

export type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

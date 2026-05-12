"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { ZodError } from "zod";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronRight,
  CreditCard,
  Loader2,
  ShieldCheck,
  Sparkles,
  Truck,
  WandSparkles,
} from "lucide-react";
import toast from "react-hot-toast";
import { useCartStore } from "@/store/cart-store";
import { useAuthStore } from "@/store/auth-store";
import { formatPrice } from "@/lib/utils";
import { api } from "@/lib/api-client";
import { SshubMark } from "@/components/brand/SshubMark";
import { SshubWordmark } from "@/components/brand/SshubWordmark";
import {
  checkoutFormSchema,
  checkoutStep1Schema,
  checkoutStep2Schema,
} from "@/lib/checkout-schema";

type CheckoutDraft = {
  contactInfo: string;
  firstName: string;
  lastName: string;
  address: string;
  apartment: string;
  city: string;
  postalCode: string;
  phone: string;
};

const CHECKOUT_DRAFT_KEY = "sshub-checkout-draft-v1";
const TOTAL_STEPS = 3;

function collectFieldErrors(err: ZodError) {
  const next: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !next[key]) next[key] = issue.message;
  }
  return next;
}

export function CheckoutClient() {
  const router = useRouter();
  const cart = useCartStore((s) => s.cart);
  const clearCart = useCartStore((s) => s.clearCart);
  const user = useAuthStore((s) => s.user);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [contactInfo, setContactInfo] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [apartment, setApartment] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [phone, setPhone] = useState("");

  const items = cart?.items ?? [];
  const subtotal = cart?.cost?.subtotalAmount?.amount || 0;
  const shippingCost = 0;
  const total = Number(subtotal) + shippingCost;

  useEffect(() => {
    if (cart && items.length === 0) {
      router.replace("/shop");
    }
  }, [cart, items.length, router]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CHECKOUT_DRAFT_KEY);
      if (!raw) return;
      const draft = JSON.parse(raw) as Partial<CheckoutDraft>;
      if (draft.contactInfo) setContactInfo(draft.contactInfo);
      if (draft.firstName) setFirstName(draft.firstName);
      if (draft.lastName) setLastName(draft.lastName);
      if (draft.address) setAddress(draft.address);
      if (draft.apartment) setApartment(draft.apartment);
      if (draft.city) setCity(draft.city);
      if (draft.postalCode) setPostalCode(draft.postalCode);
      if (draft.phone) setPhone(draft.phone);
    } catch {
      // Ignore malformed localStorage data.
    }
  }, []);

  useEffect(() => {
    const draft: CheckoutDraft = {
      contactInfo,
      firstName,
      lastName,
      address,
      apartment,
      city,
      postalCode,
      phone,
    };
    localStorage.setItem(CHECKOUT_DRAFT_KEY, JSON.stringify(draft));
  }, [contactInfo, firstName, lastName, address, apartment, city, postalCode, phone]);

  const applyAccountAutofill = () => {
    if (!user) return;
    if (user.email && !contactInfo) setContactInfo(user.email);
    if (user.phoneNumber && !phone) setPhone(user.phoneNumber);
    if (user.displayName) {
      const [first = "", ...rest] = user.displayName.split(" ");
      if (!firstName && first) setFirstName(first);
      if (!lastName && rest.length > 0) setLastName(rest.join(" "));
    }
    toast.success("Autofill applied from your account profile.");
  };

  const contactAutocomplete =
    contactInfo.trim().includes("@") ? "email" : "username";

  const goNext = () => {
    setFieldErrors({});
    if (step === 1) {
      const parsed = checkoutStep1Schema.safeParse({ contactInfo });
      if (!parsed.success) {
        setFieldErrors(collectFieldErrors(parsed.error));
        toast.error("Please fix the highlighted fields.");
        return;
      }
      setStep(2);
      return;
    }
    if (step === 2) {
      const parsed = checkoutStep2Schema.safeParse({
        firstName: firstName || undefined,
        lastName,
        address,
        apartment: apartment || undefined,
        city,
        postalCode: postalCode || undefined,
        phone,
      });
      if (!parsed.success) {
        setFieldErrors(collectFieldErrors(parsed.error));
        toast.error("Please fix the highlighted fields.");
        return;
      }
      setStep(3);
    }
  };

  const goBack = () => {
    setFieldErrors({});
    setStep((s) => Math.max(1, s - 1));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    setFieldErrors({});
    const parsed = checkoutFormSchema.safeParse({
      contactInfo,
      firstName: firstName || undefined,
      lastName,
      address,
      apartment: apartment || undefined,
      city,
      postalCode: postalCode || undefined,
      phone,
    });
    if (!parsed.success) {
      setFieldErrors(collectFieldErrors(parsed.error));
      toast.error("Please fix the highlighted fields.");
      const firstPath = parsed.error.issues[0]?.path[0];
      if (firstPath === "contactInfo") setStep(1);
      else setStep(2);
      return;
    }

    setIsSubmitting(true);

    try {
      const orderItems = items.map((item) => ({
        variantId: item.variant_id,
        productTitle: item.product_title,
        variantTitle: item.variant_title,
        price: item.price,
        quantity: item.quantity,
        imageUrl: item.image_url,
      }));

      const v = parsed.data;
      const customerName = [v.firstName, v.lastName].filter(Boolean).join(" ").trim() || v.lastName;

      const contactTrim = v.contactInfo.trim();
      const emailFromContact = contactTrim.includes("@") ? contactTrim : "";
      const looksLikeEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailFromContact);
      const customerEmail = (looksLikeEmail ? emailFromContact : (user?.email ?? "")).trim();

      const payload = {
        customerName,
        customerEmail,
        customerPhone: v.phone || (!contactTrim.includes("@") ? contactTrim : ""),
        address: [v.address, v.apartment].filter(Boolean).join(", "),
        city: v.city,
        postalCode: v.postalCode,
        country: "Pakistan",
        items: orderItems,
      };

      const order = await api.orders.create(payload);
      const receiptToken =
        typeof order.receiptToken === "string" && order.receiptToken.length > 0
          ? order.receiptToken
          : "";

      clearCart();
      localStorage.removeItem(CHECKOUT_DRAFT_KEY);

      if (!receiptToken) {
        toast.error(
          "Order was created but the receipt link is unavailable. Check your email or contact support.",
        );
        setIsSubmitting(false);
        return;
      }

      toast.success("Order placed successfully!");
      router.push(`/checkout/success?receipt=${encodeURIComponent(receiptToken)}`);
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (!cart || items.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold">Your bag is empty</h1>
          <Link href="/shop" className="btn-primary">
            Return to Shop
          </Link>
        </div>
      </div>
    );
  }

  const stepLabels = ["Contact", "Delivery", "Review & pay"];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/10 bg-zinc-950/80 px-6 py-6 backdrop-blur-md lg:px-12">
        <Link href="/" className="flex items-center gap-2 no-underline">
          <SshubMark size={32} className="rounded-full" />
          <SshubWordmark variant="drawer" className="text-2xl sm:text-[1.4rem]" />
        </Link>
        <div className="hidden items-center gap-2 rounded-full border border-brand-400/40 bg-brand-500/10 px-4 py-2 text-xs text-brand-200 sm:flex">
          <Sparkles className="h-3.5 w-3.5" />
          Secure checkout · Step {step} of {TOTAL_STEPS}
        </div>
      </header>

      <div className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute -top-24 left-0 h-72 w-72 rounded-full bg-brand-500/20 blur-3xl"
          style={{ animation: "float-gentle 8s ease-in-out infinite" }}
        />
        <div
          className="pointer-events-none absolute top-20 right-0 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl"
          style={{ animation: "float-gentle 10s ease-in-out 0.4s infinite" }}
        />
      </div>

      <div className="mx-auto flex max-w-7xl flex-col-reverse lg:flex-row">
        <div className="flex-1 px-6 py-10 lg:px-12 lg:py-16">
          <form
            onSubmit={step === 3 ? handleSubmit : (e) => e.preventDefault()}
            className="animate-fade-slide-up mx-auto max-w-xl space-y-8 rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-[0_30px_80px_rgba(2,6,23,0.55)] backdrop-blur-xl sm:p-8 lg:mx-0"
          >
            {/* Progress */}
            <div className="space-y-3">
              <div className="flex h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="bg-gradient-to-r from-brand-500 to-blue-500 transition-all duration-300 ease-out"
                  style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
                />
              </div>
              <ol className="flex flex-wrap justify-between gap-2 text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                {stepLabels.map((label, i) => {
                  const n = i + 1;
                  const active = step === n;
                  const done = step > n;
                  return (
                    <li
                      key={label}
                      className={
                        active
                          ? "text-brand-300"
                          : done
                            ? "text-zinc-300"
                            : "text-zinc-600"
                      }
                    >
                      {n}. {label}
                    </li>
                  );
                })}
              </ol>
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                { icon: Truck, label: "Fast delivery" },
                { icon: CreditCard, label: "COD available" },
                { icon: ShieldCheck, label: "Protected checkout" },
              ].map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs text-zinc-200"
                >
                  <Icon className="h-3.5 w-3.5 text-brand-300" />
                  {label}
                </span>
              ))}
            </div>

            {step === 1 && (
              <section aria-labelledby="checkout-step-contact">
                <h2 id="checkout-step-contact" className="mb-4 text-xl font-semibold text-white">
                  Contact
                </h2>
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="checkout-contact"
                      className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-300"
                    >
                      Email or mobile phone number
                    </label>
                    <input
                      id="checkout-contact"
                      type="text"
                      required
                      placeholder="Enter email or phone"
                      value={contactInfo}
                      onChange={(e) => setContactInfo(e.target.value)}
                      autoComplete={contactAutocomplete}
                      disabled={isSubmitting}
                      aria-invalid={fieldErrors.contactInfo ? true : undefined}
                      aria-describedby={fieldErrors.contactInfo ? "checkout-contact-error" : undefined}
                      className="w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-sm text-zinc-100 outline-none transition-all placeholder:text-zinc-500 focus:border-brand-400 focus:ring-2 focus:ring-brand-500/30 disabled:opacity-60"
                    />
                    {fieldErrors.contactInfo && (
                      <p id="checkout-contact-error" className="mt-1 text-xs text-red-400" role="alert">
                        {fieldErrors.contactInfo}
                      </p>
                    )}
                  </div>
                  {user && (
                    <button
                      type="button"
                      onClick={applyAccountAutofill}
                      className="inline-flex items-center gap-2 rounded-xl border border-brand-400/40 bg-brand-500/15 px-3 py-2 text-xs font-medium text-brand-100 transition hover:bg-brand-500/25"
                    >
                      <WandSparkles className="h-4 w-4" />
                      Autofill from account
                    </button>
                  )}
                </div>
              </section>
            )}

            {step === 2 && (
              <section aria-labelledby="checkout-step-delivery">
                <h2 id="checkout-step-delivery" className="mb-4 text-xl font-semibold text-white">
                  Delivery
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-300">
                      Country/Region
                    </label>
                    <select
                      disabled
                      className="w-full appearance-none rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-sm text-zinc-400"
                    >
                      <option>Pakistan</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-300">
                        First name (optional)
                      </label>
                      <input
                        type="text"
                        placeholder="Enter first name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        autoComplete="given-name"
                        className="w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-sm text-zinc-100 outline-none transition-all placeholder:text-zinc-500 focus:border-brand-400 focus:ring-2 focus:ring-brand-500/30"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="checkout-lastname"
                        className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-300"
                      >
                        Last name
                      </label>
                      <input
                        id="checkout-lastname"
                        type="text"
                        required
                        placeholder="Enter last name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        autoComplete="family-name"
                        disabled={isSubmitting}
                        aria-invalid={fieldErrors.lastName ? true : undefined}
                        aria-describedby={fieldErrors.lastName ? "checkout-lastname-error" : undefined}
                        className="w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-sm text-zinc-100 outline-none transition-all placeholder:text-zinc-500 focus:border-brand-400 focus:ring-2 focus:ring-brand-500/30 disabled:opacity-60"
                      />
                      {fieldErrors.lastName && (
                        <p id="checkout-lastname-error" className="mt-1 text-xs text-red-400" role="alert">
                          {fieldErrors.lastName}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="checkout-address"
                      className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-300"
                    >
                      Address
                    </label>
                    <input
                      id="checkout-address"
                      type="text"
                      required
                      placeholder="Enter street address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      autoComplete="street-address"
                      disabled={isSubmitting}
                      aria-invalid={fieldErrors.address ? true : undefined}
                      aria-describedby={fieldErrors.address ? "checkout-address-error" : undefined}
                      className="w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-sm text-zinc-100 outline-none transition-all placeholder:text-zinc-500 focus:border-brand-400 focus:ring-2 focus:ring-brand-500/30 disabled:opacity-60"
                    />
                    {fieldErrors.address && (
                      <p id="checkout-address-error" className="mt-1 text-xs text-red-400" role="alert">
                        {fieldErrors.address}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-300">
                      Apartment, suite, etc. (optional)
                    </label>
                    <input
                      type="text"
                      placeholder="Apartment, suite, etc."
                      value={apartment}
                      onChange={(e) => setApartment(e.target.value)}
                      autoComplete="address-line2"
                      className="w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-sm text-zinc-100 outline-none transition-all placeholder:text-zinc-500 focus:border-brand-400 focus:ring-2 focus:ring-brand-500/30"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="checkout-city"
                        className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-300"
                      >
                        City
                      </label>
                      <input
                        id="checkout-city"
                        type="text"
                        required
                        placeholder="Enter city"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        autoComplete="address-level2"
                        disabled={isSubmitting}
                        aria-invalid={fieldErrors.city ? true : undefined}
                        aria-describedby={fieldErrors.city ? "checkout-city-error" : undefined}
                        className="w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-sm text-zinc-100 outline-none transition-all placeholder:text-zinc-500 focus:border-brand-400 focus:ring-2 focus:ring-brand-500/30 disabled:opacity-60"
                      />
                      {fieldErrors.city && (
                        <p id="checkout-city-error" className="mt-1 text-xs text-red-400" role="alert">
                          {fieldErrors.city}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-300">
                        Postal code (optional)
                      </label>
                      <input
                        type="text"
                        placeholder="Enter postal code"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        autoComplete="postal-code"
                        className="w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-sm text-zinc-100 outline-none transition-all placeholder:text-zinc-500 focus:border-brand-400 focus:ring-2 focus:ring-brand-500/30"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="checkout-phone"
                      className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-300"
                    >
                      Phone
                    </label>
                    <input
                      id="checkout-phone"
                      type="tel"
                      required
                      placeholder="Enter phone number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      autoComplete="tel"
                      disabled={isSubmitting}
                      aria-invalid={fieldErrors.phone ? true : undefined}
                      aria-describedby={fieldErrors.phone ? "checkout-phone-error" : undefined}
                      className="w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-sm text-zinc-100 outline-none transition-all placeholder:text-zinc-500 focus:border-brand-400 focus:ring-2 focus:ring-brand-500/30 disabled:opacity-60"
                    />
                    {fieldErrors.phone && (
                      <p id="checkout-phone-error" className="mt-1 text-xs text-red-400" role="alert">
                        {fieldErrors.phone}
                      </p>
                    )}
                  </div>
                </div>
              </section>
            )}

            {step === 3 && (
              <>
                <section className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                  <h2 className="text-lg font-semibold text-white">Order details</h2>
                  <dl className="space-y-3 text-sm text-zinc-300">
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Contact</dt>
                      <dd className="mt-1 text-zinc-100">{contactInfo}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Ship to</dt>
                      <dd className="mt-1 text-zinc-100">
                        {[firstName, lastName].filter(Boolean).join(" ")}
                        <br />
                        {[address, apartment].filter(Boolean).join(", ")}
                        <br />
                        {city}
                        {postalCode ? `, ${postalCode}` : ""}
                        <br />
                        Pakistan
                        <br />
                        <span className="text-zinc-400">Phone:</span> {phone}
                      </dd>
                    </div>
                  </dl>
                </section>

                <section>
                  <h2 className="mb-4 text-xl font-semibold text-white">Shipping method</h2>
                  <div className="flex items-center justify-between rounded-xl border border-brand-400/35 bg-brand-500/10 p-4">
                    <span className="text-sm text-zinc-100">Standard Express</span>
                    <span className="text-sm font-semibold text-brand-200">FREE</span>
                  </div>
                </section>

                <section>
                  <h2 className="mb-1 text-xl font-semibold text-white">Payment</h2>
                  <p className="mb-4 text-sm text-zinc-400">All transactions are secure and encrypted.</p>
                  <div className="rounded-xl border border-brand-400/35 bg-brand-500/10 p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-4 w-4 rounded-full border-[5px] border-brand-400 bg-zinc-950" />
                      <span className="text-sm font-medium text-zinc-100">Cash on Delivery (COD)</span>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="mb-4 text-xl font-semibold text-white">Billing address</h2>
                  <div className="rounded-xl border border-brand-400/35 bg-brand-500/10 p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-4 w-4 rounded-full border-[5px] border-brand-400 bg-zinc-950" />
                      <span className="text-sm text-zinc-100">Same as shipping address</span>
                    </div>
                  </div>
                </section>

                <div className="rounded-xl border border-white/10 bg-blue-500/10 p-4 text-sm text-blue-100">
                  <div className="flex gap-3">
                    <ShieldCheck className="h-5 w-5 shrink-0 text-blue-300" />
                    <p>
                      <strong className="text-white">Secure payment.</strong> Pay when your order arrives. Free
                      standard delivery on this order.
                    </p>
                  </div>
                </div>
              </>
            )}

            <div className="flex flex-col justify-between gap-4 border-t border-white/10 pt-4 sm:flex-row sm:items-center">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={goBack}
                  disabled={isSubmitting}
                  className="order-2 inline-flex items-center gap-1 text-sm text-brand-300 hover:text-brand-200 disabled:opacity-50 sm:order-1"
                >
                  <ChevronRight className="h-4 w-4 rotate-180" />
                  Back
                </button>
              ) : (
                <Link
                  href="/cart"
                  className="order-2 hidden items-center gap-1 text-sm text-brand-300 hover:text-brand-200 sm:order-1 sm:flex"
                >
                  <ChevronRight className="h-4 w-4 rotate-180" />
                  Return to cart
                </Link>
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={goNext}
                  className="order-1 w-full rounded-xl bg-gradient-to-r from-brand-500 to-blue-500 px-8 py-4 text-base font-semibold text-zinc-950 shadow-[0_10px_40px_rgba(59,130,246,0.45)] transition-all hover:brightness-110 sm:order-2 sm:w-auto"
                >
                  Continue
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="order-1 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-blue-500 px-8 py-4 text-base font-semibold text-zinc-950 shadow-[0_10px_40px_rgba(59,130,246,0.45)] transition-all hover:brightness-110 disabled:opacity-70 sm:order-2 sm:w-auto"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                      Processing…
                    </>
                  ) : (
                    "Complete order"
                  )}
                </button>
              )}
            </div>

            {step === 1 && (
              <div className="flex justify-center sm:hidden">
                <Link href="/cart" className="inline-flex items-center gap-1 text-sm text-brand-300 hover:text-brand-200">
                  <ChevronRight className="h-4 w-4 rotate-180" />
                  Return to cart
                </Link>
              </div>
            )}
          </form>

          <div className="mx-auto mt-12 flex max-w-xl flex-wrap justify-center gap-4 border-t border-white/10 pt-6 text-xs text-brand-300 sm:justify-start lg:mx-0">
            <Link href="/about" className="hover:text-brand-200">
              Policies &amp; story
            </Link>
            <Link href="/shop" className="hover:text-brand-200">
              Shop
            </Link>
            <Link href="/search" className="hover:text-brand-200">
              Search
            </Link>
          </div>
        </div>

        <div className="border-l border-white/10 bg-white/[0.02] px-6 py-10 lg:w-[45%] lg:px-12 lg:py-16">
          <div className="mx-auto max-w-md lg:mx-0 lg:sticky lg:top-10">
            <div
              className="animate-fade-slide-up mb-6 rounded-2xl border border-white/10 bg-white/[0.04] p-5"
              style={{ animationDelay: "0.1s" }}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-zinc-300">Order summary</p>
                <span className="inline-flex items-center gap-1 rounded-full border border-brand-400/30 bg-brand-500/15 px-2.5 py-1 text-[11px] text-brand-200">
                  <Sparkles className="h-3.5 w-3.5" />
                  {TOTAL_STEPS}-step checkout
                </span>
              </div>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-white">
                {formatPrice(String(total), "PKR")}
              </p>
            </div>

            <ul className="mb-6 space-y-4">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="animate-fade-slide-up flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-3"
                >
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-white/15 bg-zinc-900">
                    {item.image_url && (
                      <Image
                        src={item.image_url}
                        alt={item.product_title}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    )}
                    <div className="absolute -right-2 -top-2 z-10 flex h-5 w-5 items-center justify-center rounded-full border border-zinc-900 bg-brand-500 text-[11px] font-bold text-zinc-900">
                      {item.quantity}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-zinc-100">{item.product_title}</p>
                    {item.variant_title && item.variant_title !== "Default Title" && (
                      <p className="mt-0.5 truncate text-xs text-zinc-400">{item.variant_title}</p>
                    )}
                  </div>
                  <div className="text-sm font-medium text-zinc-100">
                    {formatPrice(String(item.price * item.quantity), "PKR")}
                  </div>
                </li>
              ))}
            </ul>

            <div className="space-y-3 border-t border-white/10 py-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-400">Subtotal</span>
                <span className="font-medium text-zinc-100">{formatPrice(String(subtotal), "PKR")}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-400">Shipping</span>
                <span className="text-xs font-medium uppercase text-brand-200">Free</span>
              </div>
            </div>

            <div className="border-t border-white/10 py-4">
              <div className="flex items-center justify-between">
                <span className="text-lg font-medium text-zinc-100">Total</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase text-zinc-400">PKR</span>
                  <span className="text-2xl font-semibold text-white">{formatPrice(String(total), "PKR")}</span>
                </div>
              </div>
            </div>

            <div className="mt-8 flex gap-3 rounded-xl border border-blue-400/25 bg-blue-500/10 p-4 text-blue-100">
              <ShieldCheck className="h-5 w-5 shrink-0 text-blue-300" />
              <p className="text-sm">
                Safe checkout. You pay on delivery — no card required for COD orders.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutClient;

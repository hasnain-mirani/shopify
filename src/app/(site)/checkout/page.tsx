"use client";

import { useState, FormEvent, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart-store";
import { useAuthStore } from "@/store/auth-store";
import { formatPrice } from "@/lib/utils";
import { api } from "@/lib/api-client";
import toast from "react-hot-toast";
import { ChevronRight, ShieldCheck, Sparkles, Truck, CreditCard, WandSparkles } from "lucide-react";
import Link from "next/link";

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

export default function CheckoutPage() {
  const router = useRouter();
  const cart = useCartStore((s) => s.cart);
  const clearCart = useCartStore((s) => s.clearCart);
  const user = useAuthStore((s) => s.user);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [contactInfo, setContactInfo] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [apartment, setApartment] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [phone, setPhone] = useState("");

  const items = cart?.items || [];
  const subtotal = cart?.cost?.subtotalAmount?.amount || 0;
  const shippingCost = 0;
  const total = Number(subtotal) + shippingCost;

  useEffect(() => {
    // If the cart is empty, redirect back to shop
    if (cart && items.length === 0) {
      router.replace("/shop");
    }
  }, [cart, items, router]);

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    setIsSubmitting(true);

    try {
      // Map cart items to the format the backend expects
      const orderItems = items.map((item) => ({
        variantId: item.variant_id,
        productTitle: item.product_title,
        variantTitle: item.variant_title,
        price: item.price,
        quantity: item.quantity,
        imageUrl: item.image_url,
      }));

      // Combine first and last name
      const customerName = [firstName, lastName].filter(Boolean).join(" ");

      // Shopper email: contact field may be phone-only — prefer real address, fall back to signed-in Firebase email
      const contactTrim = contactInfo.trim();
      const emailFromContact = contactTrim.includes("@") ? contactTrim : "";
      const looksLikeEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailFromContact);
      const customerEmail = (looksLikeEmail ? emailFromContact : (user?.email ?? "")).trim();

      // The backend has customerName, customerEmail, customerPhone, address, city, postalCode, country
      const payload = {
        customerName,
        customerEmail,
        customerPhone: phone || (!contactTrim.includes("@") ? contactTrim : ""),
        address: [address, apartment].filter(Boolean).join(", "),
        city,
        postalCode,
        country: "Pakistan",
        items: orderItems,
      };

      const order = await api.orders.create(payload);
      
      // Clear cart locally
      clearCart();
      localStorage.removeItem(CHECKOUT_DRAFT_KEY);
      
      toast.success("Order placed successfully!");
      router.push(`/checkout/success?orderId=${order.id}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to place order. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (!cart || items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Your bag is empty</h1>
          <Link href="/shop" className="btn-primary">Return to Shop</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Checkout Header */}
      <header className="border-b border-white/10 py-6 px-6 lg:px-12 flex justify-between items-center bg-zinc-950/80 backdrop-blur-md sticky top-0 z-30">
        <Link href="/" className="text-2xl font-bold tracking-tight text-white font-outfit flex items-center gap-2">
          <span className="h-8 w-8 rounded-full bg-brand-500 flex items-center justify-center text-zinc-900">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </span>
          SSHUB.STORE
        </Link>
        <div className="hidden sm:flex items-center gap-2 rounded-full border border-brand-400/40 bg-brand-500/10 px-4 py-2 text-xs text-brand-200">
          <Sparkles className="h-3.5 w-3.5" />
          Secure Express Checkout
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

      <div className="max-w-7xl mx-auto flex flex-col-reverse lg:flex-row">
        {/* Left Column: Form */}
        <div className="flex-1 px-6 py-10 lg:px-12 lg:py-16">
          <form
            onSubmit={handleSubmit}
            className="max-w-xl mx-auto lg:mx-0 space-y-8 rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8 backdrop-blur-xl shadow-[0_30px_80px_rgba(2,6,23,0.55)] animate-fade-slide-up"
          >
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

            {/* Contact */}
            <section>
              <h2 className="text-xl font-semibold mb-4 text-white">Contact</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">Email or mobile phone number</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter email or phone"
                    value={contactInfo}
                    onChange={(e) => setContactInfo(e.target.value)}
                    autoComplete="email tel"
                    className="w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-brand-400 focus:ring-2 focus:ring-brand-500/30 outline-none transition-all"
                  />
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

            {/* Delivery */}
            <section>
              <h2 className="text-xl font-semibold mb-4 text-white">Delivery</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">Country/Region</label>
                  <select
                    disabled
                    className="w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-sm appearance-none text-zinc-400"
                  >
                    <option>Pakistan</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">First name (optional)</label>
                    <input
                      type="text"
                      placeholder="Enter first name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      autoComplete="given-name"
                      className="w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-brand-400 focus:ring-2 focus:ring-brand-500/30 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">Last name</label>
                    <input
                      type="text"
                      required
                      placeholder="Enter last name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      autoComplete="family-name"
                      className="w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-brand-400 focus:ring-2 focus:ring-brand-500/30 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">Address</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter street address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    autoComplete="street-address"
                    className="w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-brand-400 focus:ring-2 focus:ring-brand-500/30 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">Apartment, suite, etc. (optional)</label>
                  <input
                    type="text"
                    placeholder="Apartment, suite, etc."
                    value={apartment}
                    onChange={(e) => setApartment(e.target.value)}
                    autoComplete="address-line2"
                    className="w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-brand-400 focus:ring-2 focus:ring-brand-500/30 outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">City</label>
                    <input
                      type="text"
                      required
                      placeholder="Enter city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      autoComplete="address-level2"
                      className="w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-brand-400 focus:ring-2 focus:ring-brand-500/30 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">Postal code (optional)</label>
                    <input
                      type="text"
                      placeholder="Enter postal code"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      autoComplete="postal-code"
                      className="w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-brand-400 focus:ring-2 focus:ring-brand-500/30 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">Phone</label>
                  <input
                    type="tel"
                    required
                    placeholder="Enter phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    autoComplete="tel"
                    className="w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-brand-400 focus:ring-2 focus:ring-brand-500/30 outline-none transition-all"
                  />
                </div>
              </div>
            </section>

            {/* Shipping Method */}
            <section>
              <h2 className="text-xl font-semibold mb-4 text-white">Shipping method</h2>
              <div className="rounded-xl border border-brand-400/35 bg-brand-500/10 p-4 flex justify-between items-center">
                <span className="text-sm text-zinc-100">Standard Express</span>
                <span className="text-sm font-semibold text-brand-200">FREE</span>
              </div>
            </section>

            {/* Payment */}
            <section>
              <h2 className="text-xl font-semibold mb-1 text-white">Payment</h2>
              <p className="text-sm text-zinc-400 mb-4">All transactions are secure and encrypted.</p>
              <div className="rounded-xl border border-brand-400/35 bg-brand-500/10 p-4">
                <div className="flex items-center gap-3">
                  <div className="h-4 w-4 rounded-full border-[5px] border-brand-400 bg-zinc-950" />
                  <span className="text-sm text-zinc-100 font-medium">Cash on Delivery (COD)</span>
                </div>
              </div>
            </section>

            {/* Billing address */}
            <section>
              <h2 className="text-xl font-semibold mb-4 text-white">Billing address</h2>
              <div className="rounded-xl border border-brand-400/35 bg-brand-500/10 p-4">
                <div className="flex items-center gap-3">
                  <div className="h-4 w-4 rounded-full border-[5px] border-brand-400 bg-zinc-950" />
                  <span className="text-sm text-zinc-100">Same as shipping address</span>
                </div>
              </div>
            </section>

            {/* Submit */}
            <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-white/10">
              <Link href="/cart" className="text-brand-300 hover:text-brand-200 flex items-center text-sm gap-1 hidden sm:flex">
                <ChevronRight className="h-4 w-4 rotate-180" />
                Return to cart
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-brand-500 to-blue-500 hover:brightness-110 text-zinc-950 rounded-xl font-semibold text-base transition-all disabled:opacity-70 flex justify-center shadow-[0_10px_40px_rgba(59,130,246,0.45)]"
              >
                {isSubmitting ? "Processing..." : "Complete order"}
              </button>
            </div>
            
            <div className="flex justify-center sm:hidden mt-4">
              <Link href="/cart" className="text-brand-300 hover:text-brand-200 flex items-center text-sm gap-1">
                <ChevronRight className="h-4 w-4 rotate-180" />
                Return to cart
              </Link>
            </div>
          </form>
          
          <div className="mt-12 max-w-xl mx-auto lg:mx-0 border-t border-white/10 pt-6 flex flex-wrap gap-4 text-xs text-brand-300 justify-center sm:justify-start">
            <a href="#">Refund policy</a>
            <a href="#">Shipping</a>
            <a href="#">Privacy policy</a>
            <a href="#">Terms of service</a>
            <a href="#">Contact</a>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:w-[45%] bg-white/[0.02] border-l border-white/10 px-6 py-10 lg:px-12 lg:py-16">
          <div className="max-w-md mx-auto lg:mx-0 sticky top-10">
            <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.04] p-5 animate-fade-slide-up" style={{ animationDelay: "0.1s" }}>
              <div className="flex items-center justify-between">
                <p className="text-sm text-zinc-300">Order summary</p>
                <span className="inline-flex items-center gap-1 rounded-full bg-brand-500/15 px-2.5 py-1 text-[11px] text-brand-200 border border-brand-400/30">
                  <Sparkles className="h-3.5 w-3.5" />
                  Premium checkout
                </span>
              </div>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-white">
                {formatPrice(String(total), "PKR")}
              </p>
            </div>

            <ul className="space-y-4 mb-6">
              {items.map((item) => (
                <li key={item.id} className="flex gap-4 items-center rounded-2xl border border-white/10 bg-white/[0.03] p-3 animate-fade-slide-up">
                  <div className="relative h-16 w-16 shrink-0 rounded-lg border border-white/15 bg-zinc-900 overflow-hidden">
                    {item.image_url && (
                      <Image
                        src={item.image_url}
                        alt={item.product_title}
                        fill
                        className="object-cover"
                      />
                    )}
                    <div className="absolute -top-2 -right-2 bg-brand-500 text-zinc-900 text-[11px] font-bold h-5 w-5 rounded-full flex items-center justify-center border border-zinc-900 z-10">
                      {item.quantity}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-100 truncate">
                      {item.product_title}
                    </p>
                    {item.variant_title && item.variant_title !== "Default Title" && (
                      <p className="text-xs text-zinc-400 truncate mt-0.5">{item.variant_title}</p>
                    )}
                  </div>
                  <div className="text-sm text-zinc-100 font-medium">
                    {formatPrice(String(item.price * item.quantity), "PKR")}
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t border-white/10 py-4 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-400">Subtotal</span>
                <span className="text-zinc-100 font-medium">{formatPrice(String(subtotal), "PKR")}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-400">Shipping</span>
                <span className="text-brand-200 font-medium uppercase text-xs">Free</span>
              </div>
            </div>

            <div className="border-t border-white/10 py-4">
              <div className="flex justify-between items-center">
                <span className="text-lg text-zinc-100 font-medium">Total</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400 uppercase">PKR</span>
                  <span className="text-2xl text-white font-semibold">{formatPrice(String(total), "PKR").replace("Rs ", "Rs ")}</span>
                </div>
              </div>
            </div>
            
            <div className="mt-8 bg-blue-500/10 border border-blue-400/25 p-4 rounded-xl flex gap-3 text-blue-100">
              <ShieldCheck className="h-5 w-5 shrink-0 text-blue-300" />
              <p className="text-sm">Safe and secure checkout. You only pay when the package arrives at your doorstep.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

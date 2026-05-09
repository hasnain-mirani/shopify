"use client";

import { useEffect, useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api-client";
import { formatPrice } from "@/lib/utils";
import { toast } from "react-hot-toast";
import { Check, MapPin } from "lucide-react";

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notified, setNotified] = useState(false);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    api.orders.get(orderId)
      .then(data => {
        setOrder(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [orderId]);

  // Fire order confirmation notification once
  useEffect(() => {
    if (order && !notified) {
      setNotified(true);
      toast.success(
        `Order #${order.id?.split('-')[0]?.toUpperCase()} has been placed successfully!`,
        { duration: 5000 }
      );
    }
  }, [order, notified]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 rounded-full border-4 border-brand-600 border-t-transparent animate-spin mb-4" />
          <p className="text-zinc-500">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-zinc-900">Order not found</h1>
          <p className="text-zinc-500 mb-8">We couldn't find the details for this order.</p>
          <Link href="/shop" className="btn-primary">Return to Shop</Link>
        </div>
      </div>
    );
  }

  // Use subtotal if total isn't set, fallback to 0
  const subtotal = order.subtotal || order.total || 0;
  const fullAddress = [order.address, order.city, order.postal_code, order.country]
    .filter(Boolean)
    .join(", ");
  const locationLabel = order.city || order.address || "Pakistan";
  const mapQuery = encodeURIComponent(fullAddress || locationLabel);

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

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row">
        {/* Left Column: Order Confirmation */}
        <div className="flex-1 px-6 py-10 lg:px-12 lg:py-16">
          <div className="max-w-xl mx-auto lg:mx-0 rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8 backdrop-blur-xl shadow-[0_30px_80px_rgba(2,6,23,0.55)] animate-fade-slide-up">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-12 w-12 rounded-full border-2 border-brand-400 bg-brand-500/10 flex items-center justify-center shrink-0">
                <Check className="h-6 w-6 text-brand-300" />
              </div>
              <div>
                <p className="text-sm text-zinc-400 mb-1">Confirmation #{order.id.split('-')[0].toUpperCase()}</p>
                <h1 className="text-2xl font-semibold text-white">
                  Thank you{order.customer_name ? `, ${order.customer_name.split(' ')[0]}` : ''}!
                </h1>
              </div>
            </div>

            {/* Delivery location */}
            <div className="rounded-2xl border border-white/10 overflow-hidden mb-8 relative bg-white/[0.04] h-[220px] flex items-center justify-center">
              {/* Decorative map background */}
              <div 
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage: "radial-gradient(circle at center, #94a3b8 1px, transparent 1px)",
                  backgroundSize: '20px 20px'
                }}
              />
              <div className="bg-zinc-950/80 px-4 py-3 rounded-xl shadow-lg z-10 text-center max-w-[80%] border border-white/10 backdrop-blur-sm">
                <p className="text-xs text-zinc-400 uppercase tracking-wider font-semibold mb-1">Delivery location</p>
                <p className="text-sm font-medium text-zinc-100 truncate">
                  {locationLabel}
                </p>
                <MapPin className="h-5 w-5 text-brand-300 mx-auto mt-2" />
              </div>
              
              <div className="absolute bottom-4 left-4 right-4 bg-zinc-950/80 backdrop-blur-sm px-4 py-3 border border-white/10 rounded-xl">
                <h3 className="font-semibold text-zinc-100 text-sm">Your order is confirmed</h3>
                <p className="text-sm text-zinc-400 mt-1">You'll receive a confirmation email with your order number shortly.</p>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex mt-2 text-xs text-brand-300 hover:text-brand-200"
                >
                  View shipping location on map
                </a>
              </div>
            </div>

            {/* Order Details */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-zinc-100 mb-4">Order details</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-200 mb-2">Contact information</h3>
                  <p className="text-sm text-zinc-400">{order.customer_email || order.customer_phone}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold text-zinc-200 mb-2">Payment method</h3>
                  <p className="text-sm text-zinc-400 flex items-center gap-2">
                    <span className="inline-block px-2 py-1 bg-white/10 border border-white/10 rounded text-xs font-mono">COD</span>
                    Cash on Delivery - {formatPrice(String(subtotal), "PKR")}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold text-zinc-200 mb-2">Shipping address</h3>
                  <div className="text-sm text-zinc-400 leading-relaxed">
                    <p>{order.customer_name}</p>
                    {order.address && <p>{order.address}</p>}
                    <p>{[order.city, order.postal_code].filter(Boolean).join(" ")}</p>
                    <p>{order.country}</p>
                    {order.customer_phone && <p>{order.customer_phone}</p>}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold text-zinc-200 mb-2">Billing address</h3>
                  <div className="text-sm text-zinc-400 leading-relaxed">
                    <p>{order.customer_name}</p>
                    {order.address && <p>{order.address}</p>}
                    <p>{[order.city, order.postal_code].filter(Boolean).join(" ")}</p>
                    <p>{order.country}</p>
                    {order.customer_phone && <p>{order.customer_phone}</p>}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold text-zinc-200 mb-2">Shipping method</h3>
                  <p className="text-sm text-zinc-400">Standard (Free)</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between border-t border-white/10 pt-6">
              <p className="text-sm text-zinc-400 mb-4 sm:mb-0">
                Need help? <a href="#" className="text-brand-300 hover:underline">Contact us</a>
              </p>
              <Link href="/shop" className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-brand-500 to-blue-500 hover:brightness-110 text-zinc-950 rounded-xl font-semibold transition-all text-center shadow-[0_10px_40px_rgba(59,130,246,0.45)]">
                Continue shopping
              </Link>
            </div>
            
            <div className="mt-12 border-t border-white/10 pt-6 flex flex-wrap gap-4 text-xs text-brand-300 justify-center sm:justify-start">
              <a href="#">Refund policy</a>
              <a href="#">Shipping</a>
              <a href="#">Privacy policy</a>
              <a href="#">Terms of service</a>
              <a href="#">Contact</a>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:w-[45%] bg-white/[0.02] border-l border-white/10 px-6 py-10 lg:px-12 lg:py-16">
          <div className="max-w-md mx-auto lg:mx-0 sticky top-10">
            <ul className="space-y-4 mb-6">
              {order.items?.map((item: any) => (
                <li key={item.id} className="flex gap-4 items-center rounded-2xl border border-white/10 bg-white/[0.03] p-3 animate-fade-slide-up">
                  <div className="relative h-16 w-16 shrink-0 rounded-lg border border-white/10 bg-zinc-900 overflow-hidden">
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
                  <span className="text-2xl text-white font-semibold">{formatPrice(String(subtotal), "PKR").replace("Rs ", "Rs ")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 rounded-full border-4 border-brand-600 border-t-transparent animate-spin mb-4" />
          <p className="text-zinc-500">Loading...</p>
        </div>
      </div>
    }>
      <CheckoutSuccessContent />
    </Suspense>
  );
}

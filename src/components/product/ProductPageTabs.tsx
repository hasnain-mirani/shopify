"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/types";

interface SimilarProduct {
  id: string;
  title: string;
  handle: string;
  featuredImage?: { url: string; altText?: string | null } | null;
  priceRange?: { minVariantPrice?: { amount?: string; currencyCode?: string } };
  compareAtPriceRange?: { minVariantPrice?: { amount?: string } };
}

interface Props {
  product: Product;
  similar: SimilarProduct[];
}

const TABS = ["Similar Products", "Specifications", "Reviews", "FAQs"] as const;
type Tab = typeof TABS[number];

export function ProductPageTabs({ product, similar }: Props) {
  const [active, setActive] = useState<Tab>("Specifications");
  const specsRaw = String((product as { specifications?: string }).specifications ?? "").trim();

  const parsedSpecs = (() => {
    if (!specsRaw) return [] as Array<{ key: string; value: string }>;
    try {
      const parsed = JSON.parse(specsRaw) as unknown;
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return Object.entries(parsed as Record<string, unknown>)
          .map(([key, value]) => ({ key: key.trim(), value: String(value ?? "").trim() }))
          .filter((row) => row.key && row.value);
      }
    } catch {
      // fall back to line parsing below
    }
    return specsRaw
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const idx = line.indexOf(":");
        if (idx === -1) return null;
        return {
          key: line.slice(0, idx).trim(),
          value: line.slice(idx + 1).trim(),
        };
      })
      .filter((row): row is { key: string; value: string } => !!row && !!row.key && !!row.value);
  })();

  return (
    <div style={{ background: "rgba(15,23,42,0.78)", borderRadius: "12px", overflow: "hidden", border: "1px solid rgba(148,163,184,0.2)" }}>
      {/* Tab bar */}
      <div style={{ display: "flex", borderBottom: "1px solid rgba(148,163,184,0.24)", overflowX: "auto", background: "rgba(2,6,23,0.45)" }}>
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActive(tab)}
            style={{
              padding: "14px 20px",
              fontFamily: "var(--font-outfit, sans-serif)",
              fontSize: "13px",
              fontWeight: active === tab ? 700 : 500,
              color: active === tab ? "#fbbf24" : "#94a3b8",
              background: "none",
              border: "none",
              borderBottom: active === tab ? "2px solid #f59e0b" : "2px solid transparent",
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "color 0.18s",
              marginBottom: "-2px",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ padding: "20px 24px" }}>

        {/* ── Similar Products ── */}
        {active === "Similar Products" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }} className="similar-grid">
            {similar.length === 0 && (
              <p style={{ fontFamily: "var(--font-outfit, sans-serif)", fontSize: "13px", color: "#94a3b8", gridColumn: "1/-1" }}>No similar products found.</p>
            )}
            {similar.map((p) => {
              const sp = parseFloat(p.priceRange?.minVariantPrice?.amount ?? "0");
              const sc = p.compareAtPriceRange ? parseFloat(p.compareAtPriceRange.minVariantPrice?.amount ?? "0") : 0;
              const sd = sc > sp ? Math.round(((sc - sp) / sc) * 100) : 0;
              return (
                <Link key={p.id} href={`/products/${p.handle}`} style={{ display: "flex", flexDirection: "column", padding: "12px", border: "1px solid rgba(148,163,184,0.2)", borderRadius: "10px", textDecoration: "none", background: "rgba(2,6,23,0.4)" }}>
                  <div style={{ position: "relative", aspectRatio: "1", background: "#0b1224", borderRadius: "8px", overflow: "hidden", marginBottom: "8px" }}>
                    {p.featuredImage?.url ? (
                      <Image src={p.featuredImage.url} alt={p.title} fill sizes="140px" style={{ objectFit: "contain" }} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px" }}>📦</div>
                    )}
                  </div>
                  <p style={{ fontFamily: "var(--font-outfit, sans-serif)", fontSize: "12px", color: "#e2e8f0", margin: "0 0 4px", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{p.title}</p>
                  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                    <span style={{ fontFamily: "var(--font-outfit, sans-serif)", fontSize: "13px", fontWeight: 700, color: "#f8fafc" }}>Rs {sp.toLocaleString("en-PK")}</span>
                    {sd > 0 && <span style={{ fontSize: "10px", fontWeight: 600, color: "#16a34a" }}>{sd}% OFF</span>}
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* ── Specifications ── */}
        {active === "Specifications" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }} className="specs-grid">
            {/* General Features */}
            <div style={{ border: "1px solid rgba(148,163,184,0.2)", borderRadius: "8px", overflow: "hidden", background: "rgba(2,6,23,0.35)" }}>
              <div style={{ padding: "10px 14px", background: "rgba(15,23,42,0.65)", borderBottom: "1px solid rgba(148,163,184,0.2)" }}>
                <h3 style={{ fontFamily: "var(--font-outfit, sans-serif)", fontSize: "13px", fontWeight: 700, color: "#e2e8f0", margin: 0 }}>General Features</h3>
              </div>
              {[
                { key: "Brand",       val: product.vendor ?? "—" },
                { key: "Type",        val: product.productType ?? "—" },
                { key: "Availability",val: product.availableForSale ? "In Stock" : "Out of Stock" },
                { key: "Tags",        val: product.tags?.slice(0, 4).join(", ") || "—" },
                { key: "Variants",    val: String(product.variants?.length ?? 0) },
                { key: "Updated",     val: product.updatedAt ? new Date(product.updatedAt).toLocaleDateString() : "—" },
              ].map((row) => (
                <div key={row.key} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", padding: "8px 14px", borderBottom: "1px solid rgba(148,163,184,0.12)" }}>
                  <span style={{ fontFamily: "var(--font-outfit, sans-serif)", fontSize: "12px", color: "#94a3b8" }}>{row.key}</span>
                  <span style={{ fontFamily: "var(--font-outfit, sans-serif)", fontSize: "12px", color: "#e2e8f0", fontWeight: 500 }}>{row.val}</span>
                </div>
              ))}
            </div>

            {/* Variants / Options */}
            <div style={{ border: "1px solid rgba(148,163,184,0.2)", borderRadius: "8px", overflow: "hidden", background: "rgba(2,6,23,0.35)" }}>
              <div style={{ padding: "10px 14px", background: "rgba(15,23,42,0.65)", borderBottom: "1px solid rgba(148,163,184,0.2)" }}>
                <h3 style={{ fontFamily: "var(--font-outfit, sans-serif)", fontSize: "13px", fontWeight: 700, color: "#e2e8f0", margin: 0 }}>Variants</h3>
              </div>
              {(product.options ?? []).map((opt) => (
                <div key={opt.name} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", padding: "8px 14px", borderBottom: "1px solid rgba(148,163,184,0.12)" }}>
                  <span style={{ fontFamily: "var(--font-outfit, sans-serif)", fontSize: "12px", color: "#94a3b8" }}>{opt.name}</span>
                  <span style={{ fontFamily: "var(--font-outfit, sans-serif)", fontSize: "12px", color: "#e2e8f0", fontWeight: 500 }}>{opt.values?.join(", ") ?? "—"}</span>
                </div>
              ))}
              {(!product.options || product.options.length === 0) && (
                <div style={{ padding: "12px 14px" }}>
                  <span style={{ fontFamily: "var(--font-outfit, sans-serif)", fontSize: "12px", color: "#64748b" }}>No variant options</span>
                </div>
              )}
            </div>

            {/* Product Specifications */}
            {specsRaw && (
              <div style={{ border: "1px solid rgba(148,163,184,0.2)", borderRadius: "8px", overflow: "hidden", gridColumn: "1 / -1", background: "rgba(2,6,23,0.35)" }}>
                <div style={{ padding: "10px 14px", background: "rgba(15,23,42,0.65)", borderBottom: "1px solid rgba(148,163,184,0.2)" }}>
                  <h3 style={{ fontFamily: "var(--font-outfit, sans-serif)", fontSize: "13px", fontWeight: 700, color: "#e2e8f0", margin: 0 }}>Product Specifications</h3>
                </div>
                <div style={{ padding: "14px" }}>
                  {parsedSpecs.length > 0 ? (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }} className="tab-spec-grid">
                      {parsedSpecs.map((row) => (
                        <div key={`${row.key}-${row.value}`} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", padding: "8px 0", borderBottom: "1px solid rgba(148,163,184,0.12)" }}>
                          <span style={{ fontFamily: "var(--font-outfit, sans-serif)", fontSize: "12px", color: "#94a3b8" }}>{row.key}</span>
                          <span style={{ fontFamily: "var(--font-outfit, sans-serif)", fontSize: "12px", color: "#e2e8f0", fontWeight: 500 }}>{row.value}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontFamily: "var(--font-outfit, sans-serif)", fontSize: "12px", color: "#cbd5e1", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                      {specsRaw}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Reviews ── */}
        {active === "Reviews" && (
          <div style={{ textAlign: "center", padding: "32px 0" }}>
            <div style={{ fontSize: "48px", marginBottom: "12px" }}>⭐</div>
            <p style={{ fontFamily: "var(--font-outfit, sans-serif)", fontSize: "14px", color: "#94a3b8" }}>No reviews yet. Be the first to review this product!</p>
            <button
              type="button"
              style={{ marginTop: "14px", padding: "9px 24px", borderRadius: "8px", background: "#f59e0b", color: "#0f172a", fontFamily: "var(--font-outfit, sans-serif)", fontSize: "13px", fontWeight: 700, border: "none", cursor: "pointer" }}
            >
              Write a Review
            </button>
          </div>
        )}

        {/* ── FAQs ── */}
        {active === "FAQs" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {[
              { q: "Is this product authentic?", a: "Yes, all products on SSHUB.STORE are 100% authentic and sourced from authorised distributors." },
              { q: "What is the delivery time?", a: "Standard delivery takes 2–4 business days nationwide." },
              { q: "Can I return this product?", a: "Yes, we offer easy 7-day returns free of charge if the product is defective." },
            ].map((faq) => (
              <div key={faq.q} style={{ border: "1px solid rgba(148,163,184,0.2)", borderRadius: "10px", padding: "14px 16px", background: "rgba(2,6,23,0.35)" }}>
                <p style={{ fontFamily: "var(--font-outfit, sans-serif)", fontSize: "13px", fontWeight: 700, color: "#e2e8f0", margin: "0 0 6px" }}>Q: {faq.q}</p>
                <p style={{ fontFamily: "var(--font-outfit, sans-serif)", fontSize: "13px", color: "#94a3b8", margin: 0 }}>A: {faq.a}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 640px) {
          .specs-grid   { grid-template-columns: 1fr !important; }
          .similar-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .tab-spec-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

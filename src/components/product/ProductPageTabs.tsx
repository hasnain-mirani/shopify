"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/types";
import { plainTextFromHtml, stripEmojisForSeo } from "@/lib/seo/text";

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

const TABS = [
  "Similar Products",
  "Highlights",
  "Specifications",
  "In the Box",
  "Reviews",
  "FAQs",
] as const;
type Tab = (typeof TABS)[number];

const HIGHLIGHT_PREVIEW_CHARS = 480;

function mergedDescriptionPlain(product: Product): string {
  const fromHtml = plainTextFromHtml(product.descriptionHtml ?? "").trim();
  const plain = (product.description ?? "").trim();
  if (fromHtml && plain) {
    if (plain.length > 40 && fromHtml.includes(plain.slice(0, 40))) return fromHtml;
    if (fromHtml.length > 40 && plain.includes(fromHtml.slice(0, 40))) return plain;
    return `${fromHtml}\n\n${plain}`.trim();
  }
  return fromHtml || plain;
}

function bulletsFromPlain(text: string): string[] {
  const t = text.replace(/\s+/g, " ").trim();
  if (!t) return [];
  const byNl = t.split(/\n+/).map((s) => s.trim()).filter(Boolean);
  if (byNl.length > 1) return byNl.slice(0, 10);
  return t
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 16)
    .slice(0, 10);
}

export function ProductPageTabs({ product, similar }: Props) {
  const merged = useMemo(() => mergedDescriptionPlain(product), [product]);
  const [active, setActive] = useState<Tab>(
    merged.length > 120 ? "Highlights" : "Specifications",
  );
  const [highlightsExpanded, setHighlightsExpanded] = useState(false);

  const specsRaw = String(
    (product as { specifications?: string }).specifications ?? "",
  ).trim();

  const parsedSpecs = useMemo(() => {
    if (!specsRaw) return [] as Array<{ key: string; value: string }>;
    try {
      const parsed = JSON.parse(specsRaw) as unknown;
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return Object.entries(parsed as Record<string, unknown>)
          .map(([key, value]) => ({
            key: key.trim(),
            value: String(value ?? "").trim(),
          }))
          .filter((row) => row.key && row.value);
      }
    } catch {
      /* fall through */
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
  }, [specsRaw]);

  const specPills = parsedSpecs.slice(0, 4);
  const cleanTitle = stripEmojisForSeo(product.title);

  return (
    <div
      style={{
        background: "rgba(15,23,42,0.78)",
        borderRadius: "12px",
        overflow: "hidden",
        border: "1px solid rgba(148,163,184,0.2)",
      }}
    >
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid rgba(148,163,184,0.24)",
          overflowX: "auto",
          background: "rgba(2,6,23,0.45)",
        }}
      >
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActive(tab)}
            style={{
              padding: "14px 18px",
              fontFamily: "var(--font-outfit, sans-serif)",
              fontSize: "12px",
              fontWeight: active === tab ? 700 : 500,
              color: active === tab ? "#fbbf24" : "#94a3b8",
              background: "none",
              border: "none",
              borderBottom:
                active === tab ? "2px solid #f59e0b" : "2px solid transparent",
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

      <div style={{ padding: "20px 24px" }}>
        {active === "Similar Products" && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "12px",
            }}
            className="similar-grid"
          >
            {similar.length === 0 && (
              <p
                style={{
                  fontFamily: "var(--font-outfit, sans-serif)",
                  fontSize: "13px",
                  color: "#94a3b8",
                  gridColumn: "1/-1",
                }}
              >
                No similar products found.
              </p>
            )}
            {similar.map((p) => {
              const sp = parseFloat(p.priceRange?.minVariantPrice?.amount ?? "0");
              const sc = p.compareAtPriceRange
                ? parseFloat(p.compareAtPriceRange.minVariantPrice?.amount ?? "0")
                : 0;
              const sd = sc > sp ? Math.round(((sc - sp) / sc) * 100) : 0;
              return (
                <Link
                  key={p.id}
                  href={`/products/${p.handle}`}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    padding: "12px",
                    border: "1px solid rgba(148,163,184,0.2)",
                    borderRadius: "10px",
                    textDecoration: "none",
                    background: "rgba(2,6,23,0.4)",
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                      aspectRatio: "1",
                      background: "#0b1224",
                      borderRadius: "8px",
                      overflow: "hidden",
                      marginBottom: "8px",
                    }}
                  >
                    {p.featuredImage?.url ? (
                      <Image
                        src={p.featuredImage.url}
                        alt={`${stripEmojisForSeo(p.title)} - SSHUB`}
                        fill
                        sizes="140px"
                        style={{ objectFit: "contain" }}
                        loading="lazy"
                      />
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "28px",
                        }}
                      >
                        📦
                      </div>
                    )}
                  </div>
                  <p
                    style={{
                      fontFamily: "var(--font-outfit, sans-serif)",
                      fontSize: "12px",
                      color: "#e2e8f0",
                      margin: "0 0 4px",
                      lineHeight: 1.4,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {p.title}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      justifyContent: "space-between",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-outfit, sans-serif)",
                        fontSize: "13px",
                        fontWeight: 700,
                        color: "#f8fafc",
                      }}
                    >
                      Rs {sp.toLocaleString("en-PK")}
                    </span>
                    {sd > 0 && (
                      <span
                        style={{ fontSize: "10px", fontWeight: 600, color: "#16a34a" }}
                      >
                        {sd}% OFF
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {active === "Highlights" && (
          <div>
            {!merged ? (
              <p
                style={{
                  fontFamily: "var(--font-outfit, sans-serif)",
                  fontSize: "13px",
                  color: "#94a3b8",
                  margin: 0,
                }}
              >
                No written overview for this product yet. Open the{" "}
                <strong style={{ color: "#e2e8f0" }}>Specifications</strong> tab
                for technical details.
              </p>
            ) : (
              <>
                <h3
                  style={{
                    fontFamily: "var(--font-outfit, sans-serif)",
                    fontSize: "15px",
                    fontWeight: 700,
                    color: "#f8fafc",
                    margin: "0 0 14px",
                  }}
                >
                  Overview
                </h3>
                {!highlightsExpanded && merged.length > HIGHLIGHT_PREVIEW_CHARS ? (
                  <>
                    <ul
                      style={{
                        margin: "0 0 12px",
                        paddingLeft: "18px",
                        fontFamily: "var(--font-outfit, sans-serif)",
                        fontSize: "13px",
                        color: "#cbd5e1",
                        lineHeight: 1.65,
                      }}
                    >
                      {bulletsFromPlain(merged.slice(0, HIGHLIGHT_PREVIEW_CHARS))
                        .slice(0, 5)
                        .map((line, i) => (
                          <li key={i} style={{ marginBottom: "6px" }}>
                            {line}
                          </li>
                        ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => setHighlightsExpanded(true)}
                      style={{
                        display: "block",
                        width: "100%",
                        textAlign: "center",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontFamily: "var(--font-outfit, sans-serif)",
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "#f59e0b",
                        textDecoration: "underline",
                        textUnderlineOffset: "3px",
                        padding: "8px 0",
                      }}
                    >
                      Show more
                    </button>
                  </>
                ) : (
                  <div
                    style={{
                      maxHeight: highlightsExpanded ? "min(65vh, 520px)" : "none",
                      overflowY: highlightsExpanded ? "auto" : "visible",
                      padding: highlightsExpanded ? "14px 16px" : 0,
                      borderRadius: "10px",
                      border: highlightsExpanded
                        ? "1px solid rgba(148,163,184,0.18)"
                        : "none",
                      background: highlightsExpanded ? "rgba(2,6,23,0.5)" : "transparent",
                      fontFamily: "var(--font-outfit, sans-serif)",
                      fontSize: "13px",
                      lineHeight: 1.7,
                      color: "#cbd5e1",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {merged.length <= HIGHLIGHT_PREVIEW_CHARS ? (
                      <ul
                        style={{
                          margin: 0,
                          paddingLeft: "18px",
                        }}
                      >
                        {bulletsFromPlain(merged).map((line, i) => (
                          <li key={i} style={{ marginBottom: "6px" }}>
                            {line}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      merged
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {active === "Specifications" && (
          <div>
            {specPills.length > 0 && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: "10px",
                  marginBottom: "18px",
                }}
                className="pdp-spec-pills"
              >
                {specPills.map((row) => (
                  <div
                    key={row.key}
                    style={{
                      borderRadius: "10px",
                      border: "1px solid rgba(245,166,35,0.22)",
                      background: "rgba(245,166,35,0.06)",
                      padding: "12px 10px",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "var(--font-outfit, sans-serif)",
                        fontSize: "14px",
                        fontWeight: 800,
                        color: "#fbbf24",
                        marginBottom: "4px",
                      }}
                    >
                      {row.value.length > 18
                        ? `${row.value.slice(0, 16)}…`
                        : row.value}
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-outfit, sans-serif)",
                        fontSize: "10px",
                        color: "#94a3b8",
                        lineHeight: 1.35,
                      }}
                    >
                      {row.key}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
              }}
              className="specs-grid"
            >
              <div
                style={{
                  border: "1px solid rgba(148,163,184,0.2)",
                  borderRadius: "8px",
                  overflow: "hidden",
                  background: "rgba(2,6,23,0.35)",
                }}
              >
                <div
                  style={{
                    padding: "10px 14px",
                    background: "rgba(15,23,42,0.65)",
                    borderBottom: "1px solid rgba(148,163,184,0.2)",
                  }}
                >
                  <h3
                    style={{
                      fontFamily: "var(--font-outfit, sans-serif)",
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "#e2e8f0",
                      margin: 0,
                    }}
                  >
                    General Features
                  </h3>
                </div>
                {[
                  { key: "Brand", val: product.vendor ?? "—" },
                  { key: "Type", val: product.productType ?? "—" },
                  {
                    key: "Availability",
                    val: product.availableForSale ? "In Stock" : "Out of Stock",
                  },
                  {
                    key: "Tags",
                    val: product.tags?.slice(0, 4).join(", ") || "—",
                  },
                  { key: "Variants", val: String(product.variants?.length ?? 0) },
                  {
                    key: "Updated",
                    val: product.updatedAt
                      ? new Date(product.updatedAt).toLocaleDateString()
                      : "—",
                  },
                ].map((row) => (
                  <div
                    key={row.key}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      padding: "8px 14px",
                      borderBottom: "1px solid rgba(148,163,184,0.12)",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-outfit, sans-serif)",
                        fontSize: "12px",
                        color: "#94a3b8",
                      }}
                    >
                      {row.key}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-outfit, sans-serif)",
                        fontSize: "12px",
                        color: "#e2e8f0",
                        fontWeight: 500,
                      }}
                    >
                      {row.val}
                    </span>
                  </div>
                ))}
              </div>

              <div
                style={{
                  border: "1px solid rgba(148,163,184,0.2)",
                  borderRadius: "8px",
                  overflow: "hidden",
                  background: "rgba(2,6,23,0.35)",
                }}
              >
                <div
                  style={{
                    padding: "10px 14px",
                    background: "rgba(15,23,42,0.65)",
                    borderBottom: "1px solid rgba(148,163,184,0.2)",
                  }}
                >
                  <h3
                    style={{
                      fontFamily: "var(--font-outfit, sans-serif)",
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "#e2e8f0",
                      margin: 0,
                    }}
                  >
                    Connectivity &amp; options
                  </h3>
                </div>
                {(product.options ?? []).map((opt) => (
                  <div
                    key={opt.name}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      padding: "8px 14px",
                      borderBottom: "1px solid rgba(148,163,184,0.12)",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-outfit, sans-serif)",
                        fontSize: "12px",
                        color: "#94a3b8",
                      }}
                    >
                      {opt.name}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-outfit, sans-serif)",
                        fontSize: "12px",
                        color: "#e2e8f0",
                        fontWeight: 500,
                      }}
                    >
                      {opt.values?.join(", ") ?? "—"}
                    </span>
                  </div>
                ))}
                {(!product.options || product.options.length === 0) && (
                  <div style={{ padding: "12px 14px" }}>
                    <span
                      style={{
                        fontFamily: "var(--font-outfit, sans-serif)",
                        fontSize: "12px",
                        color: "#64748b",
                      }}
                    >
                      No variant options
                    </span>
                  </div>
                )}
              </div>

              {specsRaw ? (
                <div
                  style={{
                    border: "1px solid rgba(148,163,184,0.2)",
                    borderRadius: "8px",
                    overflow: "hidden",
                    gridColumn: "1 / -1",
                    background: "rgba(2,6,23,0.35)",
                  }}
                >
                  <div
                    style={{
                      padding: "10px 14px",
                      background: "rgba(15,23,42,0.65)",
                      borderBottom: "1px solid rgba(148,163,184,0.2)",
                    }}
                  >
                    <h3
                      style={{
                        fontFamily: "var(--font-outfit, sans-serif)",
                        fontSize: "13px",
                        fontWeight: 700,
                        color: "#e2e8f0",
                        margin: 0,
                      }}
                    >
                      Detailed specifications
                    </h3>
                  </div>
                  <div style={{ padding: "14px" }}>
                    {parsedSpecs.length > 0 ? (
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: "8px",
                        }}
                        className="tab-spec-grid"
                      >
                        {parsedSpecs.map((row) => (
                          <div
                            key={`${row.key}-${row.value}`}
                            style={{
                              display: "grid",
                              gridTemplateColumns: "1fr 1fr",
                              padding: "8px 0",
                              borderBottom: "1px solid rgba(148,163,184,0.12)",
                            }}
                          >
                            <span
                              style={{
                                fontFamily: "var(--font-outfit, sans-serif)",
                                fontSize: "12px",
                                color: "#94a3b8",
                              }}
                            >
                              {row.key}
                            </span>
                            <span
                              style={{
                                fontFamily: "var(--font-outfit, sans-serif)",
                                fontSize: "12px",
                                color: "#e2e8f0",
                                fontWeight: 500,
                              }}
                            >
                              {row.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div
                        style={{
                          fontFamily: "var(--font-outfit, sans-serif)",
                          fontSize: "12px",
                          color: "#cbd5e1",
                          lineHeight: 1.6,
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {specsRaw}
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}

        {active === "In the Box" && (
          <div>
            <h3
              style={{
                fontFamily: "var(--font-outfit, sans-serif)",
                fontSize: "15px",
                fontWeight: 700,
                color: "#f8fafc",
                margin: "0 0 14px",
              }}
            >
              What&apos;s included
            </h3>
            <ul
              style={{
                margin: 0,
                paddingLeft: "18px",
                fontFamily: "var(--font-outfit, sans-serif)",
                fontSize: "13px",
                color: "#cbd5e1",
                lineHeight: 1.65,
              }}
            >
              <li style={{ marginBottom: "6px" }}>{cleanTitle}</li>
              <li style={{ marginBottom: "6px" }}>
                Charging cable (USB-C / Lightning — as supplied for this SKU)
              </li>
              <li style={{ marginBottom: "6px" }}>Ear tips / accessories in retail packaging</li>
              <li style={{ marginBottom: "6px" }}>Quick start &amp; warranty booklet</li>
              <li>Branded retail box</li>
            </ul>
            <p
              style={{
                marginTop: "14px",
                fontFamily: "var(--font-outfit, sans-serif)",
                fontSize: "12px",
                color: "#64748b",
                lineHeight: 1.55,
              }}
            >
              Exact in-box contents can vary by manufacturer revision. See Highlights
              or vendor documentation for edition-specific notes.
            </p>
          </div>
        )}

        {active === "Reviews" && (
          <div style={{ textAlign: "center", padding: "32px 0" }}>
            <div style={{ fontSize: "48px", marginBottom: "12px" }}>⭐</div>
            <p
              style={{
                fontFamily: "var(--font-outfit, sans-serif)",
                fontSize: "14px",
                color: "#94a3b8",
              }}
            >
              No reviews yet. Be the first to review this product!
            </p>
            <button
              type="button"
              style={{
                marginTop: "14px",
                padding: "9px 24px",
                borderRadius: "8px",
                background: "#f59e0b",
                color: "#0f172a",
                fontFamily: "var(--font-outfit, sans-serif)",
                fontSize: "13px",
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
              }}
            >
              Write a Review
            </button>
          </div>
        )}

        {active === "FAQs" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {[
              {
                q: "Is this product authentic?",
                a: "Yes — SSHUB lists genuine stock from authorised channels.",
              },
              {
                q: "What is the delivery time?",
                a: "Most orders dispatch quickly; allow 2–4 business days nationwide.",
              },
              {
                q: "Can I return this product?",
                a: "Defective items are covered by our returns policy. Contact support with your order ID.",
              },
            ].map((faq) => (
              <div
                key={faq.q}
                style={{
                  border: "1px solid rgba(148,163,184,0.2)",
                  borderRadius: "10px",
                  padding: "14px 16px",
                  background: "rgba(2,6,23,0.35)",
                }}
              >
                <p
                  style={{
                    fontFamily: "var(--font-outfit, sans-serif)",
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#e2e8f0",
                    margin: "0 0 6px",
                  }}
                >
                  Q: {faq.q}
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-outfit, sans-serif)",
                    fontSize: "13px",
                    color: "#94a3b8",
                    margin: 0,
                  }}
                >
                  A: {faq.a}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 640px) {
          .specs-grid { grid-template-columns: 1fr !important; }
          .similar-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .tab-spec-grid { grid-template-columns: 1fr !important; }
          .pdp-spec-pills { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  );
}

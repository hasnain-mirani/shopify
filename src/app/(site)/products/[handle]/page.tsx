import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ProductImageGallery,
  ProductPurchasePanel,
} from "@/components/product";
import {
  getCollections,
  getProductByHandle,
  getProductRecommendations,
  getProducts,
} from "@/lib/catalog";
import { buildProductMetadata } from "@/lib/metadata";
import { ProductPageTabs } from "@/components/product/ProductPageTabs";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { buildBreadcrumbJsonLd, buildProductJsonLd } from "@/lib/seo/json-ld";
import { inferPrimaryCollection } from "@/lib/seo/infer-collection";
import { buildProductSeoNarrative } from "@/lib/seo/product-seo-body";
import { stripEmojisForSeo } from "@/lib/seo/text";
import type { Product } from "@/types";
import { isSafeStaticSegment } from "@/lib/safe-static-segment";

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ handle: string }>;
}

function parseSpecifications(specifications?: string): Array<{ key: string; value: string }> {
  if (!specifications) return [];
  const raw = specifications.trim();
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return Object.entries(parsed as Record<string, unknown>)
        .map(([key, value]) => ({
          key: key.trim(),
          value: String(value ?? "").trim(),
        }))
        .filter((row) => row.key && row.value);
    }
  } catch {
    // If it's not JSON, we'll parse as plain text rows below.
  }

  return raw
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
}

export async function generateStaticParams() {
  try {
    const products = await getProducts({ limit: 50 });
    return products
      .map((p: Product) => ({ handle: p.handle }))
      .filter((p) => isSafeStaticSegment(p.handle));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { handle } = await params;
  const product = await getProductByHandle(handle).catch(() => null);
  if (!product) return { title: "Product not found" };
  return buildProductMetadata(product);
}

export default async function ProductPage({ params }: PageProps) {
  const { handle } = await params;
  const product = await getProductByHandle(handle);
  if (!product) notFound();

  const [recommendations, allProducts, collections] = await Promise.all([
    getProductRecommendations(product.id).catch(() => []),
    getProducts({ limit: 8 }).catch(() => []),
    getCollections().catch(() => []),
  ]);

  const similar = recommendations.length > 0
    ? recommendations.slice(0, 4)
    : allProducts.filter((p: Product) => p.id !== product.id).slice(0, 4);

  const goTogether = allProducts.filter((p: Product) => p.id !== product.id).slice(0, 4);

  const price = parseFloat(product.priceRange?.minVariantPrice?.amount ?? "0");
  const compareAtPrice = product.compareAtPriceRange?.minVariantPrice?.amount
    ?? product.variants?.[0]?.compareAtPrice?.amount
    ?? (typeof product.marketPrice === "number" ? String(product.marketPrice) : undefined);
  const compareAmt = compareAtPrice ? parseFloat(compareAtPrice) : 0;
  const discount = compareAmt > price
    ? Math.round(((compareAmt - price) / compareAmt) * 100)
    : 0;
  const currency = product.priceRange?.minVariantPrice?.currencyCode === "PKR" ? "Rs" :
    (product.priceRange?.minVariantPrice?.currencyCode ?? "Rs");
  const specs = parseSpecifications(product.specifications);
  const keySpecs = specs.slice(0, 6);
  const topTags = (product.tags ?? []).filter(Boolean).slice(0, 5);
  const cleanTitle = stripEmojisForSeo(product.title);
  const primaryCol = inferPrimaryCollection(product, collections);
  const primaryKeyword = `${(product.productType ?? "mobile accessories").toLowerCase()} in Pakistan`;
  const seoNarrative = buildProductSeoNarrative(product, primaryKeyword);

  const breadcrumbItems = [
    { name: "Home", href: "/" },
    ...(primaryCol
      ? [{ name: primaryCol.title, href: primaryCol.href }]
      : []),
    { name: cleanTitle },
  ];

  const breadcrumbLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    ...(primaryCol
      ? [{ name: primaryCol.title, path: primaryCol.href }]
      : []),
    { name: cleanTitle, path: `/products/${product.handle}` },
  ]);

  return (
    <div style={{ background: "transparent", minHeight: "100vh" }}>
      <JsonLd data={buildProductJsonLd(product)} />
      <JsonLd data={breadcrumbLd} />

      {/* ── Breadcrumb ── */}
      <div style={{ background: "rgba(2,6,23,0.7)", borderBottom: "1px solid rgba(148,163,184,0.2)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "10px 16px" }}>
          <Breadcrumbs
            items={breadcrumbItems}
            className="text-xs text-slate-400"
            linkClassName="text-amber-400 hover:text-amber-300"
            currentClassName="text-slate-200"
            sepClassName="text-slate-400"
          />
        </div>
      </div>

      {/* ── Main product section ── */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "16px" }}>
        <div style={{ background: "rgba(15,23,42,0.78)", borderRadius: "14px", padding: "24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px", border: "1px solid rgba(148,163,184,0.18)" }} className="pdp-main-grid">

          {/* Left: Gallery */}
          <ProductImageGallery
            images={product.images}
            productTitle={cleanTitle}
            imageAltDetail={keySpecs[0]?.value}
          />

          {/* Right: Info */}
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {/* Title + badges */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px" }}>
              <h1 style={{ fontFamily: "var(--font-outfit, sans-serif)", fontSize: "26px", fontWeight: 700, color: "#f8fafc", margin: 0, lineHeight: 1.25 }}>
                {cleanTitle}
              </h1>
            </div>

            {/* Trust chips */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <span style={{ background: "rgba(34,197,94,0.16)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.4)", fontSize: "10px", fontWeight: 700, padding: "3px 10px", borderRadius: "999px", fontFamily: "var(--font-outfit, sans-serif)" }}>
                {product.availableForSale ? "In Stock" : "Out of Stock"}
              </span>
              {product.vendor && (
                <span style={{ background: "rgba(56,189,248,0.14)", color: "#7dd3fc", border: "1px solid rgba(56,189,248,0.36)", fontSize: "10px", fontWeight: 700, padding: "3px 10px", borderRadius: "999px", fontFamily: "var(--font-outfit, sans-serif)" }}>
                  {product.vendor}
                </span>
              )}
              {product.productType && (
                <span style={{ background: "rgba(168,85,247,0.16)", color: "#d8b4fe", border: "1px solid rgba(168,85,247,0.34)", fontSize: "10px", fontWeight: 700, padding: "3px 10px", borderRadius: "999px", fontFamily: "var(--font-outfit, sans-serif)" }}>
                  {product.productType}
                </span>
              )}
            </div>

            {/* Rating + Fast Delivery */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                {"★★★★☆".split("").map((s, i) => (
                  <span key={i} style={{ color: "#F5A623", fontSize: "14px" }}>{s}</span>
                ))}
                <span style={{ fontFamily: "var(--font-outfit, sans-serif)", fontSize: "12px", color: "#cbd5e1", marginLeft: "4px" }}>4.0</span>
                <span style={{ fontFamily: "var(--font-outfit, sans-serif)", fontSize: "12px", color: "#94a3b8" }}>| Reviews</span>
              </div>
              <span style={{ background: "rgba(245,158,11,0.16)", color: "#fbbf24", border: "1px solid rgba(245,158,11,0.35)", fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "999px", fontFamily: "var(--font-outfit, sans-serif)" }}>
                Fast Delivery
              </span>
            </div>

            {/* Price */}
            <div style={{ display: "flex", alignItems: "baseline", gap: "10px", flexWrap: "wrap" }}>
              <span style={{ fontFamily: "var(--font-outfit, sans-serif)", fontSize: "30px", fontWeight: 800, color: "#f8fafc" }}>
                {currency} {price.toLocaleString("en-PK")}
              </span>
              {compareAmt > price && (
                <>
                  <span style={{ fontFamily: "var(--font-outfit, sans-serif)", fontSize: "14px", color: "#94a3b8", textDecoration: "line-through" }}>
                    {currency} {compareAmt.toLocaleString("en-PK")}
                  </span>
                  <span style={{ background: "#f0fdf4", color: "#16a34a", fontSize: "12px", fontWeight: 700, padding: "2px 8px", borderRadius: "4px" }}>
                    {discount}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Purchase panel (variant selector + add to cart) */}
            <ProductPurchasePanel product={product} />

            {/* SEO narrative + merchant description */}
            <div style={{ borderTop: "1px solid rgba(148,163,184,0.2)", paddingTop: "12px" }}>
              <p style={{ fontFamily: "var(--font-outfit, sans-serif)", fontSize: "13px", color: "#cbd5e1", lineHeight: 1.75, margin: "0 0 12px" }}>
                {seoNarrative}
              </p>
              {primaryCol ? (
                <p style={{ fontFamily: "var(--font-outfit, sans-serif)", fontSize: "13px", color: "#94a3b8", margin: "0 0 12px" }}>
                  Explore more in our{" "}
                  <Link href={primaryCol.href} style={{ color: "#f59e0b", fontWeight: 600 }}>
                    {primaryCol.title}
                  </Link>{" "}
                  collection — curated mobile accessories with fast delivery across Pakistan.
                </p>
              ) : null}
              {product.descriptionHtml ? (
                <div
                  style={{ fontFamily: "var(--font-outfit, sans-serif)", fontSize: "13px", color: "#cbd5e1", lineHeight: 1.7 }}
                  dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
                />
              ) : null}
            </div>

            {specs.length > 0 ? (
              <section style={{ borderTop: "1px solid rgba(148,163,184,0.2)", paddingTop: "16px" }} aria-labelledby="pdp-key-features">
                <h2 id="pdp-key-features" style={{ fontFamily: "var(--font-outfit, sans-serif)", fontSize: "18px", fontWeight: 700, color: "#f8fafc", margin: "0 0 10px" }}>
                  Key Features
                </h2>
                <ul style={{ margin: 0, paddingLeft: "18px", fontFamily: "var(--font-outfit, sans-serif)", fontSize: "13px", color: "#cbd5e1", lineHeight: 1.65 }}>
                  {specs.map((row) => (
                    <li key={`${row.key}-${row.value}`}>
                      <strong style={{ color: "#e2e8f0" }}>{row.key}:</strong> {row.value}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            <section style={{ borderTop: "1px solid rgba(148,163,184,0.2)", paddingTop: "16px" }} aria-labelledby="pdp-box">
              <h2 id="pdp-box" style={{ fontFamily: "var(--font-outfit, sans-serif)", fontSize: "18px", fontWeight: 700, color: "#f8fafc", margin: "0 0 10px" }}>
                What&apos;s in the Box
              </h2>
              <ul style={{ margin: 0, paddingLeft: "18px", fontFamily: "var(--font-outfit, sans-serif)", fontSize: "13px", color: "#cbd5e1", lineHeight: 1.65 }}>
                <li>{cleanTitle} unit</li>
                <li>Charging cable (where applicable)</li>
                <li>Quick start / warranty information</li>
                <li>Retail packaging</li>
              </ul>
            </section>

            <section style={{ borderTop: "1px solid rgba(148,163,184,0.2)", paddingTop: "16px" }} aria-labelledby="pdp-reviews">
              <h2 id="pdp-reviews" style={{ fontFamily: "var(--font-outfit, sans-serif)", fontSize: "18px", fontWeight: 700, color: "#f8fafc", margin: "0 0 10px" }}>
                Customer Reviews
              </h2>
              <p style={{ fontFamily: "var(--font-outfit, sans-serif)", fontSize: "13px", color: "#cbd5e1", lineHeight: 1.7, margin: 0 }}>
                SSHUB shoppers value clear specs, fair pricing, and support across Pakistan. See the Reviews tab below for product-specific feedback and common questions. Buying {primaryKeyword}? Add {cleanTitle} to your cart for fast dispatch and straightforward returns.
              </p>
            </section>

            {topTags.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "7px" }}>
                {topTags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      borderRadius: "999px",
                      border: "1px solid rgba(148,163,184,0.25)",
                      background: "rgba(15,23,42,0.75)",
                      color: "#cbd5e1",
                      fontFamily: "var(--font-outfit, sans-serif)",
                      fontSize: "11px",
                      padding: "5px 10px",
                    }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Similar products ── */}
      {similar.length > 0 && (
        <div style={{ maxWidth: "1200px", margin: "16px auto 0", padding: "0 16px" }}>
          <div style={{ background: "rgba(15,23,42,0.78)", borderRadius: "14px", padding: "20px 24px", border: "1px solid rgba(148,163,184,0.18)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <div>
                <h2 style={{ fontFamily: "var(--font-outfit, sans-serif)", fontSize: "16px", fontWeight: 700, color: "#f8fafc", margin: 0 }}>
                  Similar Products
                </h2>
                <p style={{ fontFamily: "var(--font-outfit, sans-serif)", fontSize: "12px", color: "#94a3b8", margin: "4px 0 0" }}>
                  Products similar to {product.title}
                </p>
              </div>
              <Link href="/products" style={{ padding: "7px 18px", borderRadius: "999px", border: "1px solid rgba(148,163,184,0.3)", color: "#e2e8f0", fontFamily: "var(--font-outfit, sans-serif)", fontSize: "12px", fontWeight: 600, textDecoration: "none" }}>
                View All
              </Link>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }} className="similar-grid">
              {similar.map((p: Product) => {
                const sp = parseFloat(p.priceRange?.minVariantPrice?.amount ?? "0");
                const scp = p.variants?.[0]?.compareAtPrice;
                const sc = scp ? parseFloat(scp.amount) : 0;
                const sd = sc > sp ? Math.round(((sc - sp) / sc) * 100) : 0;
                return (
                  <Link key={p.id} href={`/products/${p.handle}`} style={{ display: "flex", flexDirection: "column", padding: "12px", border: "1px solid rgba(148,163,184,0.2)", borderRadius: "12px", textDecoration: "none", transition: "box-shadow 0.18s", background: "rgba(2,6,23,0.45)" }}>
                    <div style={{ position: "relative", aspectRatio: "1", background: "#0b1224", borderRadius: "10px", overflow: "hidden", marginBottom: "10px" }}>
                      {p.featuredImage?.url ? (
                        <Image src={p.featuredImage.url} alt={`${stripEmojisForSeo(p.title)} - mobile accessory - SSHUB`} fill sizes="180px" style={{ objectFit: "contain" }} loading="lazy" />
                      ) : (
                        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px" }}>📦</div>
                      )}
                    </div>
                    <p style={{ fontFamily: "var(--font-outfit, sans-serif)", fontSize: "12px", fontWeight: 500, color: "#e2e8f0", margin: "0 0 6px", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {p.title}
                    </p>
                    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "4px" }}>
                      <span style={{ fontFamily: "var(--font-outfit, sans-serif)", fontSize: "13px", fontWeight: 700, color: "#f8fafc" }}>
                        Rs {sp.toLocaleString("en-PK")}
                      </span>
                      {sd > 0 && <span style={{ fontSize: "10px", fontWeight: 600, color: "#16a34a" }}>{sd}% OFF</span>}
                    </div>
                    <span style={{ marginTop: "6px", display: "inline-flex", alignItems: "center", gap: "3px", padding: "2px 7px", borderRadius: "4px", background: "rgba(245,166,35,0.12)", border: "1px solid rgba(245,166,35,0.25)", color: "#E8850A", fontSize: "11px", fontWeight: 700, width: "fit-content" }}>
                      ⚡ Fast Delivery
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Trust badges ── */}
      <div style={{ maxWidth: "1200px", margin: "16px auto 0", padding: "0 16px" }}>
        <div style={{ background: "rgba(15,23,42,0.78)", borderRadius: "14px", padding: "20px 24px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", textAlign: "center", border: "1px solid rgba(148,163,184,0.18)" }} className="trust-grid">
          {[
            { icon: "🛡️", title: "3 Days", sub: "Brand Warranty" },
            { icon: "🔄", title: "Easy Returns", sub: "Free of Charge" },
            { icon: "📦", title: "Fast Delivery", sub: "Nationwide" },
          ].map((b) => (
            <div key={b.title} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "28px" }}>{b.icon}</span>
              <span style={{ fontFamily: "var(--font-outfit, sans-serif)", fontSize: "13px", fontWeight: 700, color: "#e2e8f0" }}>{b.title}</span>
              <span style={{ fontFamily: "var(--font-outfit, sans-serif)", fontSize: "11px", color: "#94a3b8" }}>{b.sub}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Tabs: Similar Products / Specifications / Reviews / FAQs ── */}
      <div style={{ maxWidth: "1200px", margin: "16px auto 0", padding: "0 16px" }}>
        <ProductPageTabs product={product} similar={similar} />
      </div>

      {/* ── Products That Go Together ── */}
      {goTogether.length > 0 && (
        <div style={{ maxWidth: "1200px", margin: "16px auto 0", padding: "0 16px" }}>
          <div style={{ background: "rgba(15,23,42,0.78)", borderRadius: "14px", padding: "20px 24px", border: "1px solid rgba(148,163,184,0.18)" }}>
            <h2 style={{ fontFamily: "var(--font-outfit, sans-serif)", fontSize: "16px", fontWeight: 700, color: "#f8fafc", margin: "0 0 16px" }}>
              Products That Go Together
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }} className="similar-grid">
              {goTogether.map((p: Product) => {
                const sp = parseFloat(p.priceRange?.minVariantPrice?.amount ?? "0");
                const gcp = p.variants?.[0]?.compareAtPrice;
                const sc = gcp ? parseFloat(gcp.amount) : 0;
                const sd = sc > sp ? Math.round(((sc - sp) / sc) * 100) : 0;
                return (
                  <Link key={p.id} href={`/products/${p.handle}`} style={{ display: "flex", flexDirection: "column", padding: "12px", border: "1px solid rgba(148,163,184,0.2)", borderRadius: "12px", textDecoration: "none", background: "rgba(2,6,23,0.45)" }}>
                    <div style={{ position: "relative", aspectRatio: "1", background: "#0b1224", borderRadius: "10px", overflow: "hidden", marginBottom: "10px" }}>
                      {p.featuredImage?.url ? (
                        <Image src={p.featuredImage.url} alt={`${stripEmojisForSeo(p.title)} - mobile accessory - SSHUB`} fill sizes="180px" style={{ objectFit: "contain" }} loading="lazy" />
                      ) : (
                        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px" }}>📦</div>
                      )}
                    </div>
                    <p style={{ fontFamily: "var(--font-outfit, sans-serif)", fontSize: "12px", fontWeight: 500, color: "#e2e8f0", margin: "0 0 6px", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {p.title}
                    </p>
                    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                      <span style={{ fontFamily: "var(--font-outfit, sans-serif)", fontSize: "13px", fontWeight: 700, color: "#f8fafc" }}>
                        Rs {sp.toLocaleString("en-PK")}
                      </span>
                      {sd > 0 && <span style={{ fontSize: "10px", fontWeight: 600, color: "#16a34a" }}>{sd}% OFF</span>}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Shop More Categories ── */}
      <div style={{ maxWidth: "1200px", margin: "16px auto 0", padding: "0 16px 32px" }}>
        <div style={{ background: "rgba(15,23,42,0.78)", borderRadius: "14px", padding: "20px 24px", border: "1px solid rgba(148,163,184,0.18)" }}>
          <h2 style={{ fontFamily: "var(--font-outfit, sans-serif)", fontSize: "16px", fontWeight: 700, color: "#f8fafc", margin: "0 0 16px" }}>
            Shop More Categories
          </h2>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            {[
              { label: "Earbuds", href: "/collections/wireless-earbuds", emoji: "🎧", color: "#DB2777" },
              { label: "Watches", href: "/collections/smart-watches", emoji: "⌚", color: "#0EA5E9" },
              { label: "Power", href: "/collections/power-banks", emoji: "🔋", color: "#16A34A" },
              { label: "Chargers", href: "/collections/wall-chargers", emoji: "🔌", color: "#EA580C" },
              { label: "Speakers", href: "/collections/bluetooth-speakers", emoji: "🔊", color: "#7C3AED" },
              { label: "Shop all", href: "/shop", emoji: "🛒", color: "#0f172a" },
            ].map((c) => (
              <Link
                key={c.label}
                href={c.href}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", width: "90px", height: "90px", borderRadius: "10px", background: c.color, padding: "8px", textDecoration: "none", gap: "4px", transition: "opacity 0.18s" }}
              >
                <span style={{ fontSize: "28px" }} aria-hidden>{c.emoji}</span>
                <span style={{ fontFamily: "var(--font-outfit, sans-serif)", fontSize: "11px", fontWeight: 700, color: "#fff", textAlign: "center" }}>{c.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .pdp-main-grid { grid-template-columns: 1fr !important; }
          .similar-grid  { grid-template-columns: repeat(2, 1fr) !important; }
          .trust-grid    { grid-template-columns: 1fr !important; }
          .quick-specs-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

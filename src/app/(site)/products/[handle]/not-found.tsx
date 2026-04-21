import Link from "next/link";

export default function ProductNotFound() {
  return (
    <div className="container-shop py-24 text-center">
      <p className="text-xs uppercase tracking-widest text-brand-500 mb-3">
        404
      </p>
      <h1 className="heading-display text-3xl md:text-4xl text-brand-900">
        Product not found
      </h1>
      <p className="mt-3 text-sm text-brand-600 max-w-md mx-auto">
        This product may have been removed or the URL may be out of date.
      </p>
      <div className="mt-8 flex items-center justify-center gap-3">
        <Link
          href="/shop"
          className="inline-flex items-center rounded-full bg-brand-900 text-white px-6 py-2.5 text-sm font-medium hover:bg-brand-700 transition-colors"
        >
          Browse shop
        </Link>
      </div>
    </div>
  );
}

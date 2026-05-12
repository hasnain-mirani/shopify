import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ProductVariantSelector } from "@/components/product/ProductVariantSelector";
import type { Product } from "@/types";

afterEach(() => {
  cleanup();
});

function buildProduct(): Product {
  return {
    id: "p1",
    handle: "watch",
    title: "Watch",
    description: "",
    availableForSale: true,
    tags: [],
    options: [{ id: "opt-size", name: "Size", values: ["S", "M"] }],
    priceRange: {
      minVariantPrice: { amount: "10", currencyCode: "USD" },
      maxVariantPrice: { amount: "12", currencyCode: "USD" },
    },
    images: [],
    variants: [
      {
        id: "v-s",
        title: "S",
        availableForSale: true,
        selectedOptions: [{ name: "Size", value: "S" }],
        price: { amount: "10", currencyCode: "USD" },
      },
      {
        id: "v-m",
        title: "M",
        availableForSale: true,
        selectedOptions: [{ name: "Size", value: "M" }],
        price: { amount: "12", currencyCode: "USD" },
      },
    ],
  };
}

describe("ProductVariantSelector", () => {
  it("emits the variant when user switches option", async () => {
    const user = userEvent.setup();
    const product = buildProduct();
    const onChange = vi.fn();

    render(<ProductVariantSelector product={product} onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: "M" }));

    const last = onChange.mock.calls.at(-1)?.[0];
    expect(last?.id).toBe("v-m");
  });

  it("hides single Default Title option row", () => {
    const product: Product = {
      ...buildProduct(),
      options: [{ id: "t", name: "Title", values: ["Default Title"] }],
      variants: [
        {
          id: "v0",
          title: "Default Title",
          availableForSale: true,
          selectedOptions: [{ name: "Title", value: "Default Title" }],
          price: { amount: "1", currencyCode: "USD" },
        },
      ],
    };
    const { container } = render(<ProductVariantSelector product={product} />);
    expect(container.querySelector("button")).toBeNull();
  });
});

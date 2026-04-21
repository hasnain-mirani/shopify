import { Header, Footer } from "@/components/layout";
import { CartDrawer } from "@/components/cart";

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />
      <main className="flex-1 flex flex-col">{children}</main>
      <Footer />
      <CartDrawer />
    </>
  );
}

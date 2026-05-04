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
      <main className="flex-1 flex flex-col" style={{ background: "#1A0D00" }}>{children}</main>
      <Footer />
      <CartDrawer />
    </>
  );
}

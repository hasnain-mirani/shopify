import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { AdminMobileNav } from "@/components/admin/AdminMobileNav";
import { getShopInfo } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

/**
 * Admin shell layout: sidebar (desktop) / topbar + bottom nav (mobile).
 * Lives inside the (shell) route group so it does NOT wrap /admin/login.
 */
export default async function AdminShellLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const shop = await getShopInfo().catch(() => null);
  const shopName = shop?.name ?? "Store";

  return (
    <div className="min-h-screen flex">
      <AdminSidebar shopName={shopName} storefrontUrl="/" />
      <div className="flex flex-1 flex-col min-w-0">
        <AdminTopbar shopName={shopName} />
        <main className="flex-1 overflow-x-hidden">{children}</main>
        <AdminMobileNav />
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import { AdminPage } from "@/components/admin/AdminShell";
import { getBannerSliderConfig } from "@/lib/banner-slider-config";
import { BannerSliderForm } from "./BannerSliderForm";

export const metadata: Metadata = {
  title: "Main banner slider",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminBannerSliderPage() {
  const config = await getBannerSliderConfig();
  return (
    <AdminPage
      title="Main banner slider"
      description="Control the hero slider shown at top of the homepage."
    >
      <BannerSliderForm initial={config} />
    </AdminPage>
  );
}

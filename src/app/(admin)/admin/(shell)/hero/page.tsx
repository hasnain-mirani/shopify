import type { Metadata } from "next";
import { AdminPage } from "@/components/admin/AdminShell";
import { getHeroConfig } from "@/lib/hero-config";
import { HeroConfigForm } from "./HeroConfigForm";

export const metadata: Metadata = {
  title: "Home hero",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminHeroPage() {
  const config = await getHeroConfig();
  return (
    <AdminPage
      title="Home hero"
      description="Edit every piece of the homepage hero — copy, CTAs, trust pills, the bento tiles, and the circular badge."
    >
      <HeroConfigForm initial={config} />
    </AdminPage>
  );
}

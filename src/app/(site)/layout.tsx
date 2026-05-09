import { SiteChrome } from "@/components/layout/SiteChrome";
import { AppProviders } from "@/components/providers/AppProviders";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppProviders>
      <SiteChrome>{children}</SiteChrome>
    </AppProviders>
  );
}

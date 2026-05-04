import type { Metadata, Viewport } from "next";
import {
  DM_Sans,
  Outfit,
  Geist_Mono,
  Playfair_Display,
} from "next/font/google";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import "./globals.css";

/* Typography:
 *   - Playfair Display → hero / section headings (900 weight, italic)
 *   - DM Sans          → body copy (300/400/500/600)
 *   - Outfit           → UI chrome, numbers, micro-labels
 *   - Geist Mono       → code snippets
 */
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  weight: ["400", "700", "900"],
  style: ["normal", "italic"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
  weight: ["300", "400", "500", "600"],
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const siteName = "Glow Store PK";
const siteTagline = "Premium Mobile Accessories & Smart Tech";
const defaultDescription =
  "Premium phone accessories, smartwatches, power banks, and smart tech — hand-picked for tech enthusiasts. Free shipping worldwide.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} — ${siteTagline}`,
    template: `%s | ${siteName}`,
  },
  description: defaultDescription,
  applicationName: siteName,
  keywords: [
    "phone accessories",
    "phone cases",
    "smartwatch",
    "smart watch",
    "power bank",
    "wireless charger",
    "earbuds",
    "mobile accessories",
    "glow store",
    "tech accessories",
    "pakistan",
  ],
  authors: [{ name: siteName }],
  openGraph: {
    type: "website",
    siteName,
    title: `${siteName} — ${siteTagline}`,
    description: defaultDescription,
    url: siteUrl,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} — ${siteTagline}`,
    description: defaultDescription,
  },
  icons: {
    icon: "/favicon.ico",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#1a0d00" },
    { media: "(prefers-color-scheme: dark)",  color: "#0d0600" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${playfair.variable} ${dmSans.variable} ${outfit.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-brand-900">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}

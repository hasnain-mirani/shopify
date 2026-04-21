import { Toaster } from "react-hot-toast";

/**
 * The `(admin)` route group gets its own layout — NO site Header, Footer, or
 * CartDrawer. This keeps the storefront and the admin panel visually
 * independent even though they share the same Next.js app.
 */
export default function AdminRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex-1 min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 font-sans">
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#18181b",
            color: "#fafafa",
            fontSize: "0.875rem",
            borderRadius: "0.5rem",
          },
        }}
      />
    </div>
  );
}

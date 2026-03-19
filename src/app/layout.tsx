import type { Metadata } from "next";
import "./globals.css";
import { ClientProviders } from "@/providers/client-providers";

export const metadata: Metadata = {
  title: "VWO Feature Flags POC",
  description:
    "Full-stack Next.js proof of concept demonstrating VWO feature flag capabilities",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/next";
import { Toaster } from "sonner";
import { SITE_URL } from "@/lib/config";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const title = "TechnoVIT CMS";
const description = "The Content Management System powering TechnoVIT'26";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title,
  description,
  openGraph: {
    title,
    description,
    siteName: title,
    type: "website",
    images: [{ url: "/icon.png", width: 512, height: 512, alt: title }],
  },
  twitter: {
    card: "summary",
    title,
    description,
    images: ["/icon.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.className} antialiased`}>
          {children}
          <Toaster
            position="top-right"
            richColors
            toastOptions={{ style: { borderRadius: 0 } }}
          />
        </body>
      </html>
      <Analytics />
    </ClerkProvider>
  );
}

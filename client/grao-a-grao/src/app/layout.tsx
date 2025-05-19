"use-client"

import type { Metadata } from "next";
import { Geist, Geist_Mono, Roboto } from "next/font/google";
import "@radix-ui/themes/styles.css";
import { Theme, ThemePanel } from "@radix-ui/themes";
import "@/styles/globals.css";
import { Toaster } from "@/components/ui/sonner"
import GlobalFetchInterceptor from "@/components/GlobalFetcherInterceptor";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const roboto = Roboto({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  title: "Grão a Grão",
  description: "Gerenciamento de estoque de grão a grão",
};

// Export viewport separately.
export const viewport = {
  width: "device-width",
  initialScale: 1.0,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDev = process.env.NODE_ENV === "development";

  return (
    <html lang="en">

      <body
        className={`${roboto.variable} ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Theme
          appearance="dark"
          accentColor="lime"
          grayColor="olive"
          radius="large"
          panelBackground="solid"
        >

          {isDev && <ThemePanel />} {/* ← only in dev */}

          <GlobalFetchInterceptor>{children}</GlobalFetchInterceptor>
          <Toaster duration={3000} closeButton />
        </Theme>
      </body>
    </html>
  );
}
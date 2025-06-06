import type { Metadata } from "next";
import { Geist, Geist_Mono, Roboto } from "next/font/google";
import "@radix-ui/themes/styles.css";
import { Theme, ThemePanel } from "@radix-ui/themes";
import "@/styles/globals.css";
import RootProviders from "@/providers/RootProviders";
import { ThemeProvider } from "next-themes";

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

export const viewport = {
  width: "device-width",
  initialScale: 1.0,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  
  const isDev = process.env.NODE_ENV === "development";
  
  return (
    <html lang="pt-BR">
      <body className={`${roboto.variable} ${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider attribute={"class"}>
          <Theme appearance="inherit" accentColor="lime" grayColor="olive" radius="large" panelBackground="solid">

          {isDev && <ThemePanel />}

          <RootProviders>{children}</RootProviders>

          </Theme>
        </ThemeProvider>
      </body>
    </html>
  );
}
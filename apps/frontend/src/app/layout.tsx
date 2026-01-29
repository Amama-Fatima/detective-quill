import type { Metadata } from "next";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/auth-context";
import { Inter, Crimson_Text, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/header";
import { TanstackProvider } from "@/providers/tanstack-provider";

const crimsonText = Crimson_Text({
  variable: "--font-crimson",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Detective's Quill - Crime Fiction Writing Platform",
  description:
    "The ultimate platform for crime fiction novel writers. Create, organize, and publish your mystery stories.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${crimsonText.variable} ${inter.variable} ${geistMono.variable} font-serif antialiased`}
      >
        <TanstackProvider>
          <AuthProvider>
            <Header />
            {children}
            <Toaster richColors position="top-right" />
          </AuthProvider>
        </TanstackProvider>
      </body>
    </html>
  );
}

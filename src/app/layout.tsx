import "@/app/global.css";
import { RootProvider } from "fumadocs-ui/provider";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/components/auth-provider";
import { AISearchTrigger } from "@/components/search";
import type { Metadata } from "next";
import { cn } from "@/lib/utils";

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Dentist Abroad Navigator",
  description: "The Fastest Pathway for International Dentists to U.S. Dental Schools.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function Layout({ children }: LayoutProps<"/">) {
  return (
    <AuthProvider>
      <html
        lang="en"
        className={cn(`${fontSans.variable} ${fontMono.variable} font-sans antialiased`)}
        suppressHydrationWarning
      >
        <body className="flex min-h-screen flex-col">
          <RootProvider>{children}</RootProvider>
          <AISearchTrigger />
        </body>
      </html>
    </AuthProvider>
  );
}

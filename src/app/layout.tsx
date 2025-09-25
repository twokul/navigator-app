import "@/app/global.css";
import { RootProvider } from "fumadocs-ui/provider";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/components/auth-provider";
import type { Metadata } from "next";

const inter = Inter({
  subsets: ["latin"],
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
      <html lang="en" className={inter.className} suppressHydrationWarning>
        <body className="flex min-h-screen flex-col">
          <RootProvider>{children}</RootProvider>
        </body>
      </html>
    </AuthProvider>
  );
}

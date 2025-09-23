import "@/app/global.css";
import { RootProvider } from "fumadocs-ui/provider";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/components/auth-provider";

const inter = Inter({
  subsets: ["latin"],
});

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

import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { baseOptions } from "@/lib/layout.shared";
import { source } from "@/lib/source";
import SidebarFooter from "@/components/sidebar-footer";
import PaymentGuard from "@/components/payment-guard";

export default function Layout({ children }: LayoutProps<"/c">) {
  const base = baseOptions();
  const sidebar = {
    enabled: true,
    footer: <SidebarFooter />,
  };

  return (
    <PaymentGuard>
      <DocsLayout tree={source.pageTree} {...base} sidebar={sidebar}>
        {children}
      </DocsLayout>
    </PaymentGuard>
  );
}

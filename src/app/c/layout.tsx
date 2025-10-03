import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { baseOptions } from "@/lib/layout.shared";
import { source } from "@/lib/source";
import SidebarFooter from "@/components/sidebar-footer";
import PaymentGuard from "@/components/payment-guard";
import { toCapitalCase } from "@/lib/name-utils";

export default function Layout({ children }: LayoutProps<"/c">) {
  const base = baseOptions();
  const sidebar = {
    enabled: true,
    footer: <SidebarFooter />,
  };

  source.pageTree.children?.forEach((page) => {
    if (page.name) {
      page.name = toCapitalCase(page.name as string);
    }
  });

  return (
    <PaymentGuard>
      <DocsLayout tree={source.pageTree} {...base} sidebar={sidebar}>
        {children}
      </DocsLayout>
    </PaymentGuard>
  );
}

import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { baseOptions } from "@/lib/layout.shared";
import { source } from "@/lib/source";
import { UserRound } from "lucide-react";
import Link from "next/link";

export default function Layout({ children }: LayoutProps<"/c">) {
  const base = baseOptions();
  const sidebar = {
    enabled: true,
    footer: (
      <div className="text-fd-foreground hover:text-fd-accent-foreground/80 bottom-4 left-4 flex cursor-pointer pt-2 transition-colors hover:transition-none md:absolute md:pt-0">
        <Link href="/p">
          <div className="flex flex-row items-center gap-2">
            <UserRound className="bg-fd-accent size-6 rounded-full p-1" />
            <span>Sam Koch</span>
          </div>
        </Link>
      </div>
    ),
  };

  return (
    <DocsLayout tree={source.pageTree} {...base} sidebar={sidebar}>
      {children}
    </DocsLayout>
  );
}

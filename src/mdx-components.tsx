import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";
import Image from "next/image";
import { Lightbulb } from "lucide-react";

function CustomAside({ children, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <aside
      {...props}
      className="prose my-4 rounded-r-md border-l-4 border-blue-200 bg-blue-50 p-4 shadow-sm"
      style={{ borderLeft: "4px solid #3b82f6", backgroundColor: "#eff6ff" }}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-600">
          <Lightbulb className="h-4 w-4 text-white" />
        </div>
        <div className="text-sm leading-relaxed text-gray-700 [&>p]:m-0 [&>p]:text-sm [&>p]:leading-relaxed [&>p]:text-gray-700">
          {children}
        </div>
      </div>
    </aside>
  );
}

function CloudflareVideo({ url }: { url: string }) {
  return (
    <div style={{ position: "relative", paddingTop: "56.25%" }}>
      <iframe
        src={url}
        loading="lazy"
        style={{
          border: "none",
          position: "absolute",
          top: 0,
          left: 0,
          height: "100%",
          width: "100%",
        }}
        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
        allowFullScreen={true}
      ></iframe>
    </div>
  );
}

// use this function to get MDX components, you will need it for rendering MDX
export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    Image,
    ...components,
    Aside: CustomAside,
    CloudflareVideo: CloudflareVideo,
  };
}

import { source } from "@/lib/source";
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from "fumadocs-ui/page";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createRelativeLink } from "fumadocs-ui/mdx";
import { getMDXComponents } from "@/mdx-components";
import { Link } from "@/components/link";
import Image from "next/image";
import type { ComponentProps } from "react";

export default async function Page(props: PageProps<"/c/[[...slug]]">) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const MDXContent = page.data.body;

  return (
    <>
      {page.data.coverImage && (
        <div className="relative h-72">
          <Image
            fill
            objectFit="cover"
            objectPosition="center"
            alt="NJ Official Dental Board Website"
            src={page.data.coverImage}
          />
        </div>
      )}
      <DocsPage toc={page.data.toc} full={page.data.full}>
        <DocsTitle>{page.data.title}</DocsTitle>
        <DocsDescription>{page.data.description}</DocsDescription>
        {page.data.dynamicContent ? (
          <div className="flex-1">
            <MDXContent
              components={getMDXComponents({
                // Custom link handler that supports both internal and external links
                a: (props: ComponentProps<"a">) => {
                  // Check if it's an internal link (starts with / or #)
                  if (props.href?.startsWith("/") || props.href?.startsWith("#")) {
                    return createRelativeLink(source, page)(props);
                  }
                  // For external links and link keys, use our Link component
                  // Ensure href is defined before passing to Link
                  if (!props.href) {
                    return <a {...props} />;
                  }
                  return (
                    <Link href={props.href} className={props.className} {...props}>
                      {props.children}
                    </Link>
                  );
                },
              })}
            />
          </div>
        ) : (
          <DocsBody>
            <MDXContent
              components={getMDXComponents({
                // Custom link handler that supports both internal and external links
                a: (props: ComponentProps<"a">) => {
                  // Check if it's an internal link (starts with / or #)
                  if (props.href?.startsWith("/") || props.href?.startsWith("#")) {
                    return createRelativeLink(source, page)(props);
                  }
                  // For external links and link keys, use our Link component
                  // Ensure href is defined before passing to Link
                  if (!props.href) {
                    return <a {...props} />;
                  }
                  return (
                    <Link href={props.href} className={props.className} {...props}>
                      {props.children}
                    </Link>
                  );
                },
              })}
            />
          </DocsBody>
        )}
      </DocsPage>
    </>
  );
}

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(props: PageProps<"/c/[[...slug]]">): Promise<Metadata> {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) {
    notFound();
  }

  const metadata: Metadata = {
    title: page.data.title,
    description: page.data.description,
  };

  if (page.data.coverImage) {
    metadata.openGraph = {
      images: [page.data.coverImage],
    };
  }

  return metadata;
}

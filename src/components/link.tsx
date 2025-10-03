import React from "react";
import { getLink } from "@/lib/links";

interface LinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  target?: string;
  rel?: string;
}

/**
 * Component for rendering links that can handle both external URLs and link keys
 */
export function Link({
  href,
  children,
  className,
  target = "_blank",
  rel = "noopener noreferrer",
  ...props
}: LinkProps) {
  // Check if href is an email address
  const isEmail = href.includes("@") && href.includes(".");

  // Check if href is a link key (doesn't start with http/https, contains dots, but is not an email)
  const isLinkKey =
    !href.startsWith("http") &&
    !href.startsWith("/") &&
    !href.startsWith("#") &&
    !isEmail &&
    href.includes(".");

  const actualHref = isLinkKey ? getLink(href) || "#" : href;
  const shouldOpenInNewTab = actualHref.startsWith("http") && !actualHref.startsWith("mailto:");

  return (
    <a
      href={actualHref}
      className={className}
      target={shouldOpenInNewTab ? target : undefined}
      rel={shouldOpenInNewTab ? rel : undefined}
      {...props}
    >
      {children}
    </a>
  );
}

/**
 * Component for rendering external links with consistent styling
 */
export function ExternalLink({
  href,
  children,
  className = "",
  ...props
}: Omit<LinkProps, "target" | "rel">) {
  return (
    <Link
      href={href}
      className={`text-blue-600 underline hover:text-blue-800 ${className}`}
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    >
      {children}
    </Link>
  );
}

/**
 * Component for rendering internal links
 */
export function InternalLink({
  href,
  children,
  className = "",
  ...props
}: Omit<LinkProps, "target" | "rel">) {
  return (
    <Link
      href={href}
      className={`text-blue-600 underline hover:text-blue-800 ${className}`}
      {...props}
    >
      {children}
    </Link>
  );
}

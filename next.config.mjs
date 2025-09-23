import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "file.notion.so",
        port: "",
        pathname: "/f/f/**",
      },
    ],
  },
  redirects() {
    return [
      {
        source: "/c",
        destination: "/c/getting-started/introduction",
        permanent: true,
      },
    ];
  },
};

export default withMDX(config);

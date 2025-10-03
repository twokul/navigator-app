import { withAuth } from "@kinde-oss/kinde-auth-nextjs/middleware";
// import type { NextRequest } from "next/server";
// import { KindeClient } from "@/lib/kinde-client";

// interface KindeAuthRequest extends NextRequest {
//   kindeAuth: {
//     token: {
//       org_code: string;
//       user_properties: {
//         paid: {
//           v: "true" | "false";
//         };
//       };
//     };
//     user: {
//       id: string;
//       email: string;
//     };
//   };
// }

/**
 * Middleware function that handles authentication for the application.
 *
 * This middleware uses Kinde's withAuth wrapper to protect routes and ensure
 * users are authenticated before accessing protected resources. It allows
 * certain public paths to be accessed without authentication, such as Stripe
 * webhooks and Next.js internal routes.
 *
 * https://docs.kinde.com/developer-tools/sdks/backend/nextjs-sdk/#set-up-middleware
 *
 * @param request - The incoming Next.js request object
 * @returns The result of the withAuth middleware processing
 * ```
 */
export default withAuth(
  // async function middleware(_req: KindeAuthRequest) {
  //   // const kindeClient = KindeClient.fromEnv();
  //   // await kindeClient.refreshUserClaims(req.kindeAuth.user.id);
  // },
  {
    publicPaths: ["/api/stripe", "/api/auth", "/api/check-payment", "/_next", "/favicon.ico"],
  },
);

export const config = {
  matcher: [
    // Run on everything but Next internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};

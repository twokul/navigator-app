import { NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import debug from "debug";

/**
 * Authentication Token Refresh API Route
 *
 * This endpoint handles the refresh of authentication tokens for the Kinde
 * authentication system. It's designed to be called by the client when tokens
 * are about to expire or have expired.
 *
 * Key Features:
 * - Refreshes both access and ID tokens using Kinde's refresh token mechanism
 * - Updates HTTP-only cookies with fresh tokens automatically
 * - Provides validation that tokens were successfully refreshed
 * - Handles errors gracefully with proper HTTP status codes
 *
 * Usage:
 * The client should call this endpoint when:
 * - Access tokens are close to expiration
 * - API calls return 401 Unauthorized responses
 * - The application needs to ensure valid authentication state
 *
 * Response Format:
 * - Success: { ok: true, hasAccessToken: boolean, hasIdToken: boolean }
 * - Error: { error: string } with appropriate HTTP status code
 */

const log = debug("api:auth:refresh");

/**
 * POST /api/auth/refresh
 *
 * Refreshes authentication tokens and updates cookies.
 *
 * @returns {Promise<NextResponse>} JSON response indicating success/failure
 */
export async function POST() {
  try {
    // Get Kinde server session utilities for token management
    const { refreshTokens, getAccessTokenRaw, getIdTokenRaw } = getKindeServerSession();

    // Refresh tokens - this will:
    // 1. Use the refresh token to get new access and ID tokens
    // 2. Automatically update HTTP-only cookies with fresh tokens
    // 3. Handle token rotation if configured in Kinde
    await refreshTokens();

    // Validate that tokens were successfully refreshed by checking their presence
    // This is a sanity check to ensure the refresh operation completed successfully
    const at = await getAccessTokenRaw();
    const it = await getIdTokenRaw();

    log("Refreshed tokens");

    // Return success response with token validation status
    return NextResponse.json({
      ok: true,
      hasAccessToken: !!at,
      hasIdToken: !!it,
    });
  } catch (error) {
    // Log the error for debugging purposes
    log("Error refreshing token:", error);

    // Return error response with appropriate HTTP status
    return NextResponse.json({ error: "Failed to refresh token" }, { status: 500 });
  }
}

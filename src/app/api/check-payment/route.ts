import { NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import debug from "debug";

/**
 * Payment Status Check API Route
 *
 * This endpoint verifies whether a user has paid for access to the Navigator
 * application by checking their Kinde permissions. It's used to determine
 * if a user should have access to premium content and features.
 *
 * Key Features:
 * - Refreshes authentication tokens to ensure current session state
 * - Checks for the "access:navigator" permission which indicates paid access
 * - Returns a simple boolean indicating payment status
 * - Handles authentication errors and unauthorized access gracefully
 *
 * Usage:
 * The client should call this endpoint when:
 * - Determining if user should see premium content
 * - Checking access before displaying paid features
 * - Validating subscription status on page load
 * - Implementing paywall logic
 *
 * Response Format:
 * - Success: { paid: boolean } - true if user has navigator access
 * - Error: { error: string } with appropriate HTTP status code
 */

const log = debug("api:check-payment");

/**
 * POST /api/check-payment
 *
 * Checks if the authenticated user has paid access to the Navigator application.
 *
 * @returns {Promise<NextResponse>} JSON response with payment status
 */
export async function POST() {
  try {
    // Get Kinde server session utilities for token and permission management
    const { refreshTokens, getPermissions } = getKindeServerSession();

    // Refresh tokens to ensure we have the latest authentication state
    // This is important because permissions might have changed since last check
    await refreshTokens();

    // Retrieve the user's current permissions from Kinde
    const permissions = await getPermissions();

    // If no permissions are available, the user is not properly authenticated
    if (!permissions) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has the specific permission that indicates paid access
    // The "access:navigator" permission is granted when a user has a valid subscription
    const hasNavigatorAccess = permissions.permissions?.some(
      (permission: string) => permission === "access:navigator",
    );

    log("Checking payment status:", hasNavigatorAccess);

    // Return the payment status as a boolean for easy client-side consumption
    return NextResponse.json({ paid: hasNavigatorAccess });
  } catch (error) {
    // Log the error for debugging and monitoring purposes
    log("Error checking payment status:", error);

    // Return a generic error response to avoid exposing internal details
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

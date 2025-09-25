import debug from "debug";
import { type AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

const log = debug("payment:utils");

/**
 * Result interface for payment status checks
 *
 * This interface represents the response from payment status verification.
 * It includes both the success status of the API call and the payment data.
 */
export interface PaymentCheckResult {
  success: boolean; // Whether the API call was successful
  data?: {
    paid: boolean; // Whether the user has paid (from Kinde permissions)
  };
}

/**
 * Checks payment status by calling the check-payment API
 *
 * This function verifies whether the current user has paid for access to the application.
 * It calls the server-side API which checks the user's permissions in Kinde to determine
 * if they have the "access:navigator" permission (which is granted after successful payment).
 *
 * The payment status is determined by:
 * 1. Checking if the user has the required permission in Kinde
 * 2. The permission is granted by the Stripe webhook after successful payment
 * 3. This provides a reliable way to verify payment status without direct Stripe integration
 *
 * @returns Promise that resolves to payment check result with success status and payment data
 */
export const checkPaymentStatus = async (): Promise<PaymentCheckResult> => {
  // Call the server-side API to check payment status
  const response = await fetch("/api/check-payment", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Parse the response data
  const data = await response.json();

  // Return success if both the API call succeeded and the user has paid
  return { success: response.ok && data.paid, data };
};

/**
 * Refreshes server-side authentication tokens
 *
 * This function triggers a refresh of the user's authentication tokens on the server.
 * It's typically called after a successful payment to ensure the user's new permissions
 * are immediately available in their session.
 *
 * The refresh process:
 * 1. Calls the server-side auth refresh endpoint
 * 2. Updates the user's claims in Kinde
 * 3. Ensures new permissions are available without requiring a logout/login
 *
 * This is particularly important after payment completion, as the webhook grants
 * new permissions that need to be reflected in the user's current session.
 *
 * @returns Promise that resolves when token refresh is complete
 */
export const refreshTokens = async (): Promise<void> => {
  log("Refreshing server-side tokens...");
  await fetch("/api/auth/refresh", { method: "POST" });
};

/**
 * Refreshes client-side authentication data
 *
 * This function refreshes the client-side authentication state by calling
 * the provided Kinde authentication functions. It's used to ensure that
 * the client-side state reflects any server-side permission changes.
 *
 * The refresh process:
 * 1. Calls the getPermissions function to refresh permission data
 * 2. Calls the getToken function to refresh the authentication token
 * 3. Ensures the client-side state is synchronized with server-side changes
 *
 * This is typically called after a successful payment to ensure the user
 * can immediately access protected resources without a page refresh.
 *
 * @param getPermissions - Function to refresh user permissions from Kinde
 * @param getToken - Function to refresh the authentication token
 * @returns Promise that resolves when client data refresh is complete
 */
export const refreshClientData = async (
  getPermissions: () => Record<string, unknown>,
  getToken: () => string | null,
): Promise<void> => {
  log("Refreshing client-side data...");

  // Refresh permissions to get updated user permissions
  getPermissions();

  // Refresh token to ensure authentication state is current
  getToken();
};

/**
 * Redirects to the main app after successful payment
 *
 * This function handles the user experience flow after a successful payment.
 * It provides a brief delay to allow the user to see the success message
 * before automatically redirecting them to the main application.
 *
 * The redirect process:
 * 1. Waits 2 seconds to allow the user to see the success message
 * 2. Redirects to the configured post-login URL (typically the main app)
 * 3. Falls back to "/c" if no specific redirect URL is configured
 *
 * The delay is important for user experience as it:
 * - Gives users time to see the payment success confirmation
 * - Allows the authentication refresh to complete
 * - Provides a smooth transition to the main application
 *
 * @param router - Next.js App Router instance for navigation
 */
export const redirectToApp = (router: AppRouterInstance): void => {
  // Wait 2 seconds to allow user to see success message and for auth refresh to
  // complete
  setTimeout(() => {
    // Redirect to the configured post-login URL or default to main app
    router.push(process.env.NEXT_PUBLIC_KINDE_POST_LOGIN_REDIRECT_URL || "/c");
  }, 2000);
};

import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import debug from "debug";
import { WebhookHandler } from "@/lib/webhook-utils";

const log = debug("api:stripe:webhook");

/**
 * Stripe Webhook Handler
 *
 * This endpoint receives webhook events from Stripe when payments are completed.
 * It processes successful payments by granting access permissions to users in Kinde.
 *
 * Webhook Flow:
 * 1. Stripe sends webhook with payment completion event
 * 2. We verify the webhook signature for security
 * 3. We extract the customer email from the payment session
 * 4. We find the user in Kinde by email
 * 5. We grant the "access:navigator" permission to the user
 * 6. We refresh the user's claims to make the permission immediately available
 *
 * Security:
 * - All webhooks are verified using Stripe's signature verification
 * - Environment variables are validated before processing
 * - Errors are logged but sensitive information is not exposed
 *
 * Error Handling:
 * - Invalid signatures return 400 Bad Request
 * - Configuration errors return 500 Internal Server Error
 * - Processing errors are logged and return 500
 * - Retry logic is handled in the WebhookHandler class
 */
export async function POST(req: NextRequest) {
  try {
    // Extract the raw request body as text for signature verification
    // Stripe requires the raw body to verify the webhook signature
    const body = await req.text();

    // Get the Stripe signature from request headers
    // This signature is used to verify the webhook came from Stripe
    const signature = (await headers()).get("stripe-signature");

    // Validate that we have a signature - this is required for security
    if (!signature) {
      log("No Stripe signature found in request");
      return NextResponse.json({ error: "No signature" }, { status: 400 });
    }

    // Initialize the webhook handler with environment variables
    // This validates all required environment variables are present
    const webhookHandler = WebhookHandler.fromEnv();

    // Verify the webhook signature to ensure it came from Stripe
    // This prevents malicious actors from sending fake webhook events
    const event = await webhookHandler.verifyWebhookSignature(body, signature);
    log(`Received webhook event: ${event.type}`);

    // Process the webhook event based on its type
    // Currently handles: checkout.session.completed, and logs other events
    await webhookHandler.processWebhookEvent(event);

    // Return success response to Stripe
    // Stripe expects a 200 response to confirm we received the webhook
    return NextResponse.json({ received: true });
  } catch (error) {
    // Log the error for debugging purposes
    log("Webhook processing error:", error);

    // Return appropriate HTTP status codes based on error type
    if (error instanceof Error) {
      // Invalid signature - client error (400)
      if (error.message.includes("signature")) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
      }
      // Missing environment variables - server configuration error (500)
      if (error.message.includes("environment variables")) {
        return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
      }
    }

    // Generic server error for any other issues (500)
    // This ensures we don't expose internal details to potential attackers
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

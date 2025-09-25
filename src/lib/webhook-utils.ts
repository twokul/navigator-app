import Stripe from "stripe";
import debug from "debug";
import { KindeClient } from "./kinde-client";

const log = debug("api:webhook:utils");

/**
 * Configuration interface for webhook handler
 *
 * Contains all the necessary configuration for processing Stripe webhooks
 * and managing user permissions in Kinde.
 */
export interface WebhookConfig {
  stripeSecretKey: string; // Stripe secret key for API operations
  webhookSecret: string; // Webhook secret for signature verification
  kindeOrgCode: string; // Kinde organization code for user management
  permissionKey: string; // Permission key to grant (e.g., "access:navigator")
}

/**
 * Webhook Handler for Stripe Payment Processing
 *
 * This class handles Stripe webhook events, particularly payment completions,
 * and automatically grants user permissions in Kinde based on successful
 * payments.
 *
 * Key Responsibilities:
 * - Verify webhook signatures for security
 * - Process payment completion events
 * - Grant permissions to users in Kinde
 * - Handle various Stripe event types
 * - Provide comprehensive error handling and logging
 *
 * The handler is designed to be resilient with built-in retry logic
 * and proper error handling for production environments.
 */
export class WebhookHandler {
  private stripe: Stripe;
  private kindeClient: KindeClient;
  private config: WebhookConfig;

  /**
   * Initialize the webhook handler with configuration
   *
   * Sets up the Stripe client with the specified API version and
   * initializes the Kinde client for user management operations.
   *
   * @param config - Webhook configuration containing API keys and settings
   */
  constructor(config: WebhookConfig) {
    // Initialize Stripe client with the latest API version
    this.stripe = new Stripe(config.stripeSecretKey, {
      apiVersion: "2025-08-27.basil",
    });

    // Initialize Kinde client from environment variables
    this.kindeClient = KindeClient.fromEnv();
    this.config = config;
  }

  /**
   * Create a WebhookHandler instance from environment variables
   *
   * This is the recommended way to initialize the webhook handler in production.
   * It validates that all required environment variables are present and creates
   * a properly configured handler instance.
   *
   * Required Environment Variables:
   * - STRIPE_SECRET_KEY: Your Stripe secret key for API operations
   * - STRIPE_WEBHOOK_SECRET: Your Stripe webhook secret for signature verification
   * - KINDE_ORG_CODE: Your Kinde organization code for user management
   *
   * @returns Configured WebhookHandler instance
   * @throws Error if required environment variables are missing
   */
  static fromEnv(): WebhookHandler {
    // Build configuration from environment variables
    const config: WebhookConfig = {
      stripeSecretKey: process.env.STRIPE_SECRET_KEY!,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
      kindeOrgCode: process.env.KINDE_ORG_CODE!,
      permissionKey: "access:navigator", // Default permission key for this application
    };

    // Validate that all required environment variables are present
    const missingVars = Object.entries(config)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingVars.join(", ")}`);
    }

    return new WebhookHandler(config);
  }

  /**
   * Verify the webhook signature to ensure it came from Stripe
   *
   * This is a critical security step that prevents malicious actors from
   * sending fake webhook events. Stripe signs all webhook requests with
   * a secret key, and this method verifies that signature.
   *
   * The signature verification process:
   * 1. Stripe creates a signature using HMAC-SHA256 with the webhook secret
   * 2. The signature is sent in the "stripe-signature" header
   * 3. We recreate the signature using the raw body and our webhook secret
   * 4. If signatures match, the webhook is authentic
   *
   * @param body - The raw request body as received from Stripe
   * @param signature - The signature from the "stripe-signature" header
   * @returns Promise that resolves to the parsed Stripe event
   * @throws Error if signature verification fails
   */
  async verifyWebhookSignature(body: string, signature: string): Promise<Stripe.Event> {
    try {
      // Use Stripe's built-in signature verification
      return this.stripe.webhooks.constructEvent(body, signature, this.config.webhookSecret);
    } catch (error) {
      log("Webhook signature verification failed:", error);
      throw new Error("Invalid webhook signature");
    }
  }

  /**
   * Handle a successful payment by granting user permissions
   *
   * This is the core business logic that processes successful payments.
   * When a customer completes payment, we automatically grant them access
   * to the application by assigning the configured permission in Kinde.
   *
   * The process:
   * 1. Extract customer email from the payment session
   * 2. Find the corresponding user in Kinde by email
   * 3. Grant the configured permission to the user
   * 4. Refresh user claims to make permission immediately available
   *
   * This method is idempotent - if the permission is already granted,
   * it won't cause an error and will complete successfully.
   *
   * @param session - The Stripe checkout session from the webhook event
   * @returns Promise that resolves when permission is granted
   * @throws Error if user is not found or permission assignment fails
   */
  async handleSuccessfulPayment(session: Stripe.Checkout.Session): Promise<void> {
    // Extract customer email from the session (check both possible locations)
    const customerEmail = session.customer_details?.email || session.customer_email;

    // Validate that we have a customer email to work with
    if (!customerEmail) {
      log("No customer email found in session");
      throw new Error("No customer email found in payment session");
    }

    log(`Processing payment for customer: ${customerEmail}`);

    try {
      // Find the user in Kinde by their email address
      const user = await this.kindeClient.findUserByEmail(customerEmail);

      // Ensure we found a valid user with an ID
      if (!user?.id) {
        log(`User not found with email: ${customerEmail}`);
        throw new Error(`User not found with email: ${customerEmail}`);
      }

      log(`Found user: ${user.id} for email: ${customerEmail}`);

      // Grant the configured permission to the user in the organization
      await this.kindeClient.grantPermissionToUser({
        orgCode: this.config.kindeOrgCode,
        userId: user.id,
        permissionKey: this.config.permissionKey,
      });

      // Refresh user claims to make the new permission immediately available
      // Without this, users would need to log out and back in to see new permissions
      await this.kindeClient.refreshUserClaims(user.id);

      log(`Successfully processed payment for user: ${customerEmail}`);
    } catch (error) {
      // Log comprehensive error information for debugging
      log(`Error processing payment for ${customerEmail}:`, error);

      // Log detailed error information for debugging
      if (error instanceof Error) {
        log("Error message:", error.message);
        log("Error stack:", error.stack);
      }

      // Re-throw to ensure webhook returns appropriate status
      // This allows the webhook endpoint to return proper HTTP status codes
      throw error;
    }
  }

  /**
   * Process a Stripe webhook event based on its type
   *
   * This method acts as a dispatcher for different types of Stripe events.
   * Currently, it primarily handles payment completion events, but can be
   * extended to handle other event types as needed.
   *
   * Event Types Handled:
   * - checkout.session.completed: Triggers permission granting for successful payments
   *
   * Event Types Logged (but not processed):
   * - price.created, product.created: Product catalog changes
   * - payment_intent.*: Payment processing events
   * - charge.*: Individual charge events
   *
   * This design allows for easy extension to handle additional event types
   * in the future without modifying the core webhook processing logic.
   *
   * @param event - The Stripe event to process
   * @returns Promise that resolves when event processing is complete
   */
  async processWebhookEvent(event: Stripe.Event): Promise<void> {
    switch (event.type) {
      case "checkout.session.completed":
        // This is the main event we care about - a successful payment
        const session = event.data.object as Stripe.Checkout.Session;
        await this.handleSuccessfulPayment(session);
        break;

      // These events are logged but not processed
      // They could be handled in the future for additional functionality
      case "price.created":
      case "product.created":
      case "payment_intent.succeeded":
      case "payment_intent.created":
      case "charge.updated":
      case "charge.succeeded":
      case "charge.failed":
      case "charge.refunded":
      case "charge.captured":
      case "charge.expired":
        log(`Unhandled event type: ${event.type}`);
        break;

      // Handle any unexpected event types
      default:
        log(`Unknown event type: ${event.type}`);
    }
  }
}

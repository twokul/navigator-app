"use client";

import { useEffect } from "react";
import debug from "debug";

const log = debug("stripe:buy-button");

/**
 * Stripe Buy Button component that loads the Stripe buy button script
 * and renders the buy button with the specified configuration.
 *
 * Uses environment variables for configuration:
 * - NEXT_PUBLIC_STRIPE_BUY_BUTTON_ID: The Stripe buy button ID
 * - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: The Stripe publishable key
 *
 * @param className - Optional CSS class for styling
 */
export default function StripeBuyButton() {
  const buyButtonId = process.env.NEXT_PUBLIC_STRIPE_BUY_BUTTON_ID;
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

  // Validate required environment variables
  if (!buyButtonId || !publishableKey) {
    log("Missing required Stripe environment variables:", {
      buyButtonId: !!buyButtonId,
      publishableKey: !!publishableKey,
    });
    return (
      <div>
        <p className="text-sm text-red-600">Stripe configuration missing</p>
      </div>
    );
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    // Load the Stripe buy button script if not already loaded
    if (!document.querySelector('script[src="https://js.stripe.com/v3/buy-button.js"]')) {
      const script = document.createElement("script");
      script.src = "https://js.stripe.com/v3/buy-button.js";
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  return (
    <div
      dangerouslySetInnerHTML={{
        __html: `<stripe-buy-button buy-button-id="${buyButtonId}" publishable-key="${publishableKey}"></stripe-buy-button>`,
      }}
    />
  );
}

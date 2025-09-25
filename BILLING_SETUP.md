# Billing Setup Instructions

This document explains how to set up the billing functionality with Stripe and Kinde.

## Environment Variables

Add the following environment variables to your `.env.local` file:

```bash
# Kinde Configuration
KINDE_CLIENT_ID=your_kinde_client_id
KINDE_CLIENT_SECRET=your_kinde_client_secret
KINDE_ISSUER_URL=https://your-domain.kinde.com
KINDE_API_TOKEN=your_kinde_api_token
KINDE_SITE_URL=http://localhost:3000
KINDE_POST_LOGIN_REDIRECT_URL=http://localhost:3000/c
KINDE_POST_LOGOUT_REDIRECT_URL=http://localhost:3000

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
NEXT_PUBLIC_STRIPE_PRODUCT_LINK=https://buy.stripe.com/your-product-link

# Next.js Environment Variables
NEXT_PUBLIC_KINDE_POST_LOGIN_REDIRECT_URL=http://localhost:3000/c
```

## Installation

Install the required dependencies:

```bash
pnpm add stripe @stripe/stripe-js
```

Note: The webhook implementation uses direct HTTP calls to the Kinde Management API, so no additional Kinde SDK packages are required.

## Stripe Setup

1. Create a Stripe account at https://stripe.com
2. Get your API keys from the Stripe Dashboard
3. Create a product and get the buy button URL (already provided: https://buy.stripe.com/cNieVegGQ1Sy2pvbnMfUQ00)
4. Set up a webhook endpoint pointing to `https://your-domain.com/api/stripe/webhook`
5. Configure the webhook to listen for `checkout.session.completed` events

## Kinde Setup

1. Create a Kinde account at https://kinde.com
2. Set up your application and get the required credentials
3. Configure the redirect URLs in your Kinde dashboard
4. Set up user properties to track payment status

### Kinde Management API Setup

1. **Get API Token**:
   - Go to your Kinde dashboard
   - Navigate to "APIs" section
   - Generate an API token for Management API access
   - Copy the token and add it as `KINDE_API_TOKEN` in your environment variables

2. **Configure User Properties**:
   - Go to "User Properties" in your Kinde dashboard
   - Create a new user property called `paid` with type `string`
   - Set default value to `"false"`

3. **Grant API Permissions**:
   - Ensure your API token has the following scopes:
     - `read:users` - to search for users by email
     - `update:users` - to update user properties
     - `update:user_properties` - to update user properties (if available)

4. **Troubleshooting 403 Forbidden Errors**:
   - Verify the API token is valid and not expired
   - Check that the user property "paid" exists in your Kinde dashboard
   - Ensure the API token has the correct scopes assigned
   - Verify the KINDE_ISSUER_URL matches your Kinde domain exactly
   - Check that the user exists in your Kinde organization
   - Review the webhook logs for detailed error information

5. **Payment Status Not Updating**:
   - The app uses `refreshData()` from Kinde to get the latest user properties
   - This ensures payment status is reflected immediately after webhook processing
   - Check browser console for "Refreshing Kinde data" messages

## Installation

Install the required dependencies:

```bash
pnpm add stripe @stripe/stripe-js
```

## How It Works

1. **Authentication**: Users must be logged in via Kinde
2. **Payment Check**: The `PaymentGuard` component checks if the user has paid
3. **Billing Page**: If not paid, users are redirected to `/billing`
4. **Stripe Integration**: Users can complete payment via the Stripe buy button (opens in new window)
5. **Success Page**: After payment, users are redirected to `/payment-success` page
6. **Webhook**: Stripe webhook receives payment confirmation and updates user properties in Kinde via Management API
7. **Automatic Redirect**: Success page checks payment status and redirects to main app

### Payment Flow Details

1. **User visits app** → `PaymentGuard` checks authentication and payment status
2. **Not authenticated** → Redirect to Kinde login
3. **Authenticated but not paid** → Redirect to `/billing` page
4. **User clicks payment button** → Opens Stripe checkout in new window with success URL
5. **User completes payment** → Stripe redirects to `/payment-success` page
6. **Stripe webhook** → Calls `/api/stripe/webhook` with payment confirmation
7. **Webhook handler** → Uses Kinde Management API with API token to update user's `paid` property to `"true"`
8. **Success page** → Checks payment status and automatically redirects to main app
9. **Automatic redirect** → User is redirected to `KINDE_POST_LOGIN_REDIRECT_URL` (main app)

## User Flow

1. User visits the app
2. If not authenticated → redirect to Kinde login
3. If authenticated but not paid → redirect to `/billing`
4. User completes payment via Stripe
5. Stripe webhook updates user's `paid` property in Kinde
6. User is redirected to the main app

## Testing

1. Start the development server: `pnpm dev`
2. Visit `http://localhost:3000`
3. Log in with Kinde
4. You should be redirected to the billing page
5. Complete the payment flow
6. You should be redirected to the main app

## Notes

- The current implementation uses a simulated payment check
- In production, you'll need to implement proper webhook handling
- User properties in Kinde need to be configured to track payment status
- The Stripe webhook secret should be kept secure

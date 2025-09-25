"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";
import StripeBuyButton from "@/app/billing/components/stripe-buy-button";
import {
  checkPaymentStatus,
  redirectToApp,
  refreshClientData,
  refreshTokens,
} from "@/lib/payment-utils";
import debug from "debug";
import { useKindeAuth } from "@kinde-oss/kinde-auth-nextjs";

const log = debug("payment:billing");

export default function BillingPage() {
  const router = useRouter();
  const { getPermissions, getToken } = useKindeAuth();
  const [isCheckingPayment, setIsCheckingPayment] = useState(true);

  useEffect(() => {
    const handlePaymentCheck = async () => {
      try {
        await refreshTokens();
        await refreshClientData(getPermissions, getToken);

        const { success } = await checkPaymentStatus();

        if (success) {
          // User has paid, redirect to main app
          redirectToApp(router);
          return;
        }

        setIsCheckingPayment(false);
      } catch (error) {
        log("Error checking payment status:", error);
        setIsCheckingPayment(false);
      }
    };

    handlePaymentCheck();
  }, [router]);

  if (isCheckingPayment) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Complete Your Purchase</h2>
          <p className="mt-2 text-sm text-gray-600">
            Access to premium content requires a one-time payment
          </p>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <div className="text-center">
            <h3 className="mb-4 text-lg font-medium text-gray-900">Premium Access</h3>
            <p className="mb-6 text-gray-600">
              Get full access to all premium content and features
            </p>

            {/* Stripe Buy Button */}
            <div className="mb-6">
              <StripeBuyButton />
            </div>

            <p className="text-xs text-gray-500">Secure payment powered by Stripe</p>
          </div>
        </div>

        <div className="text-center">
          <LogoutLink className="text-sm text-gray-600 hover:text-gray-900">Logout</LogoutLink>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useKindeAuth } from "@kinde-oss/kinde-auth-nextjs";
import { checkPaymentStatus, refreshTokens, refreshClientData } from "@/lib/payment-utils";
import debug from "debug";

const log = debug("payment:guard");

interface PaymentGuardProps {
  children: React.ReactNode;
}

export default function PaymentGuard({ children }: PaymentGuardProps) {
  const router = useRouter();
  const { getPermissions, getToken, isAuthenticated } = useKindeAuth();
  const [isCheckingPayment, setIsCheckingPayment] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const handlePaymentCheck = async () => {
      // If user is not authenticated, let them through (they'll be redirected by auth middleware)
      if (!isAuthenticated) {
        setIsCheckingPayment(false);
        setHasAccess(true);
        return;
      }

      try {
        await refreshTokens();
        await refreshClientData(getPermissions, getToken);

        const { success } = await checkPaymentStatus();

        if (success) {
          setHasAccess(true);
        } else {
          // User is authenticated but hasn't paid, redirect to billing
          log("User not paid, redirecting to billing");
          router.push("/billing");
          return;
        }
      } catch (error) {
        log("Error checking payment status:", error);
        // On error, redirect to billing to be safe
        router.push("/billing");
        return;
      } finally {
        setIsCheckingPayment(false);
      }
    };

    handlePaymentCheck();
  }, [router, isAuthenticated, getPermissions, getToken]);

  if (isCheckingPayment) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return null; // Will redirect to billing
  }

  return <>{children}</>;
}

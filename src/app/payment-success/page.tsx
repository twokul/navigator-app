"use client";

import { useKindeAuth } from "@kinde-oss/kinde-auth-nextjs";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  checkPaymentStatus,
  refreshTokens,
  refreshClientData,
  redirectToApp,
} from "@/lib/payment-utils";
import LoadingSpinner from "@/app/payment-success/components/loading-spinner";
import SuccessMessage from "@/app/payment-success/components/success-message";
import ErrorMessage from "@/app/payment-success/components/error-message";
import debug from "debug";

const log = debug("payment:success");

type PaymentStatus = "checking" | "success" | "failed";

export default function PaymentSuccessPage() {
  const { getPermissions, getToken } = useKindeAuth();
  const router = useRouter();
  const [isCheckingPayment, setIsCheckingPayment] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("checking");

  const handlePaymentCheck = async (isRetry = false) => {
    try {
      await refreshTokens();
      await refreshClientData(getPermissions, getToken);

      const { success } = await checkPaymentStatus();

      if (success) {
        setPaymentStatus("success");
        redirectToApp(router);
      } else if (!isRetry) {
        // First attempt failed, retry after delay
        setTimeout(() => handlePaymentCheck(true), 3000);
      } else {
        // Retry also failed
        setPaymentStatus("failed");
      }
    } catch (error) {
      log("Error checking payment status:", error);
      setPaymentStatus("failed");
    }
  };

  const handleRetry = () => {
    setPaymentStatus("checking");
    setIsCheckingPayment(true);
    handlePaymentCheck();
  };

  useEffect(() => {
    handlePaymentCheck();
  }, [router]);

  if (isCheckingPayment) {
    return <LoadingSpinner />;
  }

  if (paymentStatus === "success") {
    return <SuccessMessage onRedirect={() => redirectToApp(router)} />;
  }

  if (paymentStatus === "failed") {
    return <ErrorMessage onRetry={handleRetry} />;
  }

  return null;
}

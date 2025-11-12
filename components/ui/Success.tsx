"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import { base64Decode } from "../../utils/helpers";

const Success = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [verificationError, setVerificationError] = useState(false);

  const token = searchParams.get("data");
  const decoded = token ? base64Decode(token) : null;
  const product_id = decoded?.transaction_uuid || searchParams.get("purchase_order_id");
  const isKhalti = !!searchParams.get("pidx");
  const rawAmount = decoded?.total_amount || searchParams.get("total_amount") || searchParams.get("amount");
  const total_amount = isKhalti && rawAmount ? Number(rawAmount) / 100 : Number(rawAmount);

  useEffect(() => {
    const verifyPaymentAndUpdateStatus = async () => {
      if (!product_id) {
        setIsLoading(false);
        setVerificationError(true);
        return;
      }

      try {
        console.log(product_id)
        const response = await axios.post("http://localhost:5000/api/orders/payment-status", {
          productId:product_id,
          pidx: searchParams.get("pidx"),
        });

        if (response.status === 200) {
          setIsLoading(false);

          if (response.data.paymentStatus === "COMPLETED") {
            setPaymentStatus("COMPLETED");
          } else {
            router.push(`/payment-failure?purchase_order_id=${product_id}`);
          }
        }
      } catch (error: any) {
        console.error(error);
        setIsLoading(false);
        setVerificationError(true);
        if (error.response?.status === 400) {
          router.push(`/payment-failure?purchase_order_id=${product_id}`);
        }
      }
    };

    verifyPaymentAndUpdateStatus();
  }, [product_id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="flex justify-center mb-6">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Verifying Payment</h2>
          <p className="text-gray-600">Please wait while we confirm your payment...</p>
        </div>
      </div>
    );
  }

  if (verificationError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Payment Verification Failed</h1>
          <p className="text-gray-600 mb-2">We encountered an issue while confirming your payment.</p>
          <p className="text-gray-600 mb-6">Please try again or contact support if the problem persists.</p>
          <div className="space-y-3">
            <button 
              onClick={() => router.push("/")}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Go to Homepage
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-all duration-200"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full transform hover:scale-[1.02] transition-all duration-300">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
            <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        {/* Success Message */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Payment Successful!</h1>
          <p className="text-gray-600">Thank you for your purchase. Your payment has been processed successfully.</p>
        </div>

        {/* Payment Details */}
        <div className="bg-gray-50 rounded-xl p-6 mb-8 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 font-medium">Amount Paid:</span>
            <span className="text-2xl font-bold text-green-600">NPR {total_amount?.toLocaleString()}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600 font-medium">Transaction ID:</span>
            <span className="text-gray-800 font-mono text-sm">{product_id}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600 font-medium">Payment Method:</span>
            <span className="text-gray-800 font-semibold flex items-center">
              {isKhalti ? (
                <>
                  <div className="w-6 h-6 bg-purple-500 rounded-full mr-2"></div>
                  Khalti
                </>
              ) : (
                <>
                  <div className="w-6 h-6 bg-blue-500 rounded-full mr-2"></div>
                  eSewa
                </>
              )}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600 font-medium">Status:</span>
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
              Completed
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <button 
            onClick={() => router.push("/")}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Go to Homepage
          </button>
          
          <button 
            onClick={() => window.print()}
            className="w-full border-2 border-gray-300 text-gray-700 py-4 px-6 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200"
          >
            Print Receipt
          </button>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            A confirmation email has been sent to your registered email address.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Success;
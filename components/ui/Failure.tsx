"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import { base64Decode } from "../../utils/helpers";

const Failure = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(true);

  const token = searchParams.get("data");
  const decoded = token ? base64Decode(token) : null;
  const product_id =
    decoded?.transaction_uuid ||
    searchParams.get("purchase_order_id") ||
    sessionStorage.getItem("current_transaction_id");

  useEffect(() => {
    const markPaymentAsFailed = async (product_id: string | null) => {
      if (!product_id) {
        setIsProcessing(false);
        return;
      }
      
      try {
        const jwt = localStorage.getItem("token");
        await axios.post(
          "http://localhost:5000/api/orders/payment-status",
          { product_id, status: "FAILED" },
          {
            headers: {
              Authorization: jwt ? `Bearer ${jwt}` : "",
            },
          }
        );
      } catch (error) {
        console.error("Error marking payment as failed:", error);
      } finally {
        setIsProcessing(false);
      }
    };

    markPaymentAsFailed(product_id);
  }, [product_id]);

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="flex justify-center mb-6">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Processing</h2>
          <p className="text-gray-600">Updating payment status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full transform hover:scale-[1.02] transition-all duration-300">
        {/* Failure Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        </div>

        {/* Failure Message */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Payment Failed</h1>
          <p className="text-gray-600 mb-4">
            We couldn't process your payment. Please try again or use a different payment method.
          </p>
          
          {product_id && (
            <div className="bg-gray-50 rounded-lg p-4 mt-4">
              <p className="text-sm text-gray-500 mb-1">Transaction Reference</p>
              <p className="text-gray-800 font-mono text-sm break-all">{product_id}</p>
            </div>
          )}
        </div>

        {/* Possible Reasons */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8">
          <h3 className="font-semibold text-red-800 mb-2 flex items-center">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Possible reasons:
          </h3>
          <ul className="text-red-700 text-sm space-y-1">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Insufficient funds</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Network connectivity issues</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Payment method declined</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Technical error</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button 
            onClick={() => router.push("/cart")}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 px-6 rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            Try Again
          </button>
          
          <button 
            onClick={() => router.push("/")}
            className="w-full border-2 border-gray-300 text-gray-700 py-4 px-6 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200 flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Go to Homepage
          </button>
          
          <button 
            onClick={() => router.push("/contact")}
            className="w-full bg-gray-100 text-gray-700 py-4 px-6 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200 flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            Contact Support
          </button>
        </div>

        {/* Support Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Need help?{" "}
            <a href="esewa:support@example.com" className="text-orange-600 hover:text-orange-700 font-medium">
              Contact our support team
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Failure;
"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import { generateUniqueId } from "../../utils/helpers";

interface PaymentFormData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  productName: string;
  amount: string;
  paymentGateway: string;
}

const PaymentForm = () => {
  const [formData, setFormData] = useState<PaymentFormData>({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    productName: "",
    amount: "",
    paymentGateway: "esewa",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const productId = generateUniqueId();
      sessionStorage.setItem("current_transaction_id", productId);

      const response = await axios.post("http://localhost:5000/api/initiate-payment", {
        ...formData,
        productId,
      });

      if (response.data.url) {
        window.location.href = response.data.url;
      } else {
        alert("Payment URL is invalid. Please try again.");
      }
    } catch (error) {
      console.error(error);
      alert("Payment failed. Please check the console for details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="payment-container">
      <h1>Payment Integration</h1>
      <p>Please fill in all the details to proceed with payment</p>

      <div className="form-container">
        <form className="styled-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="customerName">Full Name:</label>
            <input
              type="text"
              id="customerName"
              name="customerName"
              value={formData.customerName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="customerEmail">Email:</label>
            <input
              type="email"
              id="customerEmail"
              name="customerEmail"
              value={formData.customerEmail}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="customerPhone">Phone Number:</label>
            <input
              type="tel"
              id="customerPhone"
              name="customerPhone"
              value={formData.customerPhone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="productName">Product/Service Name:</label>
            <input
              type="text"
              id="productName"
              name="productName"
              value={formData.productName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="amount">Amount (NPR):</label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              required
              min={1}
            />
          </div>

          <div className="form-group">
            <label htmlFor="paymentGateway">Payment Method:</label>
            <select
              id="paymentGateway"
              name="paymentGateway"
              value={formData.paymentGateway}
              onChange={handleChange}
              required
            >
              <option value="esewa">eSewa</option>
              <option value="khalti">Khalti</option>
            </select>
          </div>

          <button type="submit" className="submit-button" disabled={isSubmitting}>
            {isSubmitting ? "Processing..." : "Proceed to Payment"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PaymentForm;

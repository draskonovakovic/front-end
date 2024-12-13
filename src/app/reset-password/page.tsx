"use client";

import React, { useState } from "react";
import { requestPasswordReset } from "@/lib/auth";

const ResetPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    try {
      await requestPasswordReset({ email });
      setMessage("If this email is associated with an account, a password reset link will be sent shortly.");
    } catch (err: any) {
      setError("An error occurred while requesting a password reset. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
      <h1 className="text-2xl font-bold">Reset Your Password</h1>
      <p className="text-gray-700 mt-2">Enter your email address below to request a password reset link.</p>
      <form onSubmit={handleSubmit} className="mt-4 w-full max-w-sm">
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded mb-2"
          required
        />
        <button
          type="submit"
          className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600 transition"
        >
          Request Reset
        </button>
      </form>
      {message && <p className="text-green-500 mt-2">{message}</p>}
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
};

export default ResetPasswordPage;
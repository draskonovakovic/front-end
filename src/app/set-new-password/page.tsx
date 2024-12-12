"use client";

import React, { useState } from "react";
import { setNewPassword } from "@/lib/auth";
import { useSearchParams, useRouter } from "next/navigation";

const SetNewPasswordPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [newPassword, setNewPasswordValue] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match. Please try again.");
      return;
    }

    try {
      if (!token) throw new Error("Invalid or missing token.");

      await setNewPassword({ token, newPassword });
      setMessage("Your password has been reset successfully.");
      
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err: any) {
      setError("An error occurred while setting your password. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
      <h1 className="text-2xl font-bold">Set a New Password</h1>
      <p className="text-gray-700 mt-2">Enter your new password below. Password must be at least 8 characters long.</p>
      <form onSubmit={handleSubmit} className="mt-4 w-full max-w-sm">
        <input
          type="password"
          placeholder="New password"
          value={newPassword}
          onChange={(e) => setNewPasswordValue(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded mb-2"
          required
        />
        <input
          type="password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded mb-2"
          required
        />
        <button
          type="submit"
          className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600 transition"
        >
          Set New Password
        </button>
      </form>
      {message && <p className="text-green-500 mt-2">{message}</p>}
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
};

export default SetNewPasswordPage;

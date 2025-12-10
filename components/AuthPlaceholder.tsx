"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function AuthPlaceholder() {
  const {
    user,
    isAuthenticated,
    isLoading,
    signInUser,
    signUpUser,
    signOutUser,
    confirmUser,
    resetPasswordUser,
    confirmResetPasswordUser,
  } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmationCode, setConfirmationCode] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [needsPasswordReset, setNeedsPasswordReset] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-6 max-w-md w-full mx-auto">
        <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-center">
          <span
            className="inline-block text-white"
            style={{
              textShadow:
                "0 0 10px rgba(67, 56, 202, 0.8), 0 0 20px rgba(67, 56, 202, 0.6), 0 0 30px rgba(139, 92, 246, 0.5), 0 0 40px rgba(139, 92, 246, 0.4)",
            }}
          >
            ZiaGen
          </span>
        </div>
        <div className="flex items-center gap-2 p-4 bg-gray-800 rounded-lg w-full">
          <span className="text-gray-300 text-sm sm:text-base">Loading...</span>
        </div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 p-4 bg-gray-800 rounded-lg max-w-md w-full mx-auto">
        <span className="text-gray-300 text-sm sm:text-base truncate flex-1">
          Logged in as: {user.signInDetails?.loginId || user.userId}
        </span>
        <button
          onClick={async () => {
            try {
              await signOutUser();
            } catch (err) {
              console.error("Logout error:", err);
            }
          }}
          className="w-full sm:w-auto px-3 py-1.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-md text-sm cursor-pointer transition-colors font-medium"
        >
          Logout
        </button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      if (isSignUp) {
        await signUpUser(email, password);
        setMessage(
          "Sign up successful! Please check your email for confirmation code."
        );
        setNeedsConfirmation(true);

        // Show browser notification
        alert(
          `✅ Account Created!\n\nA confirmation code has been sent to:\n${email}\n\nPlease check your email (and spam folder) to complete registration.`
        );
      } else {
        await signInUser(email, password);
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Authentication failed";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmation = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await confirmUser(email, confirmationCode);
      setMessage("Account confirmed! You can now sign in.");
      setNeedsConfirmation(false);
      setIsSignUp(false);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Confirmation failed";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      await resetPasswordUser(email);
      setMessage("Password reset code sent! Check your email.");
      setNeedsPasswordReset(true);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to send reset code";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await confirmResetPasswordUser(email, confirmationCode, newPassword);
      setMessage("Password reset successful! You can now sign in.");
      setNeedsPasswordReset(false);
      setIsForgotPassword(false);
      setConfirmationCode("");
      setNewPassword("");
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Password reset failed";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (needsPasswordReset) {
    return (
      <div className="flex flex-col items-center gap-6 max-w-md w-full mx-auto">
        <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-center">
          <span
            className="inline-block text-white"
            style={{
              textShadow:
                "0 0 10px rgba(67, 56, 202, 0.8), 0 0 20px rgba(67, 56, 202, 0.6), 0 0 30px rgba(139, 92, 246, 0.5), 0 0 40px rgba(139, 92, 246, 0.4)",
            }}
          >
            ZiaGen
          </span>
        </div>
        <div className="flex flex-col gap-4 p-4 sm:p-6 bg-gray-800 rounded-lg w-full">
          <div className="bg-blue-900/50 border-2 border-blue-500 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="shrink-0">
                <svg
                  className="w-6 h-6 text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-blue-400 mb-1">
                  Reset Your Password
                </h3>
                <p className="text-blue-200 text-sm mb-2">
                  We&apos;ve sent a reset code to:
                </p>
                <p className="text-white font-semibold text-sm mb-2">{email}</p>
                <p className="text-blue-200 text-sm">
                  Enter the code and your new password below.
                </p>
              </div>
            </div>
          </div>

          <form
            onSubmit={handleConfirmPasswordReset}
            className="flex flex-col gap-3"
          >
            <input
              type="text"
              placeholder="Enter reset code"
              value={confirmationCode}
              onChange={(e) => setConfirmationCode(e.target.value)}
              required
              maxLength={6}
              className="p-3 bg-gray-700 text-gray-100 text-center text-lg tracking-widest rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="password"
              placeholder="New password (min 8 chars)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              className="p-3 bg-gray-700 text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {error && (
              <div className="bg-red-900/50 border border-red-500 rounded p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {message && (
              <div className="bg-green-900/50 border border-green-500 rounded p-3">
                <p className="text-green-400 text-sm">{message}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>

          <button
            onClick={() => {
              setNeedsPasswordReset(false);
              setIsForgotPassword(false);
              setError("");
              setMessage("");
            }}
            className="text-blue-400 hover:text-blue-300 text-sm underline cursor-pointer"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  if (isForgotPassword) {
    return (
      <div className="flex flex-col items-center gap-6 max-w-md w-full mx-auto">
        <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-center">
          <span
            className="inline-block text-white"
            style={{
              textShadow:
                "0 0 10px rgba(67, 56, 202, 0.8), 0 0 20px rgba(67, 56, 202, 0.6), 0 0 30px rgba(139, 92, 246, 0.5), 0 0 40px rgba(139, 92, 246, 0.4)",
            }}
          >
            ZiaGen
          </span>
        </div>
        <div className="flex flex-col gap-4 p-4 sm:p-6 bg-gray-800 rounded-lg w-full">
          <h3 className="text-xl font-semibold text-gray-100">
            Forgot Password
          </h3>
          <p className="text-gray-400 text-sm">
            Enter your email address and we&apos;ll send you a code to reset
            your password.
          </p>

          <form onSubmit={handleForgotPassword} className="flex flex-col gap-3">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="p-3 bg-gray-700 text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {error && (
              <div className="bg-red-900/50 border border-red-500 rounded p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="px-4 py-3 text-white font-semibold rounded-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all"
              style={{
                background:
                  "linear-gradient(135deg, rgb(67, 56, 202), rgb(139, 92, 246))",
                boxShadow: "0 0 20px rgba(67, 56, 202, 0.4)",
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.boxShadow =
                    "0 0 25px rgba(67, 56, 202, 0.6), 0 0 35px rgba(139, 92, 246, 0.4)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow =
                  "0 0 20px rgba(67, 56, 202, 0.4)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              {loading ? "Sending..." : "Send Reset Code"}
            </button>
          </form>

          <button
            onClick={() => {
              setIsForgotPassword(false);
              setError("");
              setMessage("");
            }}
            className="text-blue-400 hover:text-blue-300 text-sm underline cursor-pointer"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  if (needsConfirmation) {
    return (
      <div className="flex flex-col gap-4 p-4 sm:p-6 bg-gray-800 rounded-lg max-w-md w-full mx-auto">
        {/* Success Alert */}
        <div className="bg-green-900/50 border-2 border-green-500 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="shrink-0">
              <svg
                className="w-6 h-6 text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-green-400 mb-1">
                Check Your Email!
              </h3>
              <p className="text-green-200 text-sm mb-2">
                We&apos;ve sent a confirmation code to:
              </p>
              <p className="text-white font-semibold text-sm mb-2">{email}</p>
              <p className="text-green-200 text-sm">
                Please check your inbox (and spam folder) for the 6-digit code.
              </p>
            </div>
          </div>
        </div>

        <h3 className="text-xl font-semibold text-gray-100">
          Enter Confirmation Code
        </h3>

        <form onSubmit={handleConfirmation} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Enter 6-digit code"
            value={confirmationCode}
            onChange={(e) => setConfirmationCode(e.target.value)}
            required
            maxLength={6}
            className="p-3 bg-gray-700 text-gray-100 text-center text-lg tracking-widest rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {error && (
            <div className="bg-red-900/50 border border-red-500 rounded p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="px-4 py-3 text-white font-semibold rounded-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all"
            style={{
              background:
                "linear-gradient(135deg, rgb(67, 56, 202), rgb(139, 92, 246))",
              boxShadow: "0 0 20px rgba(67, 56, 202, 0.4)",
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.boxShadow =
                  "0 0 25px rgba(67, 56, 202, 0.6), 0 0 35px rgba(139, 92, 246, 0.4)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow =
                "0 0 20px rgba(67, 56, 202, 0.4)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            {loading ? "Confirming..." : "Confirm Account"}
          </button>
        </form>

        <button
          onClick={() => {
            setNeedsConfirmation(false);
            setError("");
            setMessage("");
          }}
          className="text-blue-400 hover:text-blue-300 text-sm underline cursor-pointer"
        >
          Back to Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 max-w-md w-full mx-auto">
      <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-center">
        <span
          className="inline-block text-white"
          style={{
            textShadow:
              "0 0 10px rgba(67, 56, 202, 0.8), 0 0 20px rgba(67, 56, 202, 0.6), 0 0 30px rgba(139, 92, 246, 0.5), 0 0 40px rgba(139, 92, 246, 0.4)",
          }}
        >
          ZiaGen
        </span>
      </div>
      <div className="flex flex-col gap-2 p-4 sm:p-6 bg-gray-800 rounded-lg w-full">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-100 mb-2">
          {isSignUp ? "Sign Up" : "Sign In"}
        </h3>

        {message && <p className="text-green-400 text-sm">{message}</p>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="p-2 sm:p-3 bg-gray-700 text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
          />
          <input
            type="password"
            placeholder="Password (min 8 chars)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="p-2 sm:p-3 bg-gray-700 text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
          />

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 sm:py-3 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all font-medium text-sm sm:text-base"
            style={{
              background:
                "linear-gradient(135deg, rgb(67, 56, 202), rgb(139, 92, 246))",
              boxShadow: "0 0 20px rgba(67, 56, 202, 0.4)",
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.boxShadow =
                  "0 0 25px rgba(67, 56, 202, 0.6), 0 0 35px rgba(139, 92, 246, 0.4)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow =
                "0 0 20px rgba(67, 56, 202, 0.4)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            {loading ? "Processing..." : isSignUp ? "Sign Up" : "Sign In"}
          </button>
        </form>

        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError("");
              setMessage("");
            }}
            className="text-blue-400 hover:text-blue-300 text-sm cursor-pointer"
          >
            {isSignUp
              ? "Already have an account? Sign In"
              : "Need an account? Sign Up"}
          </button>

          {!isSignUp && (
            <button
              onClick={() => {
                setIsForgotPassword(true);
                setError("");
                setMessage("");
              }}
              className="text-orange-400 hover:text-orange-300 text-sm cursor-pointer"
            >
              Forgot Password?
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

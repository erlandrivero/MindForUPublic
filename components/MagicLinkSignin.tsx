"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { toast } from "react-hot-toast";

interface MagicLinkSigninProps {
  callbackUrl?: string;
  className?: string;
}

const MagicLinkSignin = ({ callbackUrl, className = "" }: MagicLinkSigninProps) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      const result = await signIn("email", {
        email,
        callbackUrl: callbackUrl || "/dashboard",
        redirect: false,
      });

      if (result?.error) {
        toast.error("Failed to send magic link. Please try again.");
      } else {
        setEmailSent(true);
        toast.success("Magic link sent! Check your email to sign in.");
      }
    } catch (error) {
      console.error("Magic link error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className={`text-center p-6 bg-green-50 border border-green-200 rounded-lg ${className}`}>
        <div className="mb-4">
          <svg className="w-12 h-12 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-green-800 mb-2">Magic Link Sent!</h3>
        <p className="text-green-700 mb-4">
          We&apos;ve sent a secure sign-in link to <strong>{email}</strong>
        </p>
        <p className="text-sm text-green-600">
          Check your email and click the link to access your account. The link will expire in 24 hours.
        </p>
        <button
          onClick={() => {
            setEmailSent(false);
            setEmail("");
          }}
          className="mt-4 text-sm text-green-600 hover:text-green-800 underline"
        >
          Send to a different email
        </button>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18C5C2] focus:border-transparent outline-none transition-all"
            disabled={isLoading}
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading || !email}
          className="w-full bg-gradient-to-r from-[#18C5C2] to-[#1A7F6B] text-white font-bold py-3 px-6 rounded-lg hover:from-[#1A7F6B] hover:to-[#18C5C2] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Sending Magic Link...
            </>
          ) : (
            <>
              🔐 Send Magic Link
            </>
          )}
        </button>
      </form>
      
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          We&apos;ll send you a secure link to sign in without a password
        </p>
      </div>
    </div>
  );
};

export default MagicLinkSignin;

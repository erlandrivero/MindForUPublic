"use client";
import Image from "next/image";
import { signIn } from "next-auth/react";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#1e293b] via-[#134e4a] to-[#065f46] px-4">
      <div className="bg-white/90 rounded-2xl shadow-xl p-8 flex flex-col items-center w-full max-w-md">
        <div className="flex items-center gap-3 mb-6">
          <Image src="/favicon.png" alt="MindForU icon" width={40} height={40} className="rounded-full border border-gray-200" />
          <span className="text-2xl font-extrabold">
            <span
              style={{
                background: 'linear-gradient(90deg, #1e293b 0%, #134e4a 80%, #065f46 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                color: 'transparent',
                fontWeight: 700,
              }}
            >
              MindForU
            </span>
            <span style={{ color: '#065f46', fontWeight: 700 }}>.com</span>
          </span>
        </div>
        <h2 className="text-lg font-semibold mb-4 text-[#1e293b]">Sign in to your account</h2>
        <button
          className="w-full flex items-center justify-center gap-2 rounded-full px-6 py-3 text-base font-bold text-white shadow-md transition-colors duration-200 bg-[linear-gradient(90deg,#1e293b_0%,#134e4a_80%,#065f46_100%)] hover:opacity-90 mt-2 mb-4"
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
        >
          <svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clipPath="url(#clip0_17_40)">
              <path d="M47.532 24.552c0-1.636-.147-3.2-.421-4.705H24.48v9.022h13.03c-.563 3.04-2.264 5.617-4.825 7.35v6.086h7.807c4.573-4.216 7.04-10.438 7.04-17.753z" fill="#4285F4"/>
              <path d="M24.48 48c6.48 0 11.927-2.15 15.902-5.833l-7.807-6.086c-2.175 1.46-4.955 2.33-8.095 2.33-6.226 0-11.5-4.205-13.41-9.86H2.52v6.19C6.468 43.634 14.758 48 24.48 48z" fill="#34A853"/>
              <path d="M11.07 28.551A14.58 14.58 0 0 1 9.36 24c0-1.585.272-3.124.76-4.551v-6.19H2.52A23.956 23.956 0 0 0 0 24c0 3.92.94 7.633 2.52 10.741l8.55-6.19z" fill="#FBBC05"/>
              <path d="M24.48 9.545c3.527 0 6.66 1.214 9.145 3.6l6.85-6.85C36.403 2.15 30.956 0 24.48 0 14.758 0 6.468 4.366 2.52 11.059l8.55 6.19c1.91-5.655 7.184-9.86 13.41-9.86z" fill="#EA4335"/>
            </g>
            <defs>
              <clipPath id="clip0_17_40">
                <rect width="48" height="48" fill="white"/>
              </clipPath>
            </defs>
          </svg>
          Sign in with Google
        </button>
        <p className="text-xs text-gray-500 mt-2 text-center">By signing in, you agree to our <a href="/privacy-policy" className="underline">Privacy Policy</a> and <a href="/tos" className="underline">Terms of Service</a>.</p>
      </div>
    </div>
  );
}

/* eslint-disable @next/next/no-img-element */
"use client";

import { useSession, signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import config from "@/config";

// A simple button to sign in with our providers (Google & Magic Links).
// It automatically redirects user to callbackUrl (config.auth.callbackUrl) after login, which is normally a private page for users to manage their accounts.
// If the user is already logged in, it will show their profile picture & redirect them to callbackUrl immediately.
const ButtonSignin = ({
  text = "Get started",
  extraStyle,
}: {
  text?: string;
  extraStyle?: string;
}) => {
  const router = useRouter();
  const { data: session, status } = useSession();

  const handleClick = () => {
    if (status === "authenticated") {
      router.push(config.auth.callbackUrl);
    } else {
      signIn(undefined, { callbackUrl: config.auth.callbackUrl });
    }
  };

  if (status === "authenticated") {
    return (
  <Link
    href={config.auth.callbackUrl}
    className={`btn ${extraStyle ? extraStyle : ""} flex items-center px-4 py-2 min-h-[48px]`}
    style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
    aria-label={`Go to dashboard as ${session.user?.name || session.user?.email || "user"}`}
  >
    {session.user?.image ? (
      <img
        src={session.user?.image}
        alt={session.user?.name || "Account"}
        className="w-7 h-7 rounded-full shrink-0"
        referrerPolicy="no-referrer"
        width={28}
        height={28}
      />
    ) : (
      <span className="w-7 h-7 bg-base-300 flex justify-center items-center rounded-full shrink-0">
        {session.user?.name?.charAt(0) || session.user?.email?.charAt(0)}
      </span>
    )}
    <span
      className="ml-3 max-w-[120px] truncate font-bold text-white text-base"
      title={session.user?.name || session.user?.email || "Account"}
      style={{ lineHeight: '1.2', display: 'inline-block' }}
    >
      {session.user?.name || session.user?.email || "Account"}
    </span>
  </Link>
);
  }

  return (
    <button
      className={`btn ${extraStyle ? extraStyle : ""}`}
      onClick={handleClick}
      aria-label="Sign in to access your account"
      type="button"
    >
      {text}
    </button>
  );
};

export default ButtonSignin;

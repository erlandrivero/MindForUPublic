"use client";

import { ReactNode } from "react";
import dynamic from "next/dynamic";
import { SessionProvider } from "next-auth/react";
import NextTopLoader from "nextjs-toploader";
import { Toaster } from "react-hot-toast";
import { Tooltip } from "react-tooltip";
import MagicLinkTracker from "@/components/MagicLinkTracker";
import config from "@/config";

const CrispChat = dynamic(() => import("@/components/CrispChat"), {
  ssr: false,
  loading: () => <p>Loading Crisp Chat...</p>,
});

// All the client wrappers are here (they can't be in server components)
// 1. SessionProvider: Allow the useSession from next-auth (find out if user is auth or not)
// 2. NextTopLoader: Show a progress bar at the top when navigating between pages
// 3. Toaster: Show Success/Error messages anywhere from the app with toast()
// 4. Tooltip: Show a tooltip if any JSX element has these 2 attributes: data-tooltip-id="tooltip" data-tooltip-content=""
const ClientLayout = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <SessionProvider>
        <MagicLinkTracker>
          {/* Show a progress bar at the top when navigating between pages */}
          <NextTopLoader color={config.colors.main} showSpinner={false} />

          {/* Content inside app/page.js files  */}
          {children}
        </MagicLinkTracker>

        {/* Show Success/Error messages anywhere from the app with toast() */}
        <Toaster
          toastOptions={{
            duration: 3000,
          }}
        />

        {/* Show a tooltip if any JSX element has these 2 attributes: data-tooltip-id="tooltip" data-tooltip-content="" */}
        <Tooltip
          id="tooltip"
          className="z-[60] !opacity-100 max-w-sm shadow-lg"
        />

        {/* Set Crisp customer chat support */}
        <CrispChat />
      </SessionProvider>
    </>
  );
};

export default ClientLayout;

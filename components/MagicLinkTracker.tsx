"use client";

import { useSession } from "next-auth/react";
import { useEffect, useRef, useCallback } from "react";

interface MagicLinkTrackerProps {
  children: React.ReactNode;
}

const MagicLinkTracker = ({ children }: MagicLinkTrackerProps) => {
  const { data: session, status } = useSession();
  const hasTrackedRef = useRef(false);
  const lastSessionRef = useRef<string | null>(null);

  const trackMagicLinkSignIn = useCallback(async () => {
    try {
      console.log('Tracking magic link sign-in for:', session?.user?.email);
      
      const response = await fetch('/api/magic-link-webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include session cookies
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Magic link sign-in tracked successfully:', result);
      } else {
        console.warn('Failed to track magic link sign-in:', response.status);
      }
    } catch (error) {
      console.error('Error tracking magic link sign-in:', error);
    }
  }, [session?.user?.email]);

  useEffect(() => {
    // Only track when session is authenticated and we haven't tracked this session yet
    if (
      status === "authenticated" && 
      session?.user?.email && 
      !hasTrackedRef.current &&
      lastSessionRef.current !== session.user.email
    ) {
      
      // Check if this is a new sign-in (not just a page refresh)
      const isNewSignIn = lastSessionRef.current === null || lastSessionRef.current !== session.user.email;
      
      if (isNewSignIn) {
        // Track this magic link sign-in
        trackMagicLinkSignIn();
        hasTrackedRef.current = true;
        lastSessionRef.current = session.user.email;
      }
    }
  }, [session, status, trackMagicLinkSignIn]);

  return <>{children}</>;
};

export default MagicLinkTracker;

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Mail } from "lucide-react";

interface WaitingGuardProps {
  children: React.ReactNode;
}

export default function WaitingGuard({ children }: WaitingGuardProps) {
  const { user, hasCompanyAccess, loading } = useAuth();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [loadingDelay, setLoadingDelay] = useState(true);

  // Add a small delay to avoid flickering
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoadingDelay(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);  // Check if user has ever been granted access (persists through page reloads)
  useEffect(() => {
    if (typeof window !== 'undefined' && user) {
      // Check for permanent access flag - this means we never show waiting page again
      const hasBeenGrantedAccess = localStorage.getItem(`invista_has_access_${user.id}`) === 'true';
      
      // Check if user has recently accepted an invite
      const inviteAccepted = localStorage.getItem('invista_invite_accepted') === 'true';
      
      // If user was ever granted access or accepted an invite, redirect to dashboard
      if (hasBeenGrantedAccess || inviteAccepted) {
        // Always set the permanent access flag
        if (user?.id) {
          localStorage.setItem(`invista_has_access_${user.id}`, 'true');
          // Also store the timestamp when this was granted
          localStorage.setItem(`invista_has_access_time_${user.id}`, Date.now().toString());
        }
        
        console.log('WaitingGuard - user previously had access, redirecting to dashboard');
        setIsRedirecting(true);
        router.push('/dashboard');
      }
    }
  }, [router, user]);
  // Handle navigation based on auth state
  useEffect(() => {
    if (isRedirecting) return; // Avoid multiple redirects
    
    // Only make navigation decisions after initial loading is complete
    if (!loading && !loadingDelay) {
      console.log('WaitingGuard - user:', user?.email, 'hasAccess:', hasCompanyAccess);
      
      // Check if user has recently accepted an invite
      if (typeof window !== 'undefined') {
        const inviteAccepted = localStorage.getItem('invista_invite_accepted') === 'true';
        const inviteAcceptedTime = parseInt(localStorage.getItem('invista_invite_accepted_time') || '0', 10);
        const oneHourMs = 60 * 60 * 1000;
        
        // If invite was accepted within the last hour, immediately redirect to dashboard
        if (inviteAccepted && (Date.now() - inviteAcceptedTime < oneHourMs)) {
          console.log('WaitingGuard - found recent invite acceptance, redirecting to dashboard');
          setIsRedirecting(true);
          router.push('/dashboard');
          return;
        }
      }
      
      // User has company access - redirect to dashboard
      if (user && hasCompanyAccess) {
        console.log('WaitingGuard - user has access, redirecting to dashboard');
        setIsRedirecting(true);
        router.push('/dashboard');
      }
      
      // Only redirect to login if we're sure user is not authenticated
      // and not just in a loading state
      if (!user && !loading) {
        console.log('WaitingGuard - no user, redirecting to login');
        setIsRedirecting(true);
        router.push('/auth/login');
      }
    }
  }, [user, hasCompanyAccess, loading, loadingDelay, router, isRedirecting]);

  // Show loading state while auth is initializing
  if (loading || loadingDelay || isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Mail className="h-16 w-16 mx-auto mb-4 text-primary animate-pulse" />
          <p className="text-muted-foreground text-lg">
            {loading || loadingDelay ? "Loading..." : "Redirecting..."}
          </p>
        </div>
      </div>
    );
  }

  // If we get here and there's no user, we'll redirect in the useEffect
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Mail className="h-16 w-16 mx-auto mb-4 text-primary animate-pulse" />
          <p className="text-muted-foreground text-lg">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Render children if user is authenticated and doesn't have company access
  return <>{children}</>;
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Package } from "lucide-react";

interface DashboardGuardProps {
  children: React.ReactNode;
}

export default function DashboardGuard({ children }: DashboardGuardProps) {
  const { user, hasCompanyAccess, loading, checkUserAccess } = useAuth();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);  // Check for previous access flags
  useEffect(() => {
    if (typeof window !== 'undefined' && !hasCompanyAccess && user) {
      // Check if user has permanent access 
      const hasBeenGrantedAccess = localStorage.getItem(`invista_has_access_${user.id}`) === 'true';
      
      // Check if user has recently accepted an invite
      const inviteAccepted = localStorage.getItem('invista_invite_accepted') === 'true';
      
      if (hasBeenGrantedAccess || inviteAccepted) {
        // If they've had access before but our auth context hasn't updated yet,
        // let's force a check to update the context
        console.log('DashboardGuard - found access flag, refreshing access check');
        
        // Always set the permanent access flag if either condition is true
        if (user?.id) {
          localStorage.setItem(`invista_has_access_${user.id}`, 'true');
        }
        
        // Use a non-zero retry count to ensure thorough checking
        checkUserAccess(1);
      }
    }
  }, [user, hasCompanyAccess, checkUserAccess]);
  useEffect(() => {
    if (isRedirecting) return; // Avoid multiple redirects
    
    console.log('DashboardGuard - user:', user?.email, 'hasAccess:', hasCompanyAccess, 'loading:', loading);
    
    const handleNavigation = async () => {
      // Only make navigation decisions after auth has finished loading
      if (!loading) {
        if (!user) {
          // Not authenticated - redirect to login
          console.log('DashboardGuard - redirecting to login');
          setIsRedirecting(true);
          router.push('/auth/login');        } else if (!hasCompanyAccess) {
          // Check if user has permanent access or has accepted an invite
          if (typeof window !== 'undefined') {
            const hasBeenGrantedAccess = user?.id ? localStorage.getItem(`invista_has_access_${user.id}`) === 'true' : false;
            const inviteAccepted = localStorage.getItem('invista_invite_accepted') === 'true';
            
            // If we have any indication of previous access, don't redirect to waiting page
            if (hasBeenGrantedAccess || inviteAccepted) {
              console.log('DashboardGuard - user had previous access, not redirecting to waiting');
              
              // Always set the permanent access flag for future reference
              if (user?.id) {
                localStorage.setItem(`invista_has_access_${user.id}`, 'true');
              }
              
              // Force an access check to update auth context
              await checkUserAccess(0);
              
              // Even if we still don't have access after forced check, don't redirect
              // The user should not be sent back to waiting page once they've had access
              return;
            }
          }
          
          // Authenticated but no company access and never had access before - redirect to waiting page
          console.log('DashboardGuard - no previous access, redirecting to waiting');
          setIsRedirecting(true);
          router.push('/waiting');
        }
      }
    };
    
    handleNavigation();
  }, [user, hasCompanyAccess, loading, router, isRedirecting, checkUserAccess]);

  if (loading || isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 mx-auto mb-4 text-primary animate-pulse" />
          <p className="text-muted-foreground text-lg">
            {loading ? "Loading your dashboard..." : "Redirecting..."}
          </p>
        </div>
      </div>
    );
  }

  if (!user || !hasCompanyAccess) {
    return null; // Will redirect in useEffect
  }

  return <>{children}</>;
}

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function AuthRedirect() {
  const { user, userType, hasCompanyAccess, loading, checkUserAccess } = useAuth();
  const router = useRouter();
  useEffect(() => {
    const handleRedirect = async () => {
      if (!loading && user) {
        // Refresh user access status with retry support
        await checkUserAccess(0);
        
        if (hasCompanyAccess) {
          // User has company access - redirect to dashboard
          router.push('/dashboard');
        } else {
          // User without company access - redirect to waiting page
          router.push('/waiting');
        }
      } else if (!loading && !user) {
        // Not authenticated - redirect to login
        router.push('/auth/login');
      }
    };

    handleRedirect();
  }, [user, hasCompanyAccess, loading, router, checkUserAccess]);

  // Show loading while determining redirect
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Determining your access level...</p>
      </div>
    </div>
  );
}

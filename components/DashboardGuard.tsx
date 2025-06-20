"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

interface DashboardGuardProps {
  children: React.ReactNode;
}

export default function DashboardGuard({ children }: DashboardGuardProps) {
  const { user, hasCompanyAccess, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log('DashboardGuard - user:', user?.email, 'hasAccess:', hasCompanyAccess, 'loading:', loading);
    
    if (!loading) {
      if (!user) {
        // Not authenticated - redirect to login
        console.log('DashboardGuard - redirecting to login');
        router.push('/auth/login');
      } else if (!hasCompanyAccess) {
        // Authenticated but no company access - redirect to waiting page
        console.log('DashboardGuard - redirecting to waiting');
        router.push('/waiting');
      }
    }
  }, [user, hasCompanyAccess, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !hasCompanyAccess) {
    return null; // Will redirect in useEffect
  }

  return <>{children}</>;
}

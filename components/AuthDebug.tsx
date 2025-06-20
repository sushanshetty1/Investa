"use client";

import { useAuth } from "@/contexts/AuthContext";

export default function AuthDebug() {
  const { user, userType, hasCompanyAccess, loading, checkUserAccess } = useAuth();

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs z-50 max-w-xs">
      <h4 className="font-bold mb-2">Auth Debug</h4>
      <div>User: {user?.email || 'null'}</div>
      <div>User ID: {user?.id || 'null'}</div>
      <div>User Type: {userType || 'null'}</div>
      <div>Has Company Access: {hasCompanyAccess ? 'true' : 'false'}</div>
      <div>Loading: {loading ? 'true' : 'false'}</div>
      <button 
        onClick={() => checkUserAccess()} 
        className="mt-2 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs"
      >
        Refresh Access
      </button>
    </div>
  );
}

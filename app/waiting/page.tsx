"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Mail, Building2, AlertCircle, CheckCircle, XCircle, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface CompanyInvite {
  id: string;
  companyName: string;
  role: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  invitedAt: string;
  expiresAt: string;
}

export default function WaitingPage() {
  const { user, logout, hasCompanyAccess, checkUserAccess } = useAuth();
  const router = useRouter();
  const [invites, setInvites] = useState<CompanyInvite[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    // If no user, redirect to login
    if (!user) {
      router.push('/auth/login');
      return;
    }

    // If user has company access, redirect to dashboard
    if (hasCompanyAccess) {
      router.push('/dashboard');
      return;
    }

    // If user exists, fetch invites
    fetchInvites();
  }, [user, hasCompanyAccess, router]);
  useEffect(() => {
    // Periodically check for company access (useful for recently created companies)
    if (!user || hasCompanyAccess) return;
      const accessCheckInterval = setInterval(async () => {
      if (!hasCompanyAccess) {
        await checkUserAccess(0);
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(accessCheckInterval);
  }, [user, hasCompanyAccess, checkUserAccess]);  const fetchInvites = async () => {
    if (!user?.email) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/company-invites?email=${encodeURIComponent(user.email)}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch invites');
      }

      const formattedInvites = result.invites?.map((invite: any) => ({
        id: invite.id,
        companyName: invite.company?.displayName || invite.company?.name || 'Unknown Company',
        role: invite.role,
        status: invite.status,
        invitedAt: invite.createdAt,
        expiresAt: invite.expiresAt
      })) || [];

      setInvites(formattedInvites);
    } catch (error) {
      console.error('Error fetching invites:', error);
    } finally {
      setLoading(false);
    }
  };  const handleInviteResponse = async (inviteId: string, response: 'ACCEPTED' | 'DECLINED') => {
    try {
      const apiResponse = await fetch('/api/company-invites', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inviteId,
          status: response,
          userId: user?.id
        }),
      });

      const result = await apiResponse.json();

      if (!apiResponse.ok) {
        throw new Error(result.error || 'Failed to update invite');
      }

      if (response === 'ACCEPTED') {
        // Refresh user access check and redirect to dashboard
        await checkUserAccess(0);
        router.push('/dashboard');
      } else {
        // Refresh invites after declining
        fetchInvites();
      }
    } catch (error) {
      console.error('Error updating invite:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-500';
      case 'ACCEPTED': return 'bg-green-500';
      case 'DECLINED': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="h-4 w-4" />;
      case 'ACCEPTED': return <CheckCircle className="h-4 w-4" />;
      case 'DECLINED': return <XCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 grid-pattern">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm glass-effect">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Building2 className="h-8 w-8 text-primary logo-float" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Invista
            </h1>
          </div>
          <Button variant="outline" onClick={logout} className="hover:bg-primary/10 transition-all duration-300">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Section */}
          <div className="text-center mb-12 animate-float">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary/20 to-purple-600/20 rounded-full mb-6 glow-effect">
              <Mail className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Welcome to Invista!
            </h2>
            <p className="text-xl text-muted-foreground">
              You&apos;re signed in as <span className="font-semibold text-primary">{user?.email}</span>
            </p>
          </div>

          {/* Main Content */}
          {invites.length === 0 ? (
            <Card className="max-w-2xl mx-auto profile-card hover:shadow-xl transition-all duration-500 animate-float delay-500">
              <CardHeader className="text-center pb-4">
                <CardTitle className="flex items-center justify-center gap-3 text-2xl">
                  <Clock className="h-6 w-6 text-yellow-500" />
                  Waiting for Company Invitation
                </CardTitle>
                <CardDescription className="text-lg">
                  You need to be invited by a company to access the dashboard
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-6">
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6">
                  <p className="text-yellow-800 dark:text-yellow-200 font-medium">
                    Please contact your company administrator to send you an invitation to join their Invista workspace.
                  </p>
                </div>
                
                <div className="space-y-4 text-left bg-muted/30 rounded-xl p-6">
                  <h4 className="font-semibold text-lg text-center text-primary">What happens next?</h4>
                  <ul className="text-muted-foreground space-y-3">
                    <li className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-primary text-xs font-bold">1</span>
                      </div>
                      Your company admin will send you an invitation
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-primary text-xs font-bold">2</span>
                      </div>
                      You&apos;ll receive it at your registered email address
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-primary text-xs font-bold">3</span>
                      </div>
                      Accept the invitation to join their workspace
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-primary text-xs font-bold">4</span>
                      </div>
                      Get access to the full Invista dashboard
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-8">
              <div className="text-center animate-float delay-1000">
                <h3 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                  Company Invitations
                </h3>                <p className="text-muted-foreground text-lg">
                  You have {invites.filter(inv => inv.status === 'PENDING').length} pending invitation(s)
                </p>
              </div>

              <div className="grid gap-6">
                {invites.map((invite, index) => (
                  <Card 
                    key={invite.id} 
                    className={`profile-card hover:shadow-xl transition-all duration-500 border-l-4 ${
                      invite.status === 'PENDING' ? 'border-l-yellow-500' : 
                      invite.status === 'ACCEPTED' ? 'border-l-green-500' : 'border-l-red-500'
                    } ${index === 0 ? 'animate-float' : index === 1 ? 'animate-float delay-500' : 'animate-float delay-1000'}`}
                  >
                    <CardContent className="p-8">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-6">
                          <div className="relative">
                            <div className="w-16 h-16 bg-gradient-to-br from-primary to-purple-600 rounded-xl flex items-center justify-center shadow-lg glow-effect">
                              <Building2 className="h-8 w-8 text-white" />
                            </div>
                            {invite.status === 'PENDING' && (
                              <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                                <span className="text-white text-xs font-bold">!</span>
                              </div>
                            )}
                          </div>
                          <div className="space-y-2">
                            <h4 className="font-bold text-xl text-foreground">{invite.companyName}</h4>
                            <div className="flex items-center gap-4">
                              <Badge variant="outline" className="border-primary/20 text-primary font-medium">
                                {invite.role.replace('_', ' ')}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                Invited {new Date(invite.invitedAt).toLocaleDateString()}
                              </span>
                            </div>
                            {invite.status === 'PENDING' && (
                              <p className="text-sm text-muted-foreground">
                                Expires: {new Date(invite.expiresAt).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <Badge 
                            variant="secondary" 
                            className={`${getStatusColor(invite.status)} text-white shadow-lg px-3 py-1 font-medium`}
                          >
                            <span className="flex items-center gap-2">
                              {getStatusIcon(invite.status)}
                              {invite.status}
                            </span>
                          </Badge>
                          
                          {invite.status === 'PENDING' && (
                            <div className="flex space-x-3">
                              <Button
                                size="lg"
                                onClick={() => handleInviteResponse(invite.id, 'ACCEPTED')}
                                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium px-6 py-2 rounded-lg transition-all duration-300 hover:shadow-lg hover:scale-105"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Accept
                              </Button>
                              <Button
                                size="lg"
                                variant="outline"
                                onClick={() => handleInviteResponse(invite.id, 'DECLINED')}
                                className="border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-950 font-medium px-6 py-2 rounded-lg transition-all duration-300 hover:shadow-lg"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Decline
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

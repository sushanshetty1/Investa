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
  }, [user, hasCompanyAccess, checkUserAccess]);
  const fetchInvites = async () => {
    if (!user?.email) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_invitations')
        .select(`
          id,
          roleId,
          status,
          createdAt,
          expiresAt,
          invitedByName
        `)
        .eq('email', user.email)
        .order('createdAt', { ascending: false });

      if (error) throw error;

      const formattedInvites = data?.map((invite: any) => ({
        id: invite.id,
        companyName: invite.invitedByName + "'s Company", // We'll improve this later
        role: invite.roleId || 'EMPLOYEE',
        status: invite.status,
        invitedAt: invite.createdAt,
        expiresAt: invite.expiresAt
      })) || [];      setInvites(formattedInvites);
    } catch (error) {
      // Error handling without logging
    } finally {
      setLoading(false);
    }
  };
  const handleInviteResponse = async (inviteId: string, response: 'ACCEPTED' | 'DECLINED') => {
    try {
      const { error } = await supabase
        .from('user_invitations')
        .update({ status: response })
        .eq('id', inviteId);

      if (error) throw error;

      if (response === 'ACCEPTED') {
        // Redirect to dashboard after accepting
        router.push('/dashboard');
      } else {
        // Refresh invites after declining        fetchInvites();
      }
    } catch (error) {
      // Error handling without logging
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Building2 className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Invista</h1>
          </div>
          <Button variant="outline" onClick={logout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-3xl font-bold mb-2">Welcome to Invista!</h2>
            <p className="text-lg text-muted-foreground">
              You&apos;re signed in as <span className="font-semibold">{user?.email}</span>
            </p>
          </div>

          {/* Main Content */}
          {invites.length === 0 ? (
            <Card className="max-w-2xl mx-auto">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  <Clock className="h-5 w-5 text-yellow-500" />
                  Waiting for Company Invitation
                </CardTitle>
                <CardDescription>
                  You need to be invited by a company to access the dashboard
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-4">                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    Please contact your company administrator to send you an invitation to join their Invista workspace.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-semibold">What happens next?</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Your company admin will send you an invitation</li>
                    <li>• You&apos;ll receive it at your registered email address</li>
                    <li>• Accept the invitation to join their workspace</li>
                    <li>• Get access to the full Invista dashboard</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-2xl font-semibold mb-2">Company Invitations</h3>
                <p className="text-muted-foreground">
                  You have {invites.filter(inv => inv.status === 'PENDING').length} pending invitation(s)
                </p>
              </div>

              <div className="grid gap-4">
                {invites.map((invite) => (
                  <Card key={invite.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                            <Building2 className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-lg">{invite.companyName}</h4>
                            <p className="text-sm text-muted-foreground">
                              Role: <span className="font-medium">{invite.role}</span>
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Invited {new Date(invite.invitedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <Badge variant="secondary" className={`${getStatusColor(invite.status)} text-white`}>
                            <span className="flex items-center gap-1">
                              {getStatusIcon(invite.status)}
                              {invite.status}
                            </span>
                          </Badge>
                          
                          {invite.status === 'PENDING' && (
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                onClick={() => handleInviteResponse(invite.id, 'ACCEPTED')}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleInviteResponse(invite.id, 'DECLINED')}
                                className="border-red-300 text-red-600 hover:bg-red-50"
                              >
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

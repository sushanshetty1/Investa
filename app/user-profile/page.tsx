"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardGuard from "@/components/DashboardGuard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Building2, 
  Shield,
  Settings,
  Bell,
  Globe,
  Moon,
  Sun,
  Monitor
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

interface UserProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  avatar?: string;
  phone?: string;
  timezone?: string;
  language?: string;
  theme?: string;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  createdAt: string;
}

interface CompanyMembership {
  id: string;
  companyName: string;
  role: string;
  status: 'PENDING' | 'ACTIVE' | 'INACTIVE';
  joinedAt: string;
}

const TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Los_Angeles', 
  'Europe/London',
  'Europe/Paris',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney'
];

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'ja', name: 'Japanese' },
  { code: 'zh', name: 'Chinese' }
];

const THEMES = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor }
];

export default function UserProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [companyMemberships, setCompanyMemberships] = useState<CompanyMembership[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    if (user) {
      fetchUserProfile();
      fetchCompanyMemberships();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      setUserProfile(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };  const fetchCompanyMemberships = async () => {
    try {
      console.log('Fetching company memberships for user:', user?.id, user?.email);
      
      // First, get active company user memberships without join
      const { data: companyUsers, error: companyUsersError } = await supabase
        .from('company_users')
        .select('id, role, isActive, joinedAt, companyId')
        .eq('userId', user?.id)
        .eq('isActive', true)
        .order('joinedAt', { ascending: false });

      console.log('Company users result:', { companyUsers, companyUsersError });

      if (companyUsersError) {
        console.error('Error fetching company users:', companyUsersError);
        throw companyUsersError;
      }

      // Get company details for the user memberships
      const companyIds = (companyUsers || []).map(cu => cu.companyId);
      let companyDetails: any[] = [];
      
      if (companyIds.length > 0) {
        const { data: companies, error: companiesError } = await supabase
          .from('companies')
          .select('id, name')
          .in('id', companyIds);
          
        if (companiesError) {
          console.error('Error fetching companies:', companiesError);
        } else {
          companyDetails = companies || [];
        }
      }

      // Then, get accepted invites that haven't been converted to company_users yet
      const { data: acceptedInvites, error: invitesError } = await supabase
        .from('company_invites')
        .select('id, role, status, acceptedAt, companyId')
        .eq('email', user?.email)
        .eq('status', 'ACCEPTED')
        .order('acceptedAt', { ascending: false });

      console.log('Company invites result:', { acceptedInvites, invitesError });

      if (invitesError) {
        console.error('Error fetching company invites:', invitesError);
      }

      // Get company details for invites
      const inviteCompanyIds = (acceptedInvites || []).map(invite => invite.companyId);
      let inviteCompanyDetails: any[] = [];
      
      if (inviteCompanyIds.length > 0) {
        const { data: inviteCompanies, error: inviteCompaniesError } = await supabase
          .from('companies')
          .select('id, name')
          .in('id', inviteCompanyIds);
          
        if (inviteCompaniesError) {
          console.error('Error fetching invite companies:', inviteCompaniesError);
        } else {
          inviteCompanyDetails = inviteCompanies || [];
        }
      }

      // Combine both sources
      const memberships: CompanyMembership[] = [
        // Active company users
        ...(companyUsers || []).map((companyUser: any) => {
          const company = companyDetails.find(c => c.id === companyUser.companyId);
          return {
            id: companyUser.id,
            companyName: company?.name || 'Unknown Company',
            role: companyUser.role,
            status: 'ACTIVE' as const,
            joinedAt: companyUser.joinedAt
          };
        }),
        // Accepted invites (that might not be converted yet)
        ...(acceptedInvites || []).map((invite: any) => {
          const company = inviteCompanyDetails.find(c => c.id === invite.companyId);
          return {
            id: invite.id,
            companyName: company?.name || 'Unknown Company',
            role: invite.role,
            status: 'ACTIVE' as const,
            joinedAt: invite.acceptedAt
          };
        })
      ];

      // Remove duplicates (in case an invite was already converted to company_user)
      const uniqueMemberships = memberships.filter((membership, index, self) => 
        index === self.findIndex((m) => m.companyName === membership.companyName)
      );

      console.log('Final memberships:', uniqueMemberships);
      setCompanyMemberships(uniqueMemberships);
    } catch (error) {
      console.error('Error fetching company memberships:', error);
    }
  };

  const updateUserProfile = async (updatedProfile: Partial<UserProfile>) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          ...updatedProfile,
          updatedAt: new Date().toISOString()
        })
        .eq('id', user?.id);

      if (error) throw error;
      
      // Update local state
      setUserProfile(prev => prev ? { ...prev, ...updatedProfile } : null);
    } catch (error) {
      console.error('Error updating user profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (firstName?: string, lastName?: string, email?: string) => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (firstName) {
      return firstName[0].toUpperCase();
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return 'U';
  };
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'OWNER': return 'bg-purple-500';
      case 'ADMIN': return 'bg-red-500';
      case 'MANAGER': return 'bg-blue-500';
      case 'SUPERVISOR': return 'bg-green-500';
      case 'EMPLOYEE': return 'bg-yellow-500';
      case 'CONTRACTOR': return 'bg-orange-500';
      case 'VIEWER': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64 bg-muted rounded"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <DashboardGuard>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Profile</h1>
          <p className="text-muted-foreground">Manage your personal information and preferences</p>
        </div>
        <Button onClick={() => router.push('/dashboard')}>
          Back to Dashboard
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Personal Information</TabsTrigger>
          <TabsTrigger value="companies">Company Memberships</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
              <CardDescription>
                Update your personal details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={userProfile?.avatar} alt="Profile picture" />
                  <AvatarFallback className="text-lg">
                    {getInitials(userProfile?.firstName, userProfile?.lastName, userProfile?.email)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" size="sm">
                    Change Photo
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">
                    JPG, PNG or GIF. Max size 2MB
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={userProfile?.firstName || ''}
                    onChange={(e) => setUserProfile(prev => prev ? {...prev, firstName: e.target.value} : null)}
                    placeholder="Enter your first name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={userProfile?.lastName || ''}
                    onChange={(e) => setUserProfile(prev => prev ? {...prev, lastName: e.target.value} : null)}
                    placeholder="Enter your last name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={userProfile?.displayName || ''}
                  onChange={(e) => setUserProfile(prev => prev ? {...prev, displayName: e.target.value} : null)}
                  placeholder="How you'd like to be addressed"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="email"
                      type="email"
                      value={userProfile?.email || ''}
                      disabled
                      className="bg-muted"
                    />
                    {userProfile?.emailVerified ? (
                      <Badge variant="secondary" className="bg-green-500 text-white">
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        Unverified
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Email cannot be changed. Contact support if needed.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={userProfile?.phone || ''}
                    onChange={(e) => setUserProfile(prev => prev ? {...prev, phone: e.target.value} : null)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <Button 
                onClick={() => updateUserProfile(userProfile || {})}
                disabled={saving}
                className="w-full md:w-auto"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="companies" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Company Memberships
              </CardTitle>
              <CardDescription>
                Companies you&apos;re a member of and your roles
              </CardDescription>
            </CardHeader>
            <CardContent>
              {companyMemberships.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>You&apos;re not a member of any companies yet</p>
                  <p className="text-sm">Wait for an invitation from a company admin</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {companyMemberships.map((membership) => (
                    <div key={membership.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                          <Building2 className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-lg">{membership.companyName}</p>
                          <p className="text-sm text-muted-foreground">
                            Joined {new Date(membership.joinedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary" className={`${getRoleColor(membership.role)} text-white`}>
                        {membership.role.replace('_', ' ')}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Preferences
              </CardTitle>
              <CardDescription>
                Customize your experience and regional settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select 
                    value={userProfile?.timezone || 'UTC'} 
                    onValueChange={(value) => setUserProfile(prev => prev ? {...prev, timezone: value} : null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIMEZONES.map((tz) => (
                        <SelectItem key={tz} value={tz}>
                          {tz}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select 
                    value={userProfile?.language || 'en'} 
                    onValueChange={(value) => setUserProfile(prev => prev ? {...prev, language: value} : null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                          {lang.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Theme</Label>
                <div className="grid grid-cols-3 gap-3">
                  {THEMES.map((theme) => (
                    <button
                      key={theme.value}
                      onClick={() => setUserProfile(prev => prev ? {...prev, theme: theme.value} : null)}
                      className={`p-3 border rounded-lg flex flex-col items-center space-y-2 hover:bg-accent transition-colors ${
                        userProfile?.theme === theme.value ? 'border-primary bg-accent' : ''
                      }`}
                    >
                      <theme.icon className="h-5 w-5" />
                      <span className="text-sm">{theme.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <Button 
                onClick={() => updateUserProfile(userProfile || {})}
                disabled={saving}
                className="w-full md:w-auto"
              >
                {saving ? 'Saving...' : 'Save Preferences'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Manage your account security and authentication
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Email Verification</h4>
                  <p className="text-sm text-muted-foreground">
                    Verify your email address for enhanced security
                  </p>
                </div>
                <Badge variant={userProfile?.emailVerified ? "default" : "destructive"}>
                  {userProfile?.emailVerified ? "Verified" : "Unverified"}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Two-Factor Authentication</h4>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  {userProfile?.twoFactorEnabled ? "Disable" : "Enable"}
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Password</h4>
                  <p className="text-sm text-muted-foreground">
                    Last changed: {userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleDateString() : 'Never'}
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Change Password
                </Button>
              </div>

              <div className="p-4 border border-red-200 rounded-lg bg-red-50 dark:bg-red-900/20">
                <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">Danger Zone</h4>
                <p className="text-sm text-red-600 dark:text-red-300 mb-3">
                  Permanently delete your account and all associated data
                </p>
                <Button variant="destructive" size="sm">
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>      </Tabs>
    </div>
    </DashboardGuard>
  );
}

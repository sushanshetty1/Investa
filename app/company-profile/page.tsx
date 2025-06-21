"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Building2, 
  Users, 
  Mail, 
  Plus, 
  Trash2, 
  Edit, 
  Send,
  Clock,
  CheckCircle,
  XCircle,
  Upload,
  UserPlus
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

interface CompanyProfile {
  id: string;
  name: string;
  description?: string;
  industry?: string;
  website?: string;
  logo?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  phone?: string;
  email?: string;
}

interface TeamMember {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  status: 'PENDING' | 'ACTIVE' | 'INACTIVE';
  joinedAt?: string;
  lastActive?: string;
}

interface InviteForm {
  emails: string;
  role: string;
}

const ROLES = [
  'ADMIN',
  'MANAGER', 
  'INVENTORY_MANAGER',
  'WAREHOUSE_STAFF',
  'SALES_REP',
  'ACCOUNTANT',
  'VIEWER'
];

export default function CompanyProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [inviteForm, setInviteForm] = useState<InviteForm>({ emails: '', role: 'VIEWER' });
  const [isInviting, setIsInviting] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    if (user) {
      fetchCompanyProfile();
      fetchTeamMembers();
    }
  }, [user]);
  const fetchCompanyProfile = async () => {
    try {
      // First try to find company where user is owner
      let { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('createdBy', user?.id)
        .single();

      // If no company found as owner, check if user is a member
      if (error && error.code === 'PGRST116') {
        const { data: companyUserData, error: companyUserError } = await supabase
          .from('company_users')
          .select(`
            company:companies(*)
          `)
          .eq('userId', user?.id)
          .eq('isActive', true)
          .single();

        if (companyUserError) {
          console.error('Error fetching company profile:', companyUserError);
          setLoading(false);
          return;
        }

        data = companyUserData?.company;
      } else if (error) {
        throw error;
      }

      setCompanyProfile(data);
    } catch (error) {
      console.error('Error fetching company profile:', error);
    } finally {
      setLoading(false);
    }
  };
  const fetchTeamMembers = async () => {
    try {
      if (!companyProfile?.id) return;

      // Fetch company invites (pending invitations)
      const { data: invites, error: invitesError } = await supabase
        .from('company_invites')
        .select('*')
        .eq('companyId', companyProfile.id)
        .order('createdAt', { ascending: false });

      if (invitesError) throw invitesError;

      // Fetch active company users
      const { data: users, error: usersError } = await supabase
        .from('company_users')
        .select(`
          id,
          role,
          isActive,
          joinedAt,
          user:users!inner(
            id,
            email,
            firstName,
            lastName,
            lastLoginAt
          )
        `)
        .eq('companyId', companyProfile.id)
        .eq('isActive', true)
        .order('joinedAt', { ascending: false });

      if (usersError) throw usersError;

      // Combine invites and users into team members list
      const teamMembersList: TeamMember[] = [
        // Active users
        ...(users || []).map((companyUser: any) => ({
          id: companyUser.id,
          email: companyUser.user.email,
          firstName: companyUser.user.firstName,
          lastName: companyUser.user.lastName,
          role: companyUser.role,
          status: 'ACTIVE' as const,
          joinedAt: companyUser.joinedAt,
          lastActive: companyUser.user.lastLoginAt
        })),
        // Pending invites
        ...(invites || []).map((invite: any) => ({
          id: invite.id,
          email: invite.email,
          firstName: undefined,
          lastName: undefined,
          role: invite.role,
          status: invite.status as 'PENDING' | 'ACTIVE' | 'INACTIVE',
          joinedAt: undefined,
          lastActive: undefined
        }))
      ];

      setTeamMembers(teamMembersList);
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  };
  const handleInviteUsers = async () => {
    if (!inviteForm.emails.trim() || !inviteForm.role) return;

    setIsInviting(true);
    
    try {
      if (!companyProfile?.id) throw new Error('Company not found');

      // Get user's display name for the invite
      const { data: userData } = await supabase
        .from('users')
        .select('firstName, lastName, displayName, email')
        .eq('id', user?.id)
        .single();

      const invitedByName = userData?.displayName || 
        (userData?.firstName && userData?.lastName ? `${userData.firstName} ${userData.lastName}` : null) ||
        userData?.email || 'Someone';

      // Parse emails (comma or newline separated)
      const emails = inviteForm.emails
        .split(/[,\n]/)
        .map(email => email.trim())
        .filter(email => email && email.includes('@'));

      // Use the new company invites API
      const response = await fetch('/api/company-invites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyId: companyProfile.id,
          emails: emails,
          role: inviteForm.role,
          invitedById: user?.id,
          invitedByName,
          message: ''
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send invitations');
      }

      // Reset form and close dialog
      setInviteForm({ emails: '', role: 'VIEWER' });
      setShowInviteDialog(false);
      
      // Refresh team members
      fetchTeamMembers();
    } catch (error) {
      console.error('Error inviting users:', error);
    } finally {
      setIsInviting(false);
    }
  };
  const updateCompanyProfile = async (updatedProfile: Partial<CompanyProfile>) => {
    try {
      if (companyProfile?.id) {
        const { error } = await supabase
          .from('companies')
          .update(updatedProfile)
          .eq('id', companyProfile.id);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('companies')
          .insert({
            ...updatedProfile,
            createdBy: user?.id
          })
          .select()
          .single();

        if (error) throw error;
        setCompanyProfile(data);
      }
      
      fetchCompanyProfile();
    } catch (error) {
      console.error('Error updating company profile:', error);
    }
  };
  const removeTeamMember = async (memberId: string) => {
    try {
      // First try to remove from company_invites (for pending invites)
      const { data: invite, error: inviteError } = await supabase
        .from('company_invites')
        .select('id')
        .eq('id', memberId)
        .single();

      if (invite) {
        // It's a pending invite
        const { error } = await supabase
          .from('company_invites')
          .delete()
          .eq('id', memberId);

        if (error) throw error;
      } else {
        // It's an active user, deactivate them
        const { error } = await supabase
          .from('company_users')
          .update({ isActive: false, endDate: new Date().toISOString() })
          .eq('id', memberId);

        if (error) throw error;
      }

      fetchTeamMembers();
    } catch (error) {
      console.error('Error removing team member:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-500';
      case 'ACTIVE': return 'bg-green-500';
      case 'INACTIVE': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="h-4 w-4" />;
      case 'ACTIVE': return <CheckCircle className="h-4 w-4" />;
      case 'INACTIVE': return <XCircle className="h-4 w-4" />;
      default: return <XCircle className="h-4 w-4" />;
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
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          Company Profile
        </h1>
        <p className="text-muted-foreground text-lg">Manage your company information and team members</p>
      </div>
      <div className="flex gap-2">
        <Button 
          onClick={() => router.push('/dashboard')} 
          variant="outline"
          className="hover:bg-primary/10"
        >
          Back to Dashboard
        </Button>
      </div>
      </div>      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px] bg-muted/30 p-1 rounded-xl">
          <TabsTrigger 
            value="profile" 
            className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg"
          >
            <Building2 className="h-4 w-4" />
            Company Profile
          </TabsTrigger>
          <TabsTrigger 
            value="team"
            className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg"
          >
            <Users className="h-4 w-4" />
            Team Management
          </TabsTrigger>
        </TabsList>        <TabsContent value="profile" className="space-y-8">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Company Logo Section */}
            <Card className="lg:col-span-1 h-fit profile-card hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Upload className="h-5 w-5 text-primary" />
                  Company Logo
                </CardTitle>
                <CardDescription>
                  Upload your company logo and branding
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-32 h-32 bg-gradient-to-br from-muted to-muted/50 rounded-xl flex items-center justify-center border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors duration-300">
                    {companyProfile?.logo ? (
                      <img src={companyProfile.logo} alt="Company Logo" className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <Building2 className="h-12 w-12 text-muted-foreground" />
                    )}
                  </div>
                  <Button variant="outline" size="sm" className="w-full hover:bg-primary/10">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Logo
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Company Information */}
            <Card className="lg:col-span-2 profile-card hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Building2 className="h-6 w-6 text-primary" />
                  Company Information
                </CardTitle>
                <CardDescription className="text-base">
                  Update your company details and basic information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="company-name" className="text-sm font-medium text-foreground">Company Name *</Label>
                    <Input
                      id="company-name"
                      value={companyProfile?.name || ''}
                      onChange={(e) => setCompanyProfile(prev => prev ? {...prev, name: e.target.value} : {id: '', name: e.target.value})}
                      placeholder="Enter company name"
                      className="profile-input focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="industry" className="text-sm font-medium text-foreground">Industry</Label>
                    <Select 
                      value={companyProfile?.industry || ''} 
                      onValueChange={(value) => setCompanyProfile(prev => prev ? {...prev, industry: value} : {id: '', name: '', industry: value})}
                    >
                      <SelectTrigger className="profile-input">
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="manufacturing">Manufacturing</SelectItem>
                        <SelectItem value="retail">Retail</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="construction">Construction</SelectItem>
                        <SelectItem value="food-beverage">Food & Beverage</SelectItem>
                        <SelectItem value="automotive">Automotive</SelectItem>
                        <SelectItem value="logistics">Logistics</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium text-foreground">Description</Label>
                  <Textarea
                    id="description"
                    value={companyProfile?.description || ''}
                    onChange={(e) => setCompanyProfile(prev => prev ? {...prev, description: e.target.value} : {id: '', name: '', description: e.target.value})}
                    placeholder="Brief description of your company"
                    rows={3}
                    className="profile-input focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="website" className="text-sm font-medium text-foreground">Website</Label>
                    <Input
                      id="website"
                      type="url"
                      value={companyProfile?.website || ''}
                      onChange={(e) => setCompanyProfile(prev => prev ? {...prev, website: e.target.value} : {id: '', name: '', website: e.target.value})}
                      placeholder="https://example.com"
                      className="profile-input focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-foreground">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={companyProfile?.email || ''}
                      onChange={(e) => setCompanyProfile(prev => prev ? {...prev, email: e.target.value} : {id: '', name: '', email: e.target.value})}
                      placeholder="contact@company.com"
                      className="profile-input focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium text-foreground">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={companyProfile?.phone || ''}
                      onChange={(e) => setCompanyProfile(prev => prev ? {...prev, phone: e.target.value} : {id: '', name: '', phone: e.target.value})}
                      placeholder="+1 (555) 000-0000"
                      className="profile-input focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-sm font-medium text-foreground">Address</Label>
                    <Input
                      id="address"
                      value={companyProfile?.address || ''}
                      onChange={(e) => setCompanyProfile(prev => prev ? {...prev, address: e.target.value} : {id: '', name: '', address: e.target.value})}
                      placeholder="123 Main St, City, State, Country"
                      className="profile-input focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-6 border-t border-border/50">
                  <Button 
                    onClick={() => updateCompanyProfile(companyProfile || {})}
                    className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white font-medium px-8 py-2 rounded-lg transition-all duration-300 hover:shadow-lg hover:scale-105"
                  >
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>        <TabsContent value="team" className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Team Management
              </h2>
              <p className="text-muted-foreground text-lg">Invite and manage your team members</p>
            </div>
            <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white font-medium px-6 py-2 rounded-lg transition-all duration-300 hover:shadow-lg hover:scale-105">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite Team Members
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-xl font-semibold">Invite Team Members</DialogTitle>
                  <DialogDescription className="text-base">
                    Send invitations to join your company workspace
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="emails" className="text-sm font-medium">Email Addresses</Label>
                    <Textarea
                      id="emails"
                      value={inviteForm.emails}
                      onChange={(e) => setInviteForm(prev => ({...prev, emails: e.target.value}))}
                      placeholder="Enter email addresses (one per line or comma separated)&#10;user1@company.com&#10;user2@company.com"
                      rows={4}
                      className="profile-input focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                    />
                    <p className="text-xs text-muted-foreground">
                      Separate multiple emails with commas or new lines
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role" className="text-sm font-medium">Role</Label>
                    <Select value={inviteForm.role} onValueChange={(value) => setInviteForm(prev => ({...prev, role: value}))}>
                      <SelectTrigger className="profile-input">
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLES.map((role) => (
                          <SelectItem key={role} value={role}>
                            {role.replace('_', ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    onClick={handleInviteUsers} 
                    disabled={isInviting || !inviteForm.emails.trim()}
                    className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white font-medium py-2 rounded-lg transition-all duration-300 hover:shadow-lg"
                  >
                    {isInviting ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Sending Invitations...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Invitations
                      </>
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>          <Card className="profile-card hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <Users className="h-6 w-6 text-primary" />
                Team Members
                <Badge variant="secondary" className="ml-auto bg-primary/10 text-primary">
                  {teamMembers.length} member{teamMembers.length !== 1 ? 's' : ''}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {teamMembers.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-muted to-muted/50 rounded-full flex items-center justify-center">
                    <Users className="h-12 w-12 opacity-50" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No team members yet</h3>
                  <p className="text-sm mb-4">Start building your team by inviting colleagues</p>
                  <Button 
                    onClick={() => setShowInviteDialog(true)}
                    variant="outline"
                    className="hover:bg-primary/10"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invite Your First Member
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {teamMembers.map((member, index) => (
                    <div 
                      key={member.id} 
                      className={`flex items-center justify-between p-4 border rounded-xl hover:bg-muted/20 transition-all duration-300 hover:shadow-md group ${
                        index === 0 ? 'animate-float' : index === 1 ? 'animate-float delay-500' : 'animate-float delay-1000'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <div className="w-12 h-12 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                            <span className="text-white font-semibold text-sm">
                              {member.firstName ? member.firstName[0] : member.email[0].toUpperCase()}
                            </span>
                          </div>
                          {member.status === 'ACTIVE' && (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-foreground">
                            {member.firstName && member.lastName 
                              ? `${member.firstName} ${member.lastName}`
                              : member.email
                            }
                          </p>
                          <p className="text-sm text-muted-foreground">{member.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs border-primary/20 text-primary">
                              {member.role.replace('_', ' ')}
                            </Badge>
                            {member.lastActive && (
                              <span className="text-xs text-muted-foreground">
                                Last active: {new Date(member.lastActive).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge 
                          variant="secondary" 
                          className={`${getStatusColor(member.status)} text-white shadow-sm transition-all duration-300`}
                        >
                          <span className="flex items-center gap-1">
                            {getStatusIcon(member.status)}
                            {member.status}
                          </span>
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTeamMember(member.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 opacity-0 group-hover:opacity-100 transition-all duration-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

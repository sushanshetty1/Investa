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
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('owner_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setCompanyProfile(data);
    } catch (error) {
      console.error('Error fetching company profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const { data: companyData } = await supabase
        .from('companies')
        .select('id')
        .eq('owner_id', user?.id)
        .single();

      if (!companyData) return;

      const { data, error } = await supabase
        .from('company_invites')
        .select(`
          id,
          email,
          role,
          status,
          created_at,
          users (
            firstName,
            lastName
          )
        `)
        .eq('company_id', companyData.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedMembers = data?.map((invite: any) => ({
        id: invite.id,
        email: invite.email,
        firstName: invite.users?.firstName,
        lastName: invite.users?.lastName,
        role: invite.role,
        status: invite.status,
        joinedAt: invite.created_at
      })) || [];

      setTeamMembers(formattedMembers);
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  };

  const handleInviteUsers = async () => {
    if (!inviteForm.emails.trim() || !inviteForm.role) return;

    setIsInviting(true);
    
    try {
      const { data: companyData } = await supabase
        .from('companies')
        .select('id')
        .eq('owner_id', user?.id)
        .single();

      if (!companyData) throw new Error('Company not found');

      // Parse emails (comma or newline separated)
      const emails = inviteForm.emails
        .split(/[,\n]/)
        .map(email => email.trim())
        .filter(email => email && email.includes('@'));

      // Create invitations
      const invitations = emails.map(email => ({
        company_id: companyData.id,
        email,
        role: inviteForm.role,
        status: 'PENDING',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
      }));

      const { error } = await supabase
        .from('company_invites')
        .insert(invitations);

      if (error) throw error;

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
            owner_id: user?.id
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
      const { error } = await supabase
        .from('company_invites')
        .delete()
        .eq('id', memberId);

      if (error) throw error;
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Company Profile</h1>
          <p className="text-muted-foreground">Manage your company information and team</p>
        </div>
        <Button onClick={() => router.push('/dashboard')}>
          Back to Dashboard
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Company Profile</TabsTrigger>
          <TabsTrigger value="team">Team Management</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Company Information
              </CardTitle>
              <CardDescription>
                Update your company details and branding
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input
                    id="company-name"
                    value={companyProfile?.name || ''}
                    onChange={(e) => setCompanyProfile(prev => prev ? {...prev, name: e.target.value} : {id: '', name: e.target.value})}
                    placeholder="Enter company name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Input
                    id="industry"
                    value={companyProfile?.industry || ''}
                    onChange={(e) => setCompanyProfile(prev => prev ? {...prev, industry: e.target.value} : {id: '', name: '', industry: e.target.value})}
                    placeholder="e.g., Technology, Manufacturing"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={companyProfile?.description || ''}
                  onChange={(e) => setCompanyProfile(prev => prev ? {...prev, description: e.target.value} : {id: '', name: '', description: e.target.value})}
                  placeholder="Brief description of your company"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={companyProfile?.website || ''}
                    onChange={(e) => setCompanyProfile(prev => prev ? {...prev, website: e.target.value} : {id: '', name: '', website: e.target.value})}
                    placeholder="https://company.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Company Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={companyProfile?.email || ''}
                    onChange={(e) => setCompanyProfile(prev => prev ? {...prev, email: e.target.value} : {id: '', name: '', email: e.target.value})}
                    placeholder="contact@company.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={companyProfile?.address || ''}
                  onChange={(e) => setCompanyProfile(prev => prev ? {...prev, address: e.target.value} : {id: '', name: '', address: e.target.value})}
                  placeholder="Street address"
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={companyProfile?.city || ''}
                    onChange={(e) => setCompanyProfile(prev => prev ? {...prev, city: e.target.value} : {id: '', name: '', city: e.target.value})}
                    placeholder="City"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={companyProfile?.state || ''}
                    onChange={(e) => setCompanyProfile(prev => prev ? {...prev, state: e.target.value} : {id: '', name: '', state: e.target.value})}
                    placeholder="State"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postal-code">Postal Code</Label>
                  <Input
                    id="postal-code"
                    value={companyProfile?.postalCode || ''}
                    onChange={(e) => setCompanyProfile(prev => prev ? {...prev, postalCode: e.target.value} : {id: '', name: '', postalCode: e.target.value})}
                    placeholder="12345"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={companyProfile?.country || ''}
                    onChange={(e) => setCompanyProfile(prev => prev ? {...prev, country: e.target.value} : {id: '', name: '', country: e.target.value})}
                    placeholder="Country"
                  />
                </div>
              </div>

              <Button 
                onClick={() => updateCompanyProfile(companyProfile || {})}
                className="w-full md:w-auto"
              >
                Save Company Profile
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Team Management</h2>
              <p className="text-muted-foreground">Invite and manage your team members</p>
            </div>
            <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite Users
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite Team Members</DialogTitle>
                  <DialogDescription>
                    Send invitations to join your company workspace
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="emails">Email Addresses</Label>
                    <Textarea
                      id="emails"
                      value={inviteForm.emails}
                      onChange={(e) => setInviteForm(prev => ({...prev, emails: e.target.value}))}
                      placeholder="Enter email addresses (one per line or comma separated)&#10;user1@company.com&#10;user2@company.com"
                      rows={4}
                    />
                    <p className="text-xs text-muted-foreground">
                      Separate multiple emails with commas or new lines
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select value={inviteForm.role} onValueChange={(value) => setInviteForm(prev => ({...prev, role: value}))}>
                      <SelectTrigger>
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
                    className="w-full"
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
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Members ({teamMembers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {teamMembers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No team members yet</p>
                  <p className="text-sm">Start by inviting your first team member</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {member.firstName ? member.firstName[0] : member.email[0].toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">
                            {member.firstName && member.lastName 
                              ? `${member.firstName} ${member.lastName}`
                              : member.email
                            }
                          </p>
                          <p className="text-sm text-muted-foreground">{member.email}</p>
                          <p className="text-xs text-muted-foreground">
                            Role: {member.role.replace('_', ' ')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className={`${getStatusColor(member.status)} text-white`}>
                          <span className="flex items-center gap-1">
                            {getStatusIcon(member.status)}
                            {member.status}
                          </span>
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeTeamMember(member.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
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

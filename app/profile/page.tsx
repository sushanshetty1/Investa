'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { 
    User, 
    Shield, 
    Key, 
    Trash2, 
    Save, 
    Camera, 
    Eye,
    EyeOff,
    AlertTriangle,
    CheckCircle,
    Package,
    Clock,
    MapPin,
    Palette,
    Mail,
    Phone,
    UserPlus,
    Users,
    Crown,
    Globe,
    Zap,
    Settings,
    Lock
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Textarea } from '@/components/ui/textarea'

interface UserProfile {
    id: string
    email: string
    firstName: string | null
    lastName: string | null
    displayName: string | null
    avatar: string | null
    phone: string | null
    timezone: string
    language: string
    theme: string
    twoFactorEnabled: boolean
    emailVerified: boolean
    isActive: boolean
    createdAt: string
    lastLoginAt: string | null
    userRoles?: UserRole[]
}

interface UserRole {
    id: string
    role: {
        id: string
        name: string
        displayName: string
        description: string
        color: string
        level: number
    }
    assignedAt: string
    isActive: boolean
}

export default function ProfilePage() {
    const { user, logout, loading: authLoading } = useAuth()
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')
    const [activeTab, setActiveTab] = useState('profile')
    
    // Form states
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [displayName, setDisplayName] = useState('')
    const [phone, setPhone] = useState('')
    const [timezone, setTimezone] = useState('')
    const [language, setLanguage] = useState('')
    const [theme, setTheme] = useState('')
    
    // Password change states
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPasswords, setShowPasswords] = useState(false)
    
    // Delete account confirmation
    const [deleteConfirmation, setDeleteConfirmation] = useState('')

    // Invite functionality
    const [inviteEmail, setInviteEmail] = useState('')
    const [inviteRole, setInviteRole] = useState('employee')
    const [inviteMessage, setInviteMessage] = useState('')
    const [invites, setInvites] = useState<Array<{
        id: string;
        email: string;
        role: string;
        status: string;
        created_at: string;
    }>>([])
    const [sendingInvite, setSendingInvite] = useState(false)

    // Profile image upload
    const [uploadingImage, setUploadingImage] = useState(false)

    const timezones = [
        { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
        { value: 'America/New_York', label: 'Eastern Time (US)' },
        { value: 'America/Chicago', label: 'Central Time (US)' },
        { value: 'America/Denver', label: 'Mountain Time (US)' },
        { value: 'America/Los_Angeles', label: 'Pacific Time (US)' },
        { value: 'Europe/London', label: 'London (GMT)' },
        { value: 'Europe/Paris', label: 'Paris (CET)' },
        { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
        { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
        { value: 'Australia/Sydney', label: 'Sydney (AEST)' }
    ]

    const languages = [
        { value: 'en', label: 'English' },
        { value: 'es', label: 'Español' },
        { value: 'fr', label: 'Français' },
        { value: 'de', label: 'Deutsch' },
        { value: 'it', label: 'Italiano' },
        { value: 'pt', label: 'Português' },
        { value: 'zh', label: '中文' },
        { value: 'ja', label: '日本語' },        { value: 'ko', label: '한국어' }
    ]

    const themes = [
        { value: 'light', label: 'Light' },
        { value: 'dark', label: 'Dark' },
        { value: 'system', label: 'System' }
    ]

    const roles = [
        { value: 'employee', label: 'Employee' },
        { value: 'manager', label: 'Manager' },
        { value: 'admin', label: 'Administrator' }
    ]

    const getInitials = (name: string): string => {
        if (!name) return 'U'
        const names = name.split(' ')
        return names.map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }

    const getRoleColor = (role: { name?: string }) => {
        switch (role.name?.toLowerCase()) {
            case 'admin': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
            case 'manager': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
        }
    }

    // Fetch profile data
    const fetchProfile = useCallback(async () => {
        if (!user) return

        try {
            const { data, error } = await supabase
                .from('users')
                .select(`
                    *,
                    userRoles:user_roles(
                        id,
                        assignedAt,
                        isActive,
                        role:roles(*)
                    )
                `)
                .eq('id', user.id)
                .single()

            if (error) {
                console.error('Error fetching profile:', error)
                setError('Failed to load profile data')
                return
            }

            setProfile(data)
            
            // Set form states
            setFirstName(data.firstName || '')
            setLastName(data.lastName || '')
            setDisplayName(data.displayName || '')
            setPhone(data.phone || '')
            setTimezone(data.timezone || 'UTC')
            setLanguage(data.language || 'en')
            setTheme(data.theme || 'system')
        } catch (err) {
            console.error('Profile fetch error:', err)
            setError('An unexpected error occurred')
        } finally {
            setLoading(false)
        }
    }, [user])

    // Fetch invites function
    const fetchInvites = useCallback(async () => {
        if (!user) return

        try {
            const { data, error } = await supabase
                .from('user_invitations')
                .select('*')
                .eq('invitedById', user.id)
                .order('createdAt', { ascending: false })

            if (error) {
                console.error('Error fetching invites:', error)
                return
            }

            setInvites(data || [])
        } catch (err) {
            console.error('Fetch invites error:', err)
        }
    }, [user])

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/auth/login')
            return
        }

        if (user) {
            fetchProfile()
            fetchInvites()
        }
    }, [user, authLoading, router, fetchProfile, fetchInvites])

    const updateProfile = async () => {
        setSaving(true)
        setError('')
        setMessage('')

        try {
            const { error } = await supabase
                .from('users')
                .update({
                    firstName: firstName.trim() || null,
                    lastName: lastName.trim() || null,
                    displayName: displayName.trim() || null,
                    phone: phone.trim() || null,
                    timezone,
                    language,
                    theme
                })
                .eq('id', user.id)

            if (error) {
                setError(error.message)
                return
            }

            setMessage('Profile updated successfully!')
            await fetchProfile()
        } catch (err) {
            console.error('Update error:', err)
            setError('Failed to update profile')
        } finally {
            setSaving(false)
        }
    }

    const changePassword = async () => {
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match')
            return
        }

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters long')
            return
        }

        setSaving(true)
        setError('')
        setMessage('')

        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            })

            if (error) {
                setError(error.message)
                return
            }

            setMessage('Password updated successfully!')
            setNewPassword('')
            setConfirmPassword('')
        } catch (err) {
            console.error('Password change error:', err)
            setError('Failed to update password')
        } finally {
            setSaving(false)
        }
    }    // Profile image upload function
    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file || !user) return

        // Clear previous messages
        setError('')
        setMessage('')

        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            setError('Image size should be less than 5MB')
            return
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
        if (!allowedTypes.includes(file.type)) {
            setError('Please upload a valid image file (JPEG, PNG, WebP, or GIF)')
            return
        }

        setUploadingImage(true)

        try {
            // Delete old avatar if it exists
            if (profile?.avatar) {
                try {
                    const oldFileName = profile.avatar.split('/').pop()
                    if (oldFileName && oldFileName.includes('avatar-')) {
                        const oldFilePath = `${user.id}/${oldFileName}`
                        await supabase.storage.from('avatars').remove([oldFilePath])
                    }
                } catch (deleteError) {
                    console.warn('Could not delete old avatar:', deleteError)
                    // Continue with upload even if delete fails
                }
            }

            const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
            const fileName = `${user.id}/avatar-${Date.now()}.${fileExt}`

            // Upload to Supabase Storage
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(fileName, file, { 
                    cacheControl: '3600',
                    upsert: false 
                })

            if (uploadError) {
                console.error('Upload error:', uploadError)
                if (uploadError.message.includes('not found') || uploadError.message.includes('bucket')) {
                    setError('Storage bucket "avatars" not found. Please create the bucket in your Supabase dashboard.')
                } else if (uploadError.message.includes('policy') || uploadError.message.includes('permission')) {
                    setError('Upload permission denied. Please check your Supabase storage policies.')
                } else if (uploadError.message.includes('size')) {
                    setError('File size too large. Please choose a smaller image.')
                } else if (uploadError.message.includes('type')) {
                    setError('File type not allowed. Please upload a valid image file.')
                } else {
                    setError(`Upload failed: ${uploadError.message}`)
                }
                return
            }

            if (!uploadData?.path) {
                setError('Upload completed but no file path returned')
                return
            }

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(fileName)

            if (!publicUrl) {
                setError('Failed to generate public URL for uploaded image')
                return
            }

            // Update user profile with new avatar URL
            const { error: updateError } = await supabase
                .from('users')
                .update({ avatar: publicUrl })
                .eq('id', user.id)

            if (updateError) {
                console.error('Profile update error:', updateError)
                setError(`Failed to update profile: ${updateError.message}`)
                
                // Try to cleanup uploaded file if profile update fails
                try {
                    await supabase.storage.from('avatars').remove([fileName])
                } catch (cleanupError) {
                    console.warn('Could not cleanup uploaded file:', cleanupError)
                }
                return
            }

            setMessage('Profile image updated successfully!')
            
            // Refresh the profile data
            await fetchProfile()
              } catch (err) {
            console.error('Image upload error:', err)
            setError('An unexpected error occurred during upload. Please try again.')
        } finally {
            setUploadingImage(false)
        }
    }

    const sendInvite = async () => {
        // Clear previous messages
        setError('')
        setMessage('')

        if (!inviteEmail.trim()) {
            setError('Please enter an email address')
            return
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(inviteEmail.trim())) {
            setError('Please enter a valid email address')
            return
        }

        // Check if user is trying to invite themselves
        if (inviteEmail.trim().toLowerCase() === user?.email?.toLowerCase()) {
            setError('You cannot invite yourself')
            return
        }

        setSendingInvite(true)

        try {
            // Check if user already exists
            const { data: existingUser, error: userCheckError } = await supabase
                .from('users')
                .select('id, email')
                .eq('email', inviteEmail.trim().toLowerCase())
                .maybeSingle()

            if (userCheckError) {
                console.error('Error checking existing user:', userCheckError)
                setError('Failed to validate email address')
                setSendingInvite(false)
                return
            }

            if (existingUser) {
                setError('A user with this email already exists in the system')
                setSendingInvite(false)
                return
            }

            // Check if invitation already exists
            const { data: existingInvite, error: inviteCheckError } = await supabase
                .from('user_invitations')
                .select('id, status, expiresAt')
                .eq('email', inviteEmail.trim().toLowerCase())
                .in('status', ['PENDING', 'SENT'])
                .maybeSingle()

            if (inviteCheckError) {
                console.error('Error checking existing invitation:', inviteCheckError)
                setError('Failed to check existing invitations')
                setSendingInvite(false)
                return
            }

            if (existingInvite) {
                if (new Date(existingInvite.expiresAt) > new Date()) {
                    setError('A pending invitation already exists for this email address')
                } else {
                    setError('An expired invitation exists for this email. Please try again or contact support.')
                }
                setSendingInvite(false)
                return
            }

            // Generate a secure token for the invitation
            const token = crypto.randomUUID() + '-' + Date.now()
            
            // Calculate expiration date (7 days from now)
            const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            
            // Get inviter display name
            const inviterName = profile?.displayName || 
                              (profile?.firstName && profile?.lastName ? `${profile.firstName} ${profile.lastName}` : null) ||
                              profile?.email ||
                              'Someone'

            const { error: insertError } = await supabase
                .from('user_invitations')
                .insert({
                    email: inviteEmail.trim().toLowerCase(),
                    roleId: null, // We'll handle role assignment after acceptance
                    token: token,
                    invitedById: user.id,
                    invitedByName: inviterName,
                    message: inviteMessage.trim() || null,
                    status: 'PENDING',
                    expiresAt: expiresAt.toISOString(),
                    sentAt: new Date().toISOString()
                })

            if (insertError) {
                console.error('Invitation insertion error:', insertError)
                if (insertError.code === '23505') { // unique constraint violation
                    setError('An invitation for this email already exists')
                } else {
                    setError(`Failed to send invitation: ${insertError.message}`)
                }
                setSendingInvite(false)
                return
            }

            setMessage(`Invitation sent successfully to ${inviteEmail}!`)
            setInviteEmail('')
            setInviteMessage('')
            setInviteRole('employee')
            
            // Refresh the invites list
            await fetchInvites()
            
        } catch (err) {
            console.error('Invite error:', err)
            setError('An unexpected error occurred while sending the invitation')
        } finally {
            setSendingInvite(false)
        }
    }

    const deleteAccount = async () => {
        if (deleteConfirmation !== 'DELETE') {
            setError('Please type "DELETE" to confirm account deletion')
            return
        }

        setSaving(true)
        setError('')

        try {
            // First delete from our users table
            const { error: dbError } = await supabase
                .from('users')
                .delete()
                .eq('id', user.id)

            if (dbError) {
                console.error('Database deletion error:', dbError)
            }

            // Then sign out
            await logout()
            router.push('/')
        } catch (err) {
            console.error('Account deletion error:', err)
            setError('Failed to delete account')
        } finally {
            setSaving(false)
        }
    }

    if (authLoading || loading) {
        return (
            <div className="min-h-[calc(100vh-64px)] pt-16 bg-gradient-to-br from-slate-50/90 via-blue-50/40 to-indigo-50/60 dark:from-background dark:via-muted/20 dark:to-chart-3/10 flex items-center justify-center">
                <div className="flex flex-col items-center space-y-4">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-muted-foreground">Loading profile...</p>
                </div>
            </div>
        )
    }

    if (!profile) {
        return (
            <div className="min-h-[calc(100vh-64px)] pt-16 bg-gradient-to-br from-slate-50/90 via-blue-50/40 to-indigo-50/60 dark:from-background dark:via-muted/20 dark:to-chart-3/10 flex items-center justify-center">
                <div className="text-center space-y-4">
                    <AlertTriangle className="w-16 h-16 text-red-500 mx-auto" />
                    <h2 className="text-2xl font-bold text-foreground">
                        Profile Not Found
                    </h2>
                    <p className="text-muted-foreground max-w-md">
                        Unable to load your profile information. Please try refreshing the page or contact support.
                    </p>
                    <Button onClick={() => router.push('/dashboard')} className="mt-4">
                        Back to Dashboard
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-[calc(100vh-64px)] pt-16 bg-gradient-to-br from-slate-50/90 via-blue-50/40 to-indigo-50/60 dark:from-background dark:via-muted/20 dark:to-chart-3/10">
            {/* Header */}
            <div className="relative bg-white/80 dark:bg-card/80 backdrop-blur-sm border-b border-border/50">
                <div className="container mx-auto px-6 py-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                        <div className="flex items-center space-x-4">
                            <div className="inline-flex items-center bg-gradient-to-r from-emerald-50/80 to-blue-50/80 dark:from-primary/10 dark:to-chart-2/10 text-emerald-700 dark:text-primary px-4 py-2 rounded-full text-sm font-medium border border-emerald-200/50 dark:border-primary/20 backdrop-blur-sm">
                                <User className="h-4 w-4 mr-2" />
                                <span>Profile Center</span>
                            </div>
                            <div className="space-y-1">
                                <h1 className="text-2xl font-bold text-foreground">
                                    Account Settings
                                </h1>
                                <p className="text-muted-foreground">
                                    Manage your profile and account preferences
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => router.push('/dashboard')}
                            className="bg-white/50 dark:bg-card/50 border-border/50 hover:bg-white/80 dark:hover:bg-card/80 h-10 px-4 font-medium"
                        >
                            <Package className="w-4 h-4 mr-2" />
                            Back to Dashboard
                        </Button>
                    </div>
                </div>
            </div>

            <div className="relative container mx-auto px-6 py-8 max-w-7xl">
                {/* Status Messages */}
                {error && (
                    <Alert className="mb-6 border-red-200/50 dark:border-red-800/50 bg-red-50/80 dark:bg-red-900/20 backdrop-blur-sm">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="text-red-600 dark:text-red-400 font-medium">
                            {error}
                        </AlertDescription>
                    </Alert>
                )}

                {message && (
                    <Alert className="mb-6 border-green-200/50 dark:border-green-800/50 bg-green-50/80 dark:bg-green-900/20 backdrop-blur-sm">
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription className="text-green-600 dark:text-green-400 font-medium">
                            {message}
                        </AlertDescription>
                    </Alert>
                )}

                <div className="grid lg:grid-cols-4 gap-6">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <Card className="bg-white/80 dark:bg-card/80 backdrop-blur-sm border-0 shadow-xl">
                            <CardContent className="p-6">
                                {/* Profile Summary */}
                                <div className="text-center mb-6">
                                    <div className="relative inline-block mb-4">
                                        <Avatar className="w-20 h-20 mx-auto shadow-lg">
                                            <AvatarImage src={profile.avatar || undefined} />
                                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-lg font-bold">
                                                {getInitials(profile.displayName || profile.firstName + ' ' + profile.lastName || profile.email)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <label htmlFor="avatar-upload">
                                            <Button
                                                size="sm"
                                                disabled={uploadingImage}
                                                className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full p-0 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg cursor-pointer"
                                                asChild
                                            >
                                                <span>
                                                    {uploadingImage ? (
                                                        <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                                                    ) : (
                                                        <Camera className="h-3 w-3" />
                                                    )}
                                                </span>
                                            </Button>
                                        </label>
                                        <input
                                            id="avatar-upload"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleImageUpload}
                                        />
                                    </div>
                                    <h3 className="font-bold text-foreground text-lg mb-1">
                                        {profile.displayName || `${profile.firstName} ${profile.lastName}` || 'User'}
                                    </h3>
                                    <p className="text-sm text-muted-foreground mb-3 break-all">
                                        {profile.email}
                                    </p>

                                    {/* User Roles */}
                                    {profile.userRoles && profile.userRoles.length > 0 && (
                                        <div className="flex flex-wrap gap-1 justify-center mb-3">
                                            {profile.userRoles.map((userRole) => (
                                                <Badge
                                                    key={userRole.id}
                                                    className={`text-xs px-2 py-1 font-medium ${getRoleColor(userRole.role)}`}
                                                >
                                                    <Crown className="w-3 h-3 mr-1" />
                                                    {userRole.role.displayName}
                                                </Badge>
                                            ))}
                                        </div>
                                    )}

                                    {/* Status Badges */}
                                    <div className="flex items-center justify-center space-x-2 mb-4">
                                        {profile.emailVerified && (
                                            <Badge variant="secondary" className="text-xs bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 px-2 py-1">
                                                <CheckCircle className="w-3 h-3 mr-1" />
                                                Verified
                                            </Badge>
                                        )}
                                        {profile.isActive && (
                                            <Badge variant="outline" className="text-xs bg-blue-50 dark:bg-primary/10 text-blue-700 dark:text-primary border-blue-200 dark:border-primary/20 px-2 py-1">
                                                <Zap className="w-3 h-3 mr-1" />
                                                Active
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                {/* Account Stats */}
                                <div className="space-y-4">
                                    <div className="flex items-start space-x-3 text-sm">
                                        <Clock className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" />
                                        <div>
                                            <p className="text-muted-foreground mb-1">Member since</p>
                                            <p className="font-semibold text-foreground text-sm">
                                                {new Date(profile.createdAt).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                    {profile.lastLoginAt && (
                                        <div className="flex items-start space-x-3 text-sm">
                                            <MapPin className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" />
                                            <div>
                                                <p className="text-muted-foreground mb-1">Last seen</p>
                                                <p className="font-semibold text-foreground text-sm">
                                                    {new Date(profile.lastLoginAt).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex items-start space-x-3 text-sm">
                                        <Globe className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" />
                                        <div>
                                            <p className="text-muted-foreground mb-1">Timezone</p>
                                            <p className="font-semibold text-foreground text-sm">{profile.timezone}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                            <TabsList className="grid w-full grid-cols-5 bg-white/50 dark:bg-card/50 backdrop-blur-sm h-12 rounded-xl">
                                <TabsTrigger
                                    value="profile"
                                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white h-10 px-4 rounded-lg font-medium"
                                >
                                    <User className="w-4 h-4 mr-2" />
                                    Profile
                                </TabsTrigger>
                                <TabsTrigger
                                    value="security"
                                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white h-10 px-4 rounded-lg font-medium"
                                >
                                    <Shield className="w-4 h-4 mr-2" />
                                    Security
                                </TabsTrigger>
                                <TabsTrigger
                                    value="preferences"
                                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white h-10 px-4 rounded-lg font-medium"
                                >
                                    <Palette className="w-4 h-4 mr-2" />
                                    Preferences
                                </TabsTrigger>
                                <TabsTrigger
                                    value="invites"
                                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-green-600 data-[state=active]:text-white h-10 px-4 rounded-lg font-medium"
                                >
                                    <UserPlus className="w-4 h-4 mr-2" />
                                    Invites
                                </TabsTrigger>
                                <TabsTrigger
                                    value="danger"
                                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-pink-600 data-[state=active]:text-white h-10 px-4 rounded-lg font-medium"
                                >
                                    <AlertTriangle className="w-4 h-4 mr-2" />
                                    Account
                                </TabsTrigger>
                            </TabsList>

                            {/* Profile Tab */}
                            <TabsContent value="profile" className="space-y-6">
                                <Card className="bg-white/80 dark:bg-card/80 backdrop-blur-sm border-0 shadow-xl">
                                    <CardHeader className="pb-4">
                                        <CardTitle className="flex items-center space-x-3 text-lg">
                                            <User className="w-5 h-5 text-blue-600 dark:text-primary" />
                                            <span>Personal Information</span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6 px-6 pb-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="firstName" className="text-sm font-medium">First Name</Label>
                                                <Input
                                                    id="firstName"
                                                    value={firstName}
                                                    onChange={(e) => setFirstName(e.target.value)}
                                                    placeholder="Your first name"
                                                    className="h-10"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="lastName" className="text-sm font-medium">Last Name</Label>
                                                <Input
                                                    id="lastName"
                                                    value={lastName}
                                                    onChange={(e) => setLastName(e.target.value)}
                                                    placeholder="Your last name"
                                                    className="h-10"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="displayName" className="text-sm font-medium">Display Name</Label>
                                            <Input
                                                id="displayName"
                                                value={displayName}
                                                onChange={(e) => setDisplayName(e.target.value)}
                                                placeholder="How should we display your name?"
                                                className="h-10"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="email"
                                                    value={profile.email}
                                                    disabled
                                                    className="bg-muted/50 h-10 pl-10"
                                                />
                                            </div>
                                            <p className="text-xs text-muted-foreground">Email addresses cannot be changed for security reasons.</p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="phone"
                                                    value={phone}
                                                    onChange={(e) => setPhone(e.target.value)}
                                                    placeholder="+1 (555) 123-4567"
                                                    className="h-10 pl-10"
                                                />
                                            </div>
                                        </div>

                                        <div className="pt-4">
                                            <Button
                                                onClick={updateProfile}
                                                disabled={saving}
                                                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 h-10 px-6 font-medium shadow-lg"
                                            >
                                                {saving ? (
                                                    <>
                                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                                        Saving...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Save className="w-4 h-4 mr-2" />
                                                        Save Changes
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Security Tab */}
                            <TabsContent value="security" className="space-y-6">
                                <Card className="bg-white/80 dark:bg-card/80 backdrop-blur-sm border-0 shadow-xl">
                                    <CardHeader className="pb-4">
                                        <CardTitle className="flex items-center space-x-3 text-lg">
                                            <Lock className="w-5 h-5 text-indigo-600 dark:text-chart-3" />
                                            <span>Change Password</span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6 px-6 pb-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="newPassword" className="text-sm font-medium">New Password</Label>
                                            <div className="relative">
                                                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="newPassword"
                                                    type={showPasswords ? 'text' : 'password'}
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    placeholder="Enter new password"
                                                    className="h-10 pl-10 pr-12"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                                                    onClick={() => setShowPasswords(!showPasswords)}
                                                >
                                                    {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm New Password</Label>
                                            <div className="relative">
                                                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="confirmPassword"
                                                    type={showPasswords ? 'text' : 'password'}
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    placeholder="Confirm new password"
                                                    className="h-10 pl-10"
                                                />
                                            </div>
                                        </div>

                                        <div className="pt-4">
                                            <Button
                                                onClick={changePassword}
                                                disabled={saving || !newPassword || !confirmPassword}
                                                className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 h-10 px-6 font-medium shadow-lg"
                                            >
                                                {saving ? (
                                                    <>
                                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                                        Updating...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Shield className="w-4 h-4 mr-2" />
                                                        Update Password
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-white/80 dark:bg-card/80 backdrop-blur-sm border-0 shadow-xl">
                                    <CardHeader className="pb-4">
                                        <CardTitle className="flex items-center space-x-3 text-lg">
                                            <Shield className="w-5 h-5 text-emerald-600 dark:text-chart-2" />
                                            <span>Two-Factor Authentication</span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="px-6 pb-6">
                                        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                                            <div className="space-y-1">
                                                <h4 className="font-medium">Enhanced Security</h4>
                                                <p className="text-sm text-muted-foreground">
                                                    Add an extra layer of security to your account with two-factor authentication.
                                                </p>
                                            </div>
                                            <Switch
                                                checked={profile.twoFactorEnabled}
                                                onCheckedChange={() => {}}
                                                disabled
                                            />
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-3">
                                            Two-factor authentication setup will be available in a future update.
                                        </p>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Preferences Tab */}
                            <TabsContent value="preferences" className="space-y-6">
                                <Card className="bg-white/80 dark:bg-card/80 backdrop-blur-sm border-0 shadow-xl">
                                    <CardHeader className="pb-4">
                                        <CardTitle className="flex items-center space-x-3 text-lg">
                                            <Settings className="w-5 h-5 text-emerald-600 dark:text-chart-2" />
                                            <span>Application Preferences</span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6 px-6 pb-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium">Timezone</Label>
                                                <Select value={timezone} onValueChange={setTimezone}>
                                                    <SelectTrigger className="h-10">
                                                        <Globe className="w-4 h-4 mr-2 text-muted-foreground" />
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {timezones.map((tz) => (
                                                            <SelectItem key={tz.value} value={tz.value}>
                                                                {tz.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium">Language</Label>
                                                <Select value={language} onValueChange={setLanguage}>
                                                    <SelectTrigger className="h-10">
                                                        <Globe className="w-4 h-4 mr-2 text-muted-foreground" />
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {languages.map((lang) => (
                                                            <SelectItem key={lang.value} value={lang.value}>
                                                                {lang.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium">Theme Preference</Label>
                                            <Select value={theme} onValueChange={setTheme}>
                                                <SelectTrigger className="h-10">
                                                    <Palette className="w-4 h-4 mr-2 text-muted-foreground" />
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {themes.map((theme) => (
                                                        <SelectItem key={theme.value} value={theme.value}>
                                                            {theme.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="pt-4">
                                            <Button
                                                onClick={updateProfile}
                                                disabled={saving}
                                                className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 h-10 px-6 font-medium shadow-lg"
                                            >
                                                {saving ? (
                                                    <>
                                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                                        Saving...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Save className="w-4 h-4 mr-2" />
                                                        Save Preferences
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Invites Tab */}
                            <TabsContent value="invites" className="space-y-6">
                                <Card className="bg-white/80 dark:bg-card/80 backdrop-blur-sm border-0 shadow-xl">
                                    <CardHeader className="pb-4">
                                        <CardTitle className="flex items-center space-x-3 text-lg">
                                            <UserPlus className="w-5 h-5 text-emerald-600 dark:text-chart-2" />
                                            <span>Send Invitation</span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6 px-6 pb-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="inviteEmail" className="text-sm font-medium">Email Address</Label>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        id="inviteEmail"
                                                        type="email"
                                                        value={inviteEmail}
                                                        onChange={(e) => setInviteEmail(e.target.value)}
                                                        placeholder="colleague@company.com"
                                                        className="h-10 pl-10"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium">Role</Label>
                                                <Select value={inviteRole} onValueChange={setInviteRole}>
                                                    <SelectTrigger className="h-10">
                                                        <Users className="w-4 h-4 mr-2 text-muted-foreground" />
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {roles.map((role) => (
                                                            <SelectItem key={role.value} value={role.value}>
                                                                {role.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="inviteMessage" className="text-sm font-medium">Personal Message (Optional)</Label>
                                            <Textarea
                                                id="inviteMessage"
                                                value={inviteMessage}
                                                onChange={(e) => setInviteMessage(e.target.value)}
                                                placeholder="Add a personal message to your invitation..."
                                                className="min-h-[80px] resize-none"
                                            />
                                        </div>

                                        <div className="pt-4">
                                            <Button
                                                onClick={sendInvite}
                                                disabled={sendingInvite || !inviteEmail.trim()}
                                                className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 h-10 px-6 font-medium shadow-lg"
                                            >
                                                {sendingInvite ? (
                                                    <>
                                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                                        Sending...
                                                    </>
                                                ) : (
                                                    <>
                                                        <UserPlus className="w-4 h-4 mr-2" />
                                                        Send Invitation
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Sent Invitations */}
                                <Card className="bg-white/80 dark:bg-card/80 backdrop-blur-sm border-0 shadow-xl">
                                    <CardHeader className="pb-4">
                                        <CardTitle className="flex items-center space-x-3 text-lg">
                                            <Users className="w-5 h-5 text-blue-600 dark:text-primary" />
                                            <span>Sent Invitations</span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="px-6 pb-6">
                                        {invites.length === 0 ? (
                                            <div className="text-center py-8">
                                                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                                                <h3 className="font-medium text-foreground mb-1">No invitations sent</h3>
                                                <p className="text-sm text-muted-foreground">Start inviting team members to collaborate.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {invites.map((invite) => (
                                                    <div key={invite.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                                                        <div className="flex items-center space-x-3">
                                                            <Avatar className="w-8 h-8">
                                                                <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-blue-500 text-white text-xs">
                                                                    {invite.email.charAt(0).toUpperCase()}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <p className="font-medium text-sm">{invite.email}</p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {invite.role} • {new Date(invite.created_at).toLocaleDateString()}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <Badge
                                                            variant={invite.status === 'PENDING' ? 'secondary' : invite.status === 'ACCEPTED' ? 'default' : 'destructive'}
                                                            className="text-xs"
                                                        >
                                                            {invite.status}
                                                        </Badge>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Danger Zone Tab */}
                            <TabsContent value="danger" className="space-y-6">
                                <Card className="bg-white/80 dark:bg-card/80 backdrop-blur-sm border-0 shadow-xl border-red-200 dark:border-red-800">
                                    <CardHeader className="pb-4">
                                        <CardTitle className="flex items-center space-x-3 text-red-600 dark:text-red-400 text-lg">
                                            <AlertTriangle className="w-5 h-5" />
                                            <span>Danger Zone</span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="px-6 pb-6">
                                        <div className="p-6 border border-red-200 dark:border-red-800 rounded-lg bg-red-50/50 dark:bg-red-900/10 space-y-4">
                                            <div className="space-y-2">
                                                <h3 className="text-base font-bold text-red-700 dark:text-red-400">Delete Account</h3>
                                                <p className="text-sm text-red-600 dark:text-red-300">
                                                    Once you delete your account, there is no going back. Please be certain.
                                                </p>
                                            </div>

                                            <div className="space-y-3">
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-medium text-red-700 dark:text-red-400">
                                                        Type &quot;DELETE&quot; to confirm
                                                    </Label>
                                                    <Input
                                                        value={deleteConfirmation}
                                                        onChange={(e) => setDeleteConfirmation(e.target.value)}
                                                        placeholder="DELETE"
                                                        className="h-10 border-red-200 dark:border-red-800 focus:border-red-500"
                                                    />
                                                </div>

                                                <Button
                                                    onClick={deleteAccount}
                                                    disabled={saving || deleteConfirmation !== 'DELETE'}
                                                    variant="destructive"
                                                    className="w-full sm:w-auto h-10 px-6 font-medium bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg"
                                                >
                                                    {saving ? (
                                                        <>
                                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                                            Deleting...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Trash2 className="w-4 h-4 mr-2" />
                                                            Delete Account
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </div>
    )
}

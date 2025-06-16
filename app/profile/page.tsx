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
    Palette
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
}

export default function ProfilePage() {
    const { user, logout, loading: authLoading } = useAuth()
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')
    const [activeTab, setActiveTab] = useState('profile')    // Form states
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
        { value: 'ja', label: '日本語' },
        { value: 'ko', label: '한국어' }
    ]

    const themes = [
        { value: 'light', label: 'Light' },
        { value: 'dark', label: 'Dark' },
        { value: 'system', label: 'System' }    ]

    const fetchProfile = useCallback(async () => {
        if (!user) return

        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', user.id)
                .single()

            if (error) {
                console.error('Error fetching profile:', error)
                setError('Failed to load profile')
                setLoading(false)
                return
            }

            if (data) {
                setProfile(data)
                setFirstName(data.firstName || '')
                setLastName(data.lastName || '')
                setDisplayName(data.displayName || '')
                setPhone(data.phone || '')
                setTimezone(data.timezone || 'UTC')
                setLanguage(data.language || 'en')
                setTheme(data.theme || 'system')
            }
        } catch (err) {
            console.error('Unexpected error:', err)
            setError('An unexpected error occurred')
        } finally {
            setLoading(false)
        }
    }, [user])

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/auth/login')
            return
        }

        if (user) {
            fetchProfile()
        }
    }, [user, authLoading, router, fetchProfile])

    const updateProfile = async () => {
        if (!user || !profile) return

        setSaving(true)
        setError('')
        setMessage('')

        try {
            const { error } = await supabase
                .from('users')
                .update({
                    firstName: firstName.trim(),
                    lastName: lastName.trim(),
                    displayName: displayName.trim() || `${firstName.trim()} ${lastName.trim()}`,
                    phone: phone.trim() || null,
                    timezone,
                    language,
                    theme,
                    updatedAt: new Date().toISOString()
                })
                .eq('id', user.id)

            if (error) {
                setError(error.message)
                return
            }

            setMessage('Profile updated successfully!')
            await fetchProfile() // Refresh profile data
        } catch (err) {
            console.error('Profile update error:', err)
            setError('An unexpected error occurred')
        } finally {
            setSaving(false)
        }
    }

    const changePassword = async () => {
        if (!newPassword || !confirmPassword) {
            setError('Please fill in all password fields')
            return
        }

        if (newPassword !== confirmPassword) {
            setError('New passwords do not match')
            return
        }

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters long')
            return
        }

        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            })

            if (error) {
                setError(error.message)
                return            }

            setMessage('Password changed successfully!')
            setNewPassword('')
            setConfirmPassword('')
        } catch (err) {
            console.error('Password change error:', err)
            setError('An unexpected error occurred')
        }
    }

    const deleteAccount = async () => {
        if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            return
        }

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
        }
    }

    const getInitials = (name: string) => {        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }

    if (loading) {
        return (
            <div className="min-h-[calc(100vh-64px)] pt-16 bg-gradient-to-br from-slate-50/90 via-blue-50/40 to-indigo-50/60 dark:from-background dark:via-muted/20 dark:to-chart-3/10 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>        )
    }

    if (!profile) {
        return (
            <div className="min-h-[calc(100vh-64px)] pt-16 bg-gradient-to-br from-slate-50/90 via-blue-50/40 to-indigo-50/60 dark:from-background dark:via-muted/20 dark:to-chart-3/10 flex items-center justify-center">
                <div className="text-center">
                    <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-foreground mb-2">
                        Profile Not Found
                    </h2>
                    <p className="text-muted-foreground">
                        Unable to load your profile information.
                    </p>
                </div>
            </div>        )
    }

    return (
        <div className="min-h-[calc(100vh-64px)] pt-16 bg-gradient-to-br from-slate-50/90 via-blue-50/40 to-indigo-50/60 dark:from-background dark:via-muted/20 dark:to-chart-3/10">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-grid-slate-100 dark:bg-grid-slate-800/20 [mask-image:radial-gradient(ellipse_at_center,white_40%,rgba(255,255,255,0.4)_70%,transparent_100%)] dark:[mask-image:radial-gradient(ellipse_at_center,rgba(255,255,255,0.1)_40%,rgba(255,255,255,0.05)_70%,transparent_100%)]" />
            
            {/* Floating Elements */}
            <div className="absolute top-20 left-10 animate-float opacity-40">
                <div className="w-2 h-2 bg-blue-400 rounded-full blur-[0.5px]" />
            </div>
            <div className="absolute top-40 right-20 animate-float delay-1000 opacity-30">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full blur-[0.5px]" />
            </div>
            <div className="absolute bottom-32 left-32 animate-float delay-500 opacity-35">
                <div className="w-2.5 h-2.5 bg-indigo-400 rounded-full blur-[0.5px]" />
            </div>            {/* Header */}
            <div className="relative bg-white/80 dark:bg-card/80 backdrop-blur-sm border-b border-border/50">
                <div className="container mx-auto px-6 py-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-8">
                            <div className="inline-flex items-center bg-gradient-to-r from-emerald-50/80 to-blue-50/80 dark:from-primary/10 dark:to-chart-2/10 text-emerald-700 dark:text-primary px-4 py-3 rounded-full text-sm font-medium border border-emerald-200/50 dark:border-primary/20 backdrop-blur-sm">
                                <Package className="h-5 w-5 mr-3" />
                                <span>Profile Center</span>
                            </div>
                            <div className="space-y-2">
                                <h1 className="text-3xl font-bold text-foreground">
                                    Profile Settings
                                </h1>
                                <p className="text-muted-foreground text-lg">
                                    Manage your account settings and preferences
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => router.push('/dashboard')}
                            className="bg-white/50 dark:bg-card/50 border-border/50 hover:bg-white/80 dark:hover:bg-card/80 h-12 px-6"
                        >
                            Back to Dashboard
                        </Button>
                    </div>
                </div>
            </div><div className="relative container mx-auto px-6 py-12 max-w-7xl">
                {/* Status Messages */}
                {error && (
                    <Alert className="mb-8 border-red-200/50 dark:border-red-800/50 bg-red-50/80 dark:bg-red-900/20 backdrop-blur-sm">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="text-red-600 dark:text-red-400">
                            {error}
                        </AlertDescription>
                    </Alert>
                )}

                {message && (
                    <Alert className="mb-8 border-green-200/50 dark:border-green-800/50 bg-green-50/80 dark:bg-green-900/20 backdrop-blur-sm">
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription className="text-green-600 dark:text-green-400">
                            {message}
                        </AlertDescription>
                    </Alert>
                )}

                <div className="grid lg:grid-cols-4 gap-10">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <Card className="bg-white/80 dark:bg-card/80 backdrop-blur-sm border-0 shadow-xl">
                            <CardContent className="p-8">
                                {/* Profile Summary */}
                                <div className="text-center mb-8">
                                    <div className="relative inline-block">
                                        <Avatar className="w-24 h-24 mx-auto mb-6">
                                            <AvatarImage src={profile.avatar || undefined} />
                                            <AvatarFallback className="bg-blue-100 dark:bg-primary/20 text-blue-600 dark:text-primary text-xl">
                                                {getInitials(profile.displayName || profile.firstName || 'U')}
                                            </AvatarFallback>
                                        </Avatar>
                                        <Button
                                            size="sm"
                                            className="absolute -bottom-2 -right-2 h-10 w-10 rounded-full p-0 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
                                        >
                                            <Camera className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <h3 className="font-semibold text-foreground text-lg mb-2">
                                        {profile.displayName || `${profile.firstName} ${profile.lastName}` || 'User'}
                                    </h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        {profile.email}
                                    </p>
                                    <div className="flex items-center justify-center space-x-3 mt-4">
                                        {profile.emailVerified && (
                                            <Badge variant="secondary" className="text-xs bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 px-3 py-1">
                                                <CheckCircle className="w-3 h-3 mr-1" />
                                                Verified
                                            </Badge>
                                        )}
                                        {profile.isActive && (
                                            <Badge variant="outline" className="text-xs bg-blue-50 dark:bg-primary/10 text-blue-700 dark:text-primary border-blue-200 dark:border-primary/20 px-3 py-1">
                                                Active
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                {/* Account Stats */}
                                <div className="space-y-6">
                                    <div className="flex items-start space-x-4 text-sm">
                                        <Clock className="w-5 h-5 text-muted-foreground mt-1" />
                                        <div>
                                            <p className="text-muted-foreground mb-1">Member since</p>
                                            <p className="font-medium text-foreground">
                                                {new Date(profile.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    {profile.lastLoginAt && (
                                        <div className="flex items-start space-x-4 text-sm">
                                            <MapPin className="w-5 h-5 text-muted-foreground mt-1" />
                                            <div>
                                                <p className="text-muted-foreground mb-1">Last login</p>
                                                <p className="font-medium text-foreground">
                                                    {new Date(profile.lastLoginAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
                            <TabsList className="grid w-full grid-cols-4 bg-white/50 dark:bg-card/50 backdrop-blur-sm h-14">
                                <TabsTrigger value="profile" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white h-12 px-6">
                                    <User className="w-4 h-4 mr-2" />
                                    Profile
                                </TabsTrigger>
                                <TabsTrigger value="security" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white h-12 px-6">
                                    <Shield className="w-4 h-4 mr-2" />
                                    Security
                                </TabsTrigger>
                                <TabsTrigger value="preferences" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white h-12 px-6">
                                    <Palette className="w-4 h-4 mr-2" />
                                    Preferences
                                </TabsTrigger>
                                <TabsTrigger value="danger" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-pink-600 data-[state=active]:text-white h-12 px-6">
                                    <AlertTriangle className="w-4 h-4 mr-2" />
                                    Account
                                </TabsTrigger>
                            </TabsList>

                            {/* Profile Tab */}
                            <TabsContent value="profile" className="space-y-8">
                                <Card className="bg-white/80 dark:bg-card/80 backdrop-blur-sm border-0 shadow-xl">
                                    <CardHeader className="pb-6">
                                        <CardTitle className="flex items-center space-x-3 text-xl">
                                            <User className="w-6 h-6 text-blue-600 dark:text-primary" />
                                            <span>Personal Information</span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-8 px-8 pb-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-2">
                                                <Label htmlFor="firstName" className="text-sm font-medium">First Name</Label>
                                                <Input
                                                    id="firstName"
                                                    value={firstName}
                                                    onChange={(e) => setFirstName(e.target.value)}
                                                    placeholder="Enter your first name"
                                                    className="h-12"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="lastName" className="text-sm font-medium">Last Name</Label>
                                                <Input
                                                    id="lastName"
                                                    value={lastName}
                                                    onChange={(e) => setLastName(e.target.value)}
                                                    placeholder="Enter your last name"
                                                    className="h-12"
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
                                                className="h-12"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                                            <Input
                                                id="email"
                                                value={profile.email}
                                                disabled
                                                className="bg-muted h-12"
                                            />
                                            <p className="text-xs text-muted-foreground mt-2">
                                                Email cannot be changed for security reasons
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
                                            <Input
                                                id="phone"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                placeholder="+1 (555) 123-4567"
                                                className="h-12"
                                            />
                                        </div>

                                        <div className="pt-6">
                                            <Button 
                                                onClick={updateProfile} 
                                                disabled={saving}
                                                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white h-12 px-8"
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
                            </TabsContent>                            {/* Security Tab */}
                            <TabsContent value="security" className="space-y-8">
                                <Card className="bg-white/80 dark:bg-card/80 backdrop-blur-sm border-0 shadow-xl">
                                    <CardHeader className="pb-6">
                                        <CardTitle className="flex items-center space-x-3 text-xl">
                                            <Shield className="w-6 h-6 text-indigo-600 dark:text-chart-3" />
                                            <span>Change Password</span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-8 px-8 pb-8">
                                        <div className="space-y-2">
                                            <Label htmlFor="newPassword" className="text-sm font-medium">New Password</Label>
                                            <div className="relative">
                                                <Input
                                                    id="newPassword"
                                                    type={showPasswords ? 'text' : 'password'}
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    placeholder="Enter new password"
                                                    className="h-12 pr-12"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                    onClick={() => setShowPasswords(!showPasswords)}
                                                >
                                                    {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm New Password</Label>
                                            <Input
                                                id="confirmPassword"
                                                type={showPasswords ? 'text' : 'password'}
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                placeholder="Confirm new password"
                                                className="h-12"
                                            />
                                        </div>

                                        <div className="pt-6">
                                            <Button 
                                                onClick={changePassword}
                                                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white h-12 px-8"
                                            >
                                                <Key className="w-4 h-4 mr-2" />
                                                Change Password
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-white/80 dark:bg-card/80 backdrop-blur-sm border-0 shadow-xl">
                                    <CardHeader className="pb-6">
                                        <CardTitle className="flex items-center space-x-3 text-xl">
                                            <Shield className="w-6 h-6 text-emerald-600 dark:text-chart-2" />
                                            <span>Two-Factor Authentication</span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="px-8 pb-8">
                                        <div className="flex items-center justify-between p-6 bg-muted/30 rounded-lg">
                                            <div>
                                                <p className="font-medium text-foreground mb-2">Two-Factor Authentication</p>
                                                <p className="text-sm text-muted-foreground">
                                                    Add an extra layer of security to your account
                                                </p>
                                            </div>
                                            <Switch
                                                checked={profile.twoFactorEnabled}
                                                onCheckedChange={() => {}}
                                                disabled
                                            />
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-4">
                                            Two-factor authentication setup coming soon.
                                        </p>
                                    </CardContent>
                                </Card>
                            </TabsContent>                            {/* Preferences Tab */}
                            <TabsContent value="preferences" className="space-y-8">
                                <Card className="bg-white/80 dark:bg-card/80 backdrop-blur-sm border-0 shadow-xl">
                                    <CardHeader className="pb-6">
                                        <CardTitle className="flex items-center space-x-3 text-xl">
                                            <Palette className="w-6 h-6 text-emerald-600 dark:text-chart-2" />
                                            <span>Application Settings</span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-8 px-8 pb-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-2">
                                                <Label htmlFor="timezone" className="text-sm font-medium">Timezone</Label>
                                                <Select value={timezone} onValueChange={setTimezone}>
                                                    <SelectTrigger className="h-12">
                                                        <SelectValue placeholder="Select timezone" />
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
                                                <Label htmlFor="language" className="text-sm font-medium">Language</Label>
                                                <Select value={language} onValueChange={setLanguage}>
                                                    <SelectTrigger className="h-12">
                                                        <SelectValue placeholder="Select language" />
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
                                            <Label htmlFor="theme" className="text-sm font-medium">Theme</Label>
                                            <Select value={theme} onValueChange={setTheme}>
                                                <SelectTrigger className="h-12">
                                                    <SelectValue placeholder="Select theme" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {themes.map((t) => (
                                                        <SelectItem key={t.value} value={t.value}>
                                                            {t.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="pt-6">
                                            <Button 
                                                onClick={updateProfile} 
                                                disabled={saving}
                                                className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white h-12 px-8"
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
                            </TabsContent>                            {/* Danger Zone Tab */}
                            <TabsContent value="danger" className="space-y-8">
                                <Card className="bg-white/80 dark:bg-card/80 backdrop-blur-sm border-0 shadow-xl border-red-200 dark:border-red-800">
                                    <CardHeader className="pb-6">
                                        <CardTitle className="flex items-center space-x-3 text-red-600 dark:text-red-400 text-xl">
                                            <AlertTriangle className="w-6 h-6" />
                                            <span>Danger Zone</span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="px-8 pb-8">
                                        <div className="p-8 border border-red-200 dark:border-red-800 rounded-lg bg-red-50/50 dark:bg-red-900/10">
                                            <h3 className="font-semibold text-red-800 dark:text-red-300 mb-4 text-lg">
                                                Delete Account
                                            </h3>
                                            <p className="text-sm text-red-600 dark:text-red-400 mb-8 leading-relaxed">
                                                Once you delete your account, there is no going back. Please be certain. All your data, 
                                                including profile information, settings, and history will be permanently removed.
                                            </p>
                                            <Button 
                                                onClick={deleteAccount}
                                                variant="destructive"
                                                className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 h-12 px-8"
                                            >
                                                <Trash2 className="w-4 h-4 mr-2" />
                                                Delete Account Permanently
                                            </Button>
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

'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import { Package, Eye, EyeOff, Mail, Lock, User, Phone, Globe, TrendingUp, Shield, Zap, CheckCircle, Star } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function SignUpPage() {
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [timezone, setTimezone] = useState('UTC')
    const [language, setLanguage] = useState('en')
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')
    const { signUp, signInWithGoogle } = useAuth()
    const router = useRouter()

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        setMessage('')

        if (password !== confirmPassword) {
            setError('Passwords do not match')
            setLoading(false)
            return
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters long')
            setLoading(false)
            return
        }

        if (!firstName.trim() || !lastName.trim()) {
            setError('First name and last name are required')
            setLoading(false)
            return
        }

        try {
            const { data, error } = await signUp(email, password)

            if (error) {
                setError(error.message)
            } else if (data.user) {
                console.log('User created in auth, now storing in database:', data.user.id)

                // Store comprehensive user data in Supabase database
                try {
                    const { data: insertData, error: dbError } = await supabase
                        .from('users')
                        .insert({
                            id: data.user.id,
                            email: email,
                            firstName: firstName.trim(),
                            lastName: lastName.trim(),
                            displayName: `${firstName.trim()} ${lastName.trim()}`,
                            phone: phone.trim() || null,
                            timezone: timezone,
                            language: language,
                            theme: 'system',
                            isActive: true,
                            isVerified: false,
                            emailVerified: false,
                            twoFactorEnabled: false,
                            failedLoginCount: 0,
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString()
                        })
                        .select()

                    if (dbError) {
                        console.error('Database error details:', dbError)
                        setError(`Account created but failed to store profile: ${dbError.message}`)
                        return
                    }

                    console.log('User data stored successfully:', insertData)
                    setMessage('Account created successfully! Please check your email to verify your account.')

                    // Optionally redirect to dashboard after a delay
                    setTimeout(() => {
                        router.push('/dashboard')
                    }, 3000)
                } catch (dbErr) {
                    console.error('Unexpected database error:', dbErr)
                    setError('Account created but failed to store profile. Please contact support.')
                }
            }
        } catch (err) {
            console.error('SignUp error:', err)
            setError('An unexpected error occurred')
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleSignIn = async () => {
        setLoading(true)
        try {
            const { error } = await signInWithGoogle()
            if (error) {
                setError(error.message)
            }
        } catch (err) {
            console.error('Google SignIn error:', err)
            setError('An unexpected error occurred with Google sign in')        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50/90 via-blue-50/40 to-indigo-50/60 dark:from-background dark:via-muted/20 dark:to-chart-3/10 overflow-hidden pt-16">
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
            </div>
            
            <div className="relative container mx-auto px-4 py-8 lg:py-12 max-w-7xl">
                <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center min-h-[calc(100vh-164px)]">
                    {/* Left Side - Marketing Content */}
                    <div className="space-y-8">
                        {/* Header with Status Badge */}
                        <div className="space-y-6">
                            <div className="inline-flex items-center bg-gradient-to-r from-emerald-50/80 to-blue-50/80 dark:from-primary/10 dark:to-chart-2/10 text-emerald-700 dark:text-primary px-4 py-2 rounded-full text-sm font-medium border border-emerald-200/50 dark:border-primary/20 backdrop-blur-sm w-fit">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse" />
                                <Zap className="h-4 w-4 mr-2" />
                                <span>Join the Supply Chain Revolution</span>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="flex items-center space-x-3">
                                    <Package className="h-10 w-10 text-blue-600 dark:text-primary" />
                                    <h1 className="text-4xl lg:text-5xl font-bold text-foreground">
                                        Join 
                                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 dark:from-primary dark:via-chart-3 dark:to-chart-2 block lg:inline lg:ml-2">
                                            Invista
                                        </span>
                                    </h1>
                                </div>
                                <div className="flex items-center space-x-2 text-muted-foreground">
                                    <div className="h-1 w-12 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full" />
                                    <span className="text-sm font-medium">Smart Supply Chain Platform</span>
                                </div>
                            </div>
                            
                            <p className="text-xl text-muted-foreground leading-relaxed">
                                Start your journey to smarter inventory management with 
                                <span className="text-foreground font-semibold"> enterprise-grade tools</span> trusted by 
                                <span className="text-foreground font-semibold"> 10,000+ businesses</span> worldwide.
                            </p>
                        </div>

                        {/* Enhanced Features Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex items-center space-x-3 group hover:bg-blue-50/50 dark:hover:bg-primary/10 p-3 rounded-lg transition-all duration-300">
                                <div className="w-8 h-8 bg-blue-100 dark:bg-primary/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                                    <TrendingUp className="w-4 h-4 text-blue-600 dark:text-primary" />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-semibold text-foreground">Real-time Analytics</h3>
                                    <p className="text-sm text-muted-foreground">Sub-second data updates</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3 group hover:bg-emerald-50/50 dark:hover:bg-chart-2/10 p-3 rounded-lg transition-all duration-300">
                                <div className="w-8 h-8 bg-emerald-100 dark:bg-chart-2/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                                    <Globe className="w-4 h-4 text-emerald-600 dark:text-chart-2" />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-semibold text-foreground">Global Reach</h3>
                                    <p className="text-sm text-muted-foreground">Multi-region support</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3 group hover:bg-indigo-50/50 dark:hover:bg-chart-3/10 p-3 rounded-lg transition-all duration-300">
                                <div className="w-8 h-8 bg-indigo-100 dark:bg-chart-3/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                                    <Shield className="w-4 h-4 text-indigo-600 dark:text-chart-3" />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-semibold text-foreground">Enterprise Security</h3>
                                    <p className="text-sm text-muted-foreground">SOC 2 Type II compliant</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3 group hover:bg-amber-50/50 dark:hover:bg-chart-4/10 p-3 rounded-lg transition-all duration-300">
                                <div className="w-8 h-8 bg-amber-100 dark:bg-chart-4/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                                    <CheckCircle className="w-4 h-4 text-amber-600 dark:text-chart-4" />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-semibold text-foreground">Easy Integration</h3>
                                    <p className="text-sm text-muted-foreground">Connect existing tools</p>
                                </div>
                            </div>
                        </div>

                        {/* Social Proof with Enhanced Styling */}
                        <div className="p-4 bg-white/40 dark:bg-card/30 backdrop-blur-sm rounded-2xl border border-white/30 dark:border-border/30 shadow-lg">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-2">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                                    ))}
                                    <span className="text-sm font-semibold text-foreground ml-2">4.9/5</span>
                                </div>
                                <span className="text-sm text-muted-foreground">10,000+ businesses</span>
                            </div>
                            
                            <div>
                                <p className="text-sm text-muted-foreground mb-3">Trusted by leading companies</p>
                                <div className="flex items-center space-x-4">
                                    <Badge variant="outline" className="px-3 py-1 bg-white/50 dark:bg-card/50">TechCorp</Badge>
                                    <Badge variant="outline" className="px-3 py-1 bg-white/50 dark:bg-card/50">GlobalTrade</Badge>
                                    <Badge variant="outline" className="px-3 py-1 bg-white/50 dark:bg-card/50">RetailPro</Badge>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 bg-white/40 dark:bg-card/30 backdrop-blur-sm rounded-2xl border border-white/30 dark:border-border/30 shadow-lg">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-2">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                                    ))}
                                    <span className="text-sm font-semibold text-foreground ml-2">4.9/5</span>
                                </div>
                                <span className="text-sm text-muted-foreground">10,000+ businesses</span>
                            </div>
                            
                            <div>
                                <p className="text-sm text-muted-foreground mb-3">Trusted by leading companies</p>
                                <div className="flex items-center space-x-4">
                                    <Badge variant="outline" className="px-3 py-1 bg-white/50 dark:bg-card/50">TechCorp</Badge>
                                    <Badge variant="outline" className="px-3 py-1 bg-white/50 dark:bg-card/50">GlobalTrade</Badge>
                                    <Badge variant="outline" className="px-3 py-1 bg-white/50 dark:bg-card/50">RetailPro</Badge>
                                </div>
                            </div>
                        </div><div className="p-4 bg-white/40 dark:bg-card/30 backdrop-blur-sm rounded-2xl border border-white/30 dark:border-border/30 shadow-lg">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-2">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                                    ))}
                                    <span className="text-sm font-semibold text-foreground ml-2">4.9/5</span>
                                </div>
                                <span className="text-sm text-muted-foreground">10,000+ businesses</span>
                            </div>
                            
                            <div>
                                <p className="text-sm text-muted-foreground mb-3">Trusted by leading companies</p>
                                <div className="flex items-center space-x-4">
                                    <Badge variant="outline" className="px-3 py-1 bg-white/50 dark:bg-card/50">TechCorp</Badge>
                                    <Badge variant="outline" className="px-3 py-1 bg-white/50 dark:bg-card/50">GlobalTrade</Badge>
                                    <Badge variant="outline" className="px-3 py-1 bg-white/50 dark:bg-card/50">RetailPro</Badge>
                                </div>
                            </div>
                        </div>
                        
                    </div>

                    {/* Right Side - Sign Up Form */}
                    <div className="flex justify-center lg:justify-end">
                        <Card className="w-full max-w-md bg-white/80 dark:bg-card/80 backdrop-blur-sm border-0 shadow-2xl">
                            <CardContent className="p-8">
                                <div className="text-center mb-8">
                                    <h2 className="text-2xl font-bold text-foreground mb-2">
                                        Create Your Account
                                    </h2>
                                    <p className="text-muted-foreground">
                                        Get started with your free trial
                                    </p>
                                </div>

                                {error && (
                                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                        <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                                    </div>
                                )}

                                {message && (
                                    <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                        <p className="text-green-600 dark:text-green-400 text-sm">{message}</p>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {/* Name Fields */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-sm font-medium text-foreground mb-2">
                                                First Name
                                            </label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                <input
                                                    type="text"
                                                    required
                                                    className="w-full pl-10 pr-4 py-2.5 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
                                                    placeholder="John"
                                                    value={firstName}
                                                    onChange={(e) => setFirstName(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-foreground mb-2">
                                                Last Name
                                            </label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                <input
                                                    type="text"
                                                    required
                                                    className="w-full pl-10 pr-4 py-2.5 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
                                                    placeholder="Doe"
                                                    value={lastName}
                                                    onChange={(e) => setLastName(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">
                                            Email Address
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <input
                                                type="email"
                                                required
                                                className="w-full pl-10 pr-4 py-2.5 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
                                                placeholder="john@example.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    {/* Phone */}
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">
                                            Phone Number (Optional)
                                        </label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <input
                                                type="tel"
                                                className="w-full pl-10 pr-4 py-2.5 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
                                                placeholder="+1 (555) 123-4567"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    {/* Timezone and Language */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-sm font-medium text-foreground mb-2">
                                                Timezone
                                            </label>
                                            <Select value={timezone} onValueChange={setTimezone}>
                                                <SelectTrigger className="w-full">
                                                    <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
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
                                        <div>
                                            <label className="block text-sm font-medium text-foreground mb-2">
                                                Language
                                            </label>
                                            <Select value={language} onValueChange={setLanguage}>
                                                <SelectTrigger className="w-full">
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

                                    {/* Password */}
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">
                                            Password
                                        </label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                required
                                                className="w-full pl-10 pr-12 py-2.5 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
                                                placeholder="••••••••"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                            />
                                            <button
                                                type="button"
                                                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Confirm Password */}
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">
                                            Confirm Password
                                        </label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <input
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                required
                                                className="w-full pl-10 pr-12 py-2.5 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
                                                placeholder="••••••••"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                            />
                                            <button
                                                type="button"
                                                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            >
                                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
                                    >
                                        {loading ? (
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <span>Create Account</span>
                                            </>
                                        )}
                                    </button>

                                    {/* Divider */}
                                    <div className="relative">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-border" />
                                        </div>
                                        <div className="relative flex justify-center text-sm">
                                            <span className="px-2 bg-background text-muted-foreground">
                                                Or continue with
                                            </span>
                                        </div>
                                    </div>

                                    {/* Google Sign In */}
                                    <button
                                        type="button"
                                        onClick={handleGoogleSignIn}
                                        disabled={loading}
                                        className="w-full border border-input hover:bg-accent hover:text-accent-foreground disabled:opacity-50 text-foreground font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                                    >
                                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                                            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                        </svg>
                                        <span>Sign up with Google</span>
                                    </button>
                                </form>

                                <p className="mt-6 text-center text-sm text-muted-foreground">
                                    By signing up, you agree to our{' '}
                                    <Link href="/terms" className="text-primary hover:underline">
                                        Terms of Service
                                    </Link>{' '}
                                    and{' '}
                                    <Link href="/privacy" className="text-primary hover:underline">
                                        Privacy Policy
                                    </Link>
                                </p>

                                <div className="mt-6 text-center">
                                    <span className="text-sm text-muted-foreground">
                                        Already have an account?{' '}
                                        <Link href="/auth/login" className="text-primary hover:underline font-medium">
                                            Sign in
                                        </Link>
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}

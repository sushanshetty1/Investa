'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import { Package, Eye, EyeOff, Mail, Lock, User, TrendingUp, Shield, Zap, CheckCircle, Star } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function SignUpPage() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')
    const { signUp, signInWithGoogle } = useAuth()
    const router = useRouter()

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
        } try {
            const { data, error } = await signUp(email, password)

            if (error) {
                setError(error.message)
            } else if (data.user) {
                console.log('User created in auth, now storing in database:', data.user.id)

                // Store user data in Supabase database
                try {
                    const { data: insertData, error: dbError } = await supabase
                        .from('User')
                        .insert({
                            id: data.user.id,
                            name: name,
                            email: email,
                        })
                        .select()

                    if (dbError) {
                        console.error('Database error details:', dbError)
                        setError(`Account created but failed to store profile: ${dbError.message}`)
                        return
                    } console.log('User data stored successfully:', insertData)
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
            console.error('Signup error:', err)
            setError('An unexpected error occurred')
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleSignIn = async () => {
        setLoading(true)
        setError('')

        try {
            const { error } = await signInWithGoogle()
            if (error) {
                setError(error.message)
                setLoading(false)            }            // Note: Don't set loading to false here as user will be redirected
        } catch {
            setError('An unexpected error occurred')
            setLoading(false)
        }
    }

    return (        <div className="min-h-screen bg-gradient-to-br from-slate-50/90 via-blue-50/40 to-indigo-50/60 dark:from-background dark:via-muted/20 dark:to-chart-3/10 pt-16">            <div className="container mx-auto px-4 py-8 lg:py-12">
                <div className="flex flex-col lg:flex-row lg:items-center gap-8 lg:gap-16 xl:gap-20 min-h-[calc(100vh-8rem)]">
                    {/* Left Side - Marketing Content */}
                    <div className="hidden lg:block lg:flex-1 lg:pr-8 xl:pr-12">
                        <div className="max-w-xl space-y-8">
                            {/* Hero Section */}
                            <div className="space-y-6">                                <h2 className="text-4xl xl:text-5xl font-bold text-foreground leading-tight">
                                    Transform Your Supply Chain Today
                                </h2>
                                <p className="text-xl text-muted-foreground leading-relaxed">
                                    Join hundreds of companies who trust Invista to streamline their inventory management with real-time visibility and intelligent automation.
                                </p>
                            </div>

                            {/* Features Grid */}
                            <div className="grid grid-cols-1 gap-4">                                <Card className="p-4 border-0 bg-card/50 backdrop-blur-sm">
                                    <div className="flex items-start space-x-3">
                                        <div className="p-2 bg-primary/10 rounded-lg">
                                            <Package className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-sm">Real-Time Inventory</h3>
                                            <p className="text-xs text-muted-foreground">Track stock levels across all locations instantly</p>
                                        </div>
                                    </div>
                                </Card>
                                
                                <Card className="p-4 border-0 bg-card/50 backdrop-blur-sm">
                                    <div className="flex items-start space-x-3">
                                        <div className="p-2 bg-green-500/10 rounded-lg">
                                            <Shield className="h-5 w-5 text-green-500" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-sm">Enterprise Security</h3>
                                            <p className="text-xs text-muted-foreground">SOC 2 compliant with 99.9% uptime</p>
                                        </div>
                                    </div>
                                </Card>
                                
                                <Card className="p-4 border-0 bg-card/50 backdrop-blur-sm">
                                    <div className="flex items-start space-x-3">
                                        <div className="p-2 bg-yellow-500/10 rounded-lg">
                                            <Zap className="h-5 w-5 text-yellow-500" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-sm">Smart Automation</h3>
                                            <p className="text-xs text-muted-foreground">AI-powered demand forecasting and reordering</p>
                                        </div>
                                    </div>
                                </Card>
                                
                                <Card className="p-4 border-0 bg-card/50 backdrop-blur-sm">
                                    <div className="flex items-start space-x-3">
                                        <div className="p-2 bg-blue-500/10 rounded-lg">
                                            <TrendingUp className="h-5 w-5 text-blue-500" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-sm">Advanced Analytics</h3>
                                            <p className="text-xs text-muted-foreground">Real-time insights and performance metrics</p>
                                        </div>
                                    </div>
                                </Card>
                            </div>

                            {/* Social Proof */}
                            <div className="space-y-4">
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center space-x-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                        ))}
                                    </div>                                    <span className="text-sm text-muted-foreground">4.9/5 from 500+ companies</span>
                                </div>
                                
                                <div className="space-y-3">                                    <p className="text-sm italic text-muted-foreground">
                                        &quot;Invista has transformed our supply chain operations. We&apos;ve reduced costs by 25% while improving efficiency.&quot;
                                    </p>
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                                            J
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">James Rodriguez</p>
                                            <p className="text-xs text-muted-foreground">Operations Director</p>
                                        </div>
                                    </div>
                                </div>
                            </div>                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-border/50">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-primary">50+</div>
                                    <div className="text-sm text-muted-foreground">Warehouses</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-primary">500+</div>
                                    <div className="text-sm text-muted-foreground">Companies</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-primary">99.9%</div>
                                    <div className="text-sm text-muted-foreground">Uptime</div>
                                </div>
                            </div>
                        </div>
                    </div>                    {/* Right Side - Sign Up Form */}
                    <div className="w-full lg:flex-1 flex flex-col justify-center items-center lg:pl-8 xl:pl-12">
                        <div className="w-full max-w-lg">
                            {/* Mobile Brand Header */}
                            <div className="lg:hidden text-center mb-8">
                            <div className="flex justify-center items-center space-x-3 mb-4">
                                <Package className="h-10 w-10 text-primary" />
                                <h1 className="text-2xl font-bold text-foreground">Invista</h1>
                            </div>                            <h2 className="text-2xl font-bold text-foreground mb-2">
                                Transform Your Supply Chain
                            </h2>
                            <p className="text-muted-foreground">
                                Join hundreds of successful companies
                            </p>
                        </div>

                        {/* Desktop Header */}
                        <div className="hidden lg:block text-left mb-8">
                            <div className="flex items-center space-x-2 mb-4">
                                <Badge variant="secondary" className="text-xs">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Free to start
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                    No credit card required
                                </Badge>
                            </div>                            <h2 className="text-3xl font-bold text-foreground mb-2">
                                Create your account
                            </h2>
                            <p className="text-muted-foreground">
                                Join the platform trusted by supply chain professionals
                            </p>
                        </div>{/* Form */}
                        <Card className="bg-card/80 backdrop-blur-sm shadow-xl border border-border/50">
                            <CardContent className="p-8">
                                <form className="space-y-6" onSubmit={handleSubmit}>
                                    {error && (
                                        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm flex items-start space-x-2">
                                            <div className="w-4 h-4 rounded-full bg-destructive/20 flex-shrink-0 mt-0.5"></div>
                                            <span>{error}</span>
                                        </div>
                                    )}

                                    {message && (
                                        <div className="bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 px-4 py-3 rounded-lg text-sm flex items-start space-x-2">
                                            <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                            <span>{message}</span>
                                        </div>
                                    )}

                                    <div className="space-y-4">
                                        <div>
                                            <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                                                Full Name
                                            </label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                                <input
                                                    id="name"
                                                    name="name"
                                                    type="text"
                                                    autoComplete="name"
                                                    required
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    className="block w-full pl-10 pr-3 py-3 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-foreground transition-all duration-200 hover:border-primary/50"
                                                    placeholder="Enter your full name"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                                                Email address
                                            </label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                                <input
                                                    id="email"
                                                    name="email"
                                                    type="email"
                                                    autoComplete="email"
                                                    required
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    className="block w-full pl-10 pr-3 py-3 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-foreground transition-all duration-200 hover:border-primary/50"
                                                    placeholder="Enter your email"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                                                Password
                                            </label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                                <input
                                                    id="password"
                                                    name="password"
                                                    type={showPassword ? 'text' : 'password'}
                                                    autoComplete="new-password"
                                                    required
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    className="block w-full pl-10 pr-10 py-3 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-foreground transition-all duration-200 hover:border-primary/50"
                                                    placeholder="Create a password"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                                >
                                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                                </button>
                                            </div>
                                            <div className="mt-2 text-xs text-muted-foreground">
                                                Must be at least 6 characters long
                                            </div>
                                        </div>

                                        <div>
                                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-2">
                                                Confirm Password
                                            </label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                                <input
                                                    id="confirmPassword"
                                                    name="confirmPassword"
                                                    type={showConfirmPassword ? 'text' : 'password'}
                                                    autoComplete="new-password"
                                                    required
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    className="block w-full pl-10 pr-10 py-3 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-foreground transition-all duration-200 hover:border-primary/50"
                                                    placeholder="Confirm your password"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                                >
                                                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full bg-primary text-primary-foreground py-3 px-4 rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                                        >
                                            {loading ? (
                                                <div className="flex items-center justify-center space-x-2">
                                                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                                                    <span>Creating account...</span>
                                                </div>
                                            ) : (
                                                'Create account'
                                            )}
                                        </button>

                                        <div className="relative">
                                            <div className="absolute inset-0 flex items-center">
                                                <div className="w-full border-t border-border"></div>
                                            </div>
                                            <div className="relative flex justify-center text-sm">
                                                <span className="bg-card px-3 text-muted-foreground">Or continue with</span>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={handleGoogleSignIn}
                                            disabled={loading}
                                            className="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-border py-3 px-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2 font-medium"
                                        >
                                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                            </svg>
                                            <span>Sign up with Google</span>
                                        </button>

                                        <div className="text-center pt-4">
                                            <p className="text-sm text-muted-foreground">
                                                Already have an account?{' '}
                                                <Link
                                                    href="/auth/login"
                                                    className="font-medium text-primary hover:text-primary/80 transition-colors"
                                                >
                                                    Sign in
                                                </Link>
                                            </p>
                                        </div>

                                        <div className="pt-4 border-t border-border/50">
                                            <p className="text-xs text-muted-foreground text-center">
                                                By creating an account, you agree to our{' '}
                                                <Link href="/terms" className="text-primary hover:text-primary/80">
                                                    Terms of Service
                                                </Link>{' '}
                                                and{' '}
                                                <Link href="/privacy" className="text-primary hover:text-primary/80">
                                                    Privacy Policy
                                                </Link>
                                            </p>
                                        </div>
                                    </div>
                                </form>                            </CardContent>
                        </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

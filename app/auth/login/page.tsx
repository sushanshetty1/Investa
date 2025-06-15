'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Package, Eye, EyeOff, Mail, Lock, TrendingUp, Shield, Users, Star, CheckCircle, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const { login, signInWithGoogle } = useAuth()
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const { error } = await login(email, password)
            if (error) {
                setError(error.message)
            } else {
                router.push('/dashboard')
            }        } catch {
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
            setLoading(false)        }
    }

    return (        <div className="min-h-screen bg-gradient-to-br from-slate-50/90 via-blue-50/40 to-indigo-50/60 dark:from-background dark:via-muted/20 dark:to-chart-3/10 pt-16">            <div className="container mx-auto px-4 py-8 lg:py-12">
                <div className="flex flex-col lg:flex-row lg:items-center gap-8 lg:gap-16 xl:gap-20 min-h-[calc(100vh-8rem)]">
                    {/* Left Side - Marketing Content */}
                    <div className="hidden lg:block lg:flex-1 lg:pr-8 xl:pr-12">
                        <div className="max-w-xl space-y-8">                            {/* Hero Section */}
                            <div className="space-y-6">
                                <h2 className="text-4xl xl:text-5xl font-bold text-foreground leading-tight">
                                    Welcome Back to Your Supply Chain Hub
                                </h2>
                                <p className="text-xl text-muted-foreground leading-relaxed">
                                    Continue managing your inventory with real-time visibility, automated supplier collaboration, and intelligent logistics management.
                                </p>
                            </div>

                            {/* Quick Stats */}
                            <div className="grid grid-cols-1 gap-6">
                                <Card className="p-6 border-0 bg-gradient-to-br from-primary/5 to-primary/10 backdrop-blur-sm">
                                    <div className="flex items-center space-x-4">
                                        <div className="p-3 bg-primary/10 rounded-xl">
                                            <TrendingUp className="h-6 w-6 text-primary" />
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold text-foreground">99.9%</div>
                                            <p className="text-sm text-muted-foreground">System Uptime</p>
                                        </div>
                                    </div>
                                </Card>
                                
                                <Card className="p-6 border-0 bg-gradient-to-br from-green-500/5 to-green-500/10 backdrop-blur-sm">
                                    <div className="flex items-center space-x-4">
                                        <div className="p-3 bg-green-500/10 rounded-xl">
                                            <Shield className="h-6 w-6 text-green-500" />
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold text-foreground">SOC 2</div>
                                            <p className="text-sm text-muted-foreground">Compliant & Secure</p>
                                        </div>
                                    </div>
                                </Card>
                            </div>

                            {/* Features List */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-foreground">Why businesses choose Invista:</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center space-x-3">
                                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                                        <span className="text-muted-foreground">Real-time inventory visibility</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                                        <span className="text-muted-foreground">Automated supplier collaboration</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                                        <span className="text-muted-foreground">Intelligent logistics management</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                                        <span className="text-muted-foreground">AI-powered demand forecasting</span>
                                    </div>
                                </div>
                            </div>

                            {/* Testimonial */}
                            <Card className="p-6 border-0 bg-card/50 backdrop-blur-sm">
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                        ))}
                                    </div>                                    <p className="text-muted-foreground italic">
                                        &quot;Since using Invista, we&apos;ve reduced inventory costs by 30% while improving stock availability. The real-time visibility is game-changing.&quot;
                                    </p>
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white font-semibold">
                                            S
                                        </div>
                                        <div>
                                            <p className="font-medium text-foreground">Sarah Martinez</p>
                                            <p className="text-sm text-muted-foreground">Supply Chain Director, TechCorp</p>
                                        </div>
                                    </div>
                                </div>
                            </Card>                            {/* Recent Activity */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-foreground">Recent Platform Updates:</h3>
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-3 text-sm">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        <span className="text-muted-foreground">Enhanced warehouse analytics dashboard</span>
                                        <Badge variant="secondary" className="text-xs">New</Badge>
                                    </div>
                                    <div className="flex items-center space-x-3 text-sm">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                        <span className="text-muted-foreground">Improved supplier integration APIs</span>
                                    </div>
                                    <div className="flex items-center space-x-3 text-sm">
                                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                        <span className="text-muted-foreground">Advanced demand forecasting tools</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>                    {/* Right Side - Login Form */}
                    <div className="w-full lg:flex-1 flex flex-col justify-center items-center lg:pl-8 xl:pl-12">
                        <div className="w-full max-w-lg">
                            {/* Mobile Brand Header */}
                            <div className="lg:hidden text-center mb-8">
                            <div className="flex justify-center items-center space-x-3 mb-4">
                                <Package className="h-10 w-10 text-primary" />
                                <h1 className="text-2xl font-bold text-foreground">Invista</h1>
                            </div>                            <h2 className="text-2xl font-bold text-foreground mb-2">
                                Welcome Back
                            </h2>
                            <p className="text-muted-foreground">
                                Sign in to continue managing your supply chain
                            </p>
                        </div>

                        {/* Desktop Header */}
                        <div className="hidden lg:block text-left mb-8">                            <div className="flex items-center space-x-2 mb-4">
                                <Badge variant="secondary" className="text-xs">
                                    <Users className="h-3 w-3 mr-1" />
                                    500+ companies
                                </Badge>
                            </div>
                            <h2 className="text-3xl font-bold text-foreground mb-2">
                                Sign in to your account
                            </h2>
                            <p className="text-muted-foreground">
                                Access your supply chain dashboard
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

                                    <div className="space-y-4">
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
                                                    autoComplete="current-password"
                                                    required
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    className="block w-full pl-10 pr-10 py-3 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-foreground transition-all duration-200 hover:border-primary/50"
                                                    placeholder="Enter your password"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                                >
                                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <input
                                                    id="remember-me"
                                                    name="remember-me"
                                                    type="checkbox"
                                                    className="h-4 w-4 text-primary focus:ring-primary border-input rounded"
                                                />
                                                <label htmlFor="remember-me" className="ml-2 block text-sm text-muted-foreground">
                                                    Remember me
                                                </label>
                                            </div>
                                            <div className="text-sm">
                                                <Link
                                                    href="/auth/resetPassword"
                                                    className="font-medium text-primary hover:text-primary/80 transition-colors"
                                                >
                                                    Forgot password?
                                                </Link>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full bg-primary text-primary-foreground py-3 px-4 rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium group"
                                        >
                                            {loading ? (
                                                <div className="flex items-center justify-center space-x-2">
                                                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                                                    <span>Signing in...</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-center space-x-2">
                                                    <span>Sign in</span>
                                                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                                </div>
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
                                            <span>Sign in with Google</span>
                                        </button>

                                        <div className="text-center pt-4">                                            <p className="text-sm text-muted-foreground">
                                                Don&apos;t have an account?{' '}
                                                <Link
                                                    href="/auth/signUp"
                                                    className="font-medium text-primary hover:text-primary/80 transition-colors"
                                                >
                                                    Sign up for free
                                                </Link>
                                            </p>
                                        </div>

                                        {/* Quick Access */}
                                        <div className="pt-4 border-t border-border/50">
                                            <div className="text-center space-y-2">
                                                <p className="text-xs text-muted-foreground">Quick access:</p>
                                                <div className="flex justify-center space-x-4 text-xs">
                                                    <Link href="/demo" className="text-primary hover:text-primary/80">
                                                        Live Demo
                                                    </Link>
                                                    <span className="text-border">•</span>
                                                    <Link href="/help" className="text-primary hover:text-primary/80">
                                                        Help Center
                                                    </Link>
                                                    <span className="text-border">•</span>
                                                    <Link href="/contact" className="text-primary hover:text-primary/80">
                                                        Contact Us
                                                    </Link>
                                                </div>
                                            </div>
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

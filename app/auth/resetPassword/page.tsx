'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Package, Mail, ArrowLeft } from 'lucide-react'

export default function ResetPasswordPage() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')
    const { resetPassword } = useAuth()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        setMessage('')

        try {
            const { error } = await resetPassword(email)
            if (error) {
                setError(error.message)
            } else {
                setMessage('Password reset email sent! Please check your inbox.')
            }
        } catch (err) {
            setError('An unexpected error occurred')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50/90 via-blue-50/40 to-indigo-50/60 dark:from-background dark:via-muted/20 dark:to-chart-3/10 flex items-center justify-center px-4">
            <div className="max-w-md w-full space-y-8">
                {/* Header */}
                <div className="text-center">
                    <div className="flex justify-center">
                        <Package className="h-12 w-12 text-primary" />
                    </div>
                    <h2 className="mt-6 text-3xl font-bold text-foreground">
                        Reset your password
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Enter your email address and we'll send you a link to reset your password
                    </p>
                </div>

                {/* Form */}
                <div className="bg-card/80 backdrop-blur-sm rounded-lg shadow-lg border border-border p-8">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        {message && (
                            <div className="bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 px-4 py-3 rounded-lg text-sm">
                                {message}
                            </div>
                        )}

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
                                    className="block w-full pl-10 pr-3 py-2 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-foreground"
                                    placeholder="Enter your email"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? 'Sending...' : 'Send reset email'}
                        </button>

                        <div className="text-center">
                            <Link
                                href="/auth/login"
                                className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to sign in
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

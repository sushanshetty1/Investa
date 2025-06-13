'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import { Package, Trash2, AlertTriangle, ArrowLeft } from 'lucide-react'

export default function DeleteAccountPage() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [confirmText, setConfirmText] = useState('')
    const { deleteAccount, user } = useAuth()
    const router = useRouter()

    const handleDeleteAccount = async () => {
        if (confirmText !== 'DELETE') {
            setError('Please type "DELETE" to confirm account deletion')
            return
        }

        setLoading(true)
        setError('')

        try {
            // First delete user data from the User table
            if (supabase && user) {
                const { error: dbError } = await supabase
                    .from('User')
                    .delete()
                    .eq('id', user.id)

                if (dbError) {
                    console.error('Error deleting user data:', dbError)
                }
            }

            // Then delete the auth user
            const { error } = await deleteAccount()
            if (error) {
                setError(error.message)
            } else {
                router.push('/')
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
                        Delete Account
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        This action cannot be undone
                    </p>
                </div>

                {/* Warning */}
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                    <div className="flex items-start">
                        <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 mr-3 flex-shrink-0" />
                        <div>
                            <h3 className="text-sm font-medium text-destructive">Warning</h3>
                            <p className="text-sm text-destructive/80 mt-1">
                                Deleting your account will permanently remove all your data, including:
                            </p>
                            <ul className="list-disc list-inside text-sm text-destructive/80 mt-2 space-y-1">
                                <li>Your profile information</li>
                                <li>All inventory data</li>
                                <li>Product and supplier records</li>
                                <li>Transaction history</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <div className="bg-card/80 backdrop-blur-sm rounded-lg shadow-lg border border-border p-8">
                    <div className="space-y-6">
                        {error && (
                            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <div>
                            <label htmlFor="confirm" className="block text-sm font-medium text-foreground mb-2">
                                Type "DELETE" to confirm
                            </label>
                            <input
                                id="confirm"
                                name="confirm"
                                type="text"
                                required
                                value={confirmText}
                                onChange={(e) => setConfirmText(e.target.value)}
                                className="block w-full px-3 py-2 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-destructive focus:border-transparent text-foreground"
                                placeholder="Type DELETE to confirm"
                            />
                        </div>

                        <button
                            onClick={handleDeleteAccount}
                            disabled={loading || confirmText !== 'DELETE'}
                            className="w-full bg-destructive text-destructive-foreground py-2 px-4 rounded-lg hover:bg-destructive/90 focus:outline-none focus:ring-2 focus:ring-destructive focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {loading ? 'Deleting account...' : 'Delete account permanently'}
                        </button>
                        <div className="text-center">
                            <Link
                                href="/auth/login"
                                className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Cancel and go back
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

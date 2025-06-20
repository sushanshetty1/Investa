'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function AuthCallback() {
    const router = useRouter()

    useEffect(() => {
        const handleAuthCallback = async () => {
            const { data, error } = await supabase.auth.getSession()

            if (error) {
                console.error('Auth callback error:', error)
                router.push('/auth/login?error=auth_failed')
                return
            }

            if (data.session?.user) {
                const user = data.session.user                // Check if user already exists in our users table
                const { data: existingUser } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', user.id)
                    .single()

                // If user doesn't exist, create profile
                if (!existingUser) {
                    const { error: dbError } = await supabase
                        .from('users')
                        .insert({
                            id: user.id,
                            email: user.email,
                            firstName: user.user_metadata?.full_name?.split(' ')[0] || null,
                            lastName: user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || null,
                            displayName: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
                            avatar: user.user_metadata?.avatar_url || null,
                            isActive: true,
                            isVerified: true,
                            emailVerified: user.email_confirmed_at ? true : false,
                        })

                    if (dbError) {
                        console.error('Error creating user profile:', dbError)
                    }
                }

                // Redirect to dashboard
                router.push('/auth/redirect')
            } else {
                router.push('/auth/login')
            }
        }

        handleAuthCallback()
    }, [router])

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50/90 via-blue-50/40 to-indigo-50/60 dark:from-background dark:via-muted/20 dark:to-chart-3/10 flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Completing sign in...</p>
            </div>
        </div>
    )
}

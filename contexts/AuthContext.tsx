'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

type AuthContextType = {
    user: any
    loading: boolean
    userType: 'company' | 'individual' | null
    hasCompanyAccess: boolean
    signUp: (email: string, password: string) => Promise<any>
    login: (email: string, password: string) => Promise<any>
    signInWithGoogle: () => Promise<any>
    logout: () => Promise<void>
    resetPassword: (email: string) => Promise<any>
    deleteAccount: () => Promise<any>
    checkUserAccess: (retryCount?: number) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [userType, setUserType] = useState<'company' | 'individual' | null>(null)
    const [hasCompanyAccess, setHasCompanyAccess] = useState(false)
    const router = useRouter()

    const checkUserAccess = async (retryCount = 0) => {
        if (!user?.email || !user?.id) {
            setUserType(null);
            setHasCompanyAccess(false);
            return;
        }

        try {
            // Check if user is a company user/owner via company_users table using Supabase Auth user ID
            const { data: companyUserData, error: companyUserError } = await supabase
                .from('company_users')
                .select('id, role, isOwner, isActive, companyId, userId')
                .eq('userId', user.id)
                .eq('isActive', true);

            if (companyUserData && companyUserData.length > 0) {
                setUserType('company');
                setHasCompanyAccess(true);
                return;
            }

            // Find user records in users table by email to get internal user IDs
            const { data: userRecords, error: userError } = await supabase
                .from('users')
                .select('id, email')
                .eq('email', user.email);

            // Check company_users table with internal user IDs
            if (userRecords && userRecords.length > 0) {
                for (const userRecord of userRecords) {
                    const { data: companyUserByInternalId, error: companyUserByInternalIdError } = await supabase
                        .from('company_users')
                        .select('id, role, isOwner, isActive, companyId, userId')
                        .eq('userId', userRecord.id)
                        .eq('isActive', true);

                    if (companyUserByInternalId && companyUserByInternalId.length > 0) {
                        setUserType('company');
                        setHasCompanyAccess(true);
                        return;
                    }
                }
            }

            // Check if user created a company directly (using Auth user ID)
            const { data: companyData, error: companyError } = await supabase
                .from('companies')
                .select('id, name, createdBy')
                .eq('createdBy', user.id)
                .eq('isActive', true);

            if (companyData && companyData.length > 0) {
                setUserType('company');
                setHasCompanyAccess(true);
                return;
            }

            // Check company ownership with internal user IDs
            if (userRecords && userRecords.length > 0) {
                for (const userRecord of userRecords) {
                    const { data: companyByInternalId, error: companyByInternalIdError } = await supabase
                        .from('companies')
                        .select('id, name, createdBy')
                        .eq('createdBy', userRecord.id)
                        .eq('isActive', true);

                    if (companyByInternalId && companyByInternalId.length > 0) {
                        setUserType('company');
                        setHasCompanyAccess(true);
                        return;
                    }
                }
            }

            // Check recent company creation (within last 5 minutes)
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
            
            // Check with Auth user ID
            const { data: recentCompanyByAuth, error: recentCompanyByAuthError } = await supabase
                .from('companies')
                .select('id, name, createdAt, createdBy')
                .eq('createdBy', user.id)
                .eq('isActive', true)
                .gte('createdAt', fiveMinutesAgo);

            if (recentCompanyByAuth && recentCompanyByAuth.length > 0) {
                setUserType('company');
                setHasCompanyAccess(true);
                return;
            }

            // Check with internal user IDs
            if (userRecords && userRecords.length > 0) {
                for (const userRecord of userRecords) {
                    const { data: recentCompanyByInternal, error: recentCompanyByInternalError } = await supabase
                        .from('companies')
                        .select('id, name, createdAt, createdBy')
                        .eq('createdBy', userRecord.id)
                        .eq('isActive', true)
                        .gte('createdAt', fiveMinutesAgo);

                    if (recentCompanyByInternal && recentCompanyByInternal.length > 0) {
                        setUserType('company');
                        setHasCompanyAccess(true);
                        return;
                    }
                }
            }

            // Check if user has accepted company invitations
            const { data: inviteData, error: inviteError } = await supabase
                .from('user_invitations')
                .select('id, status, email')
                .eq('email', user.email)
                .eq('status', 'ACCEPTED');

            if (inviteData && inviteData.length > 0) {
                setUserType('individual');
                setHasCompanyAccess(true);
                return;
            }

            // If we reach here, no company access was found
            setUserType('individual');
            setHasCompanyAccess(false);
            
            // Retry logic for newly created companies (max 3 retries with increasing delays)
            if (retryCount < 3) {
                const delay = (retryCount + 1) * 1000; // 1s, 2s, 3s delays
                setTimeout(() => {
                    checkUserAccess(retryCount + 1);
                }, delay);
            }        } catch (error) {
            setUserType('individual')
            setHasCompanyAccess(false)
            
            // Retry on error (max 3 retries)
            if (retryCount < 3) {
                const delay = (retryCount + 1) * 1000;
                setTimeout(() => {
                    checkUserAccess(retryCount + 1);
                }, delay);
            }
        }
    }

    useEffect(() => {
        let isMounted = true;
        
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (isMounted) {
                setUser(session?.user ?? null)
                if (session?.user) {
                    await checkUserAccess()
                }
                setLoading(false)
            }
        }

        getSession()

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (!isMounted) return;
            
            setUser(session?.user ?? null)
            
            if (event === 'SIGNED_IN' && session?.user) {
                // Handle Google sign-in user creation
                const { data: existingUser } = await supabase
                    .from('users')
                    .select('id')
                    .eq('id', session.user.id)
                    .single()

                if (!existingUser && isMounted) {
                    // Create user record for Google sign-in
                    const fullName = session.user.user_metadata?.full_name || ''
                    const [firstName = '', lastName = ''] = fullName.split(' ')
                    
                    await supabase
                        .from('users')
                        .insert({
                            id: session.user.id,
                            email: session.user.email || '',
                            firstName: firstName || null,
                            lastName: lastName || null,
                            displayName: fullName || null,
                            avatar: session.user.user_metadata?.avatar_url || null,
                            phone: session.user.user_metadata?.phone || null,
                            timezone: 'UTC',
                            language: 'en',
                            theme: 'system',
                            isActive: true,
                            isVerified: true,
                            emailVerified: session.user.email_confirmed_at ? true : false,
                            twoFactorEnabled: false,
                            failedLoginCount: 0,
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString()
                        })
                }
                
                // Check user access after sign in
                if (isMounted) {
                    await checkUserAccess()
                }
            } else if (event === 'SIGNED_OUT') {
                if (isMounted) {
                    setUserType(null)
                    setHasCompanyAccess(false)
                }
            }
        })

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        }
    }, []) // Remove user.id dependency to prevent infinite loops

    const signUp = async (email: string, password: string) => {
        return await supabase.auth.signUp({ email, password })
    }

    const login = async (email: string, password: string) => {
        return await supabase.auth.signInWithPassword({ email, password })
    }

    const signInWithGoogle = async () => {
        return await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`
            }
        })
    }

    const logout = async () => {
        await supabase.auth.signOut()
        router.push('/')
    }

    const resetPassword = async (email: string) => {
        return await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${location.origin}/auth/reset-password`,
        })
    }

    const deleteAccount = async () => {
        const {
            data: { user },
            error,
        } = await supabase.auth.getUser()

        if (user) {
            return await supabase.rpc('delete_user', { uid: user.id })
        }

        return { error: { message: 'No user found' } }
    }

    return (
        <AuthContext.Provider value={{ 
            user, 
            loading, 
            userType, 
            hasCompanyAccess,
            signUp, 
            login, 
            signInWithGoogle, 
            logout, 
            resetPassword, 
            deleteAccount,
            checkUserAccess
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) throw new Error('useAuth must be used within AuthProvider')
    return context
}

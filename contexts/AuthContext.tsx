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
            console.log('checkUserAccess: No user or email');
            setUserType(null);
            setHasCompanyAccess(false);
            return;
        }

        console.log('checkUserAccess: Checking access for user:', user.email, 'retry:', retryCount);
        
        try {
            console.log('Checking user access for userId:', user.id, 'email:', user.email);
            
            // First, check if user is a company user/owner via company_users table using user ID
            const { data: companyUserData, error: companyUserError } = await supabase
                .from('company_users')
                .select('id, role, isOwner, isActive, companyId')
                .eq('userId', user.id)
                .eq('isActive', true);

            console.log('Company user query by ID result:', {
                data: companyUserData,
                error: companyUserError,
                count: companyUserData?.length || 0
            });            // If we found company user data, user has company access
            if (companyUserData && companyUserData.length > 0) {
                console.log('✅ User has company access via company_users table (by ID)');
                setUserType('company');
                setHasCompanyAccess(true);
                return;
            }

            // Also check for very recent company creation using direct company ownership
            const { data: recentCompanyData, error: recentCompanyError } = await supabase
                .from('companies')
                .select('id, name, createdAt')
                .eq('createdBy', user.id)
                .eq('isActive', true)
                .gte('createdAt', new Date(Date.now() - 5 * 60 * 1000).toISOString()); // Created in last 5 minutes

            console.log('Recent company creation check:', {
                data: recentCompanyData,
                error: recentCompanyError,
                count: recentCompanyData?.length || 0
            });

            if (recentCompanyData && recentCompanyData.length > 0) {
                console.log('✅ User has company access as recent company creator');
                setUserType('company');
                setHasCompanyAccess(true);
                return;
            }

            // If no match by user ID, try to find the correct user record by email
            console.log('No match by user ID, checking users table by email...');
            const { data: userRecords, error: userError } = await supabase
                .from('users')
                .select('id, email')
                .eq('email', user.email);

            console.log('User records by email:', {
                data: userRecords,
                error: userError,
                count: userRecords?.length || 0
            });

            // If we found user records, try to find company access using those IDs
            if (userRecords && userRecords.length > 0) {
                for (const userRecord of userRecords) {
                    console.log('Checking company access for user record:', userRecord.id);
                    
                    const { data: companyUserByEmail, error: companyUserByEmailError } = await supabase
                        .from('company_users')
                        .select('id, role, isOwner, isActive, companyId')
                        .eq('userId', userRecord.id)
                        .eq('isActive', true);

                    console.log('Company user query by email-found ID result:', {
                        userId: userRecord.id,
                        data: companyUserByEmail,
                        error: companyUserByEmailError,
                        count: companyUserByEmail?.length || 0
                    });

                    if (companyUserByEmail && companyUserByEmail.length > 0) {
                        console.log('✅ User has company access via company_users table (by email lookup)');
                        setUserType('company');
                        setHasCompanyAccess(true);
                        return;
                    }
                }
            }

            // If no company_users record, check if user created a company directly
            const { data: companyData, error: companyError } = await supabase
                .from('companies')
                .select('id, name')
                .eq('createdBy', user.id)
                .eq('isActive', true);

            console.log('Company owner query result:', {
                data: companyData,
                error: companyError,
                count: companyData?.length || 0
            });

            if (companyData && companyData.length > 0) {
                console.log('✅ User has company access as company owner');
                setUserType('company');
                setHasCompanyAccess(true);
                return;
            }

            // Also check by email for company ownership
            if (userRecords && userRecords.length > 0) {
                for (const userRecord of userRecords) {
                    const { data: companyByEmail, error: companyByEmailError } = await supabase
                        .from('companies')
                        .select('id, name')
                        .eq('createdBy', userRecord.id)
                        .eq('isActive', true);

                    if (companyByEmail && companyByEmail.length > 0) {
                        console.log('✅ User has company access as company owner (by email lookup)');
                        setUserType('company');
                        setHasCompanyAccess(true);
                        return;
                    }
                }
            }

            // Check if user has accepted company invitations
            const { data: inviteData, error: inviteError } = await supabase
                .from('user_invitations')
                .select('id, status')
                .eq('email', user.email)
                .eq('status', 'ACCEPTED');

            console.log('Invite query result:', {
                data: inviteData,
                error: inviteError,
                count: inviteData?.length || 0
            });            if (inviteData && inviteData.length > 0) {
                console.log('✅ User has company access via accepted invitations');
                setUserType('individual');
                setHasCompanyAccess(true);
            } else {
                console.log('❌ User has no company access - retry:', retryCount);
                setUserType('individual');
                setHasCompanyAccess(false);
                
                // Retry logic for newly created companies (max 3 retries with increasing delays)
                if (retryCount < 3) {
                    const delay = (retryCount + 1) * 1000; // 1s, 2s, 3s delays
                    console.log(`Retrying checkUserAccess in ${delay}ms...`);
                    setTimeout(() => {
                        checkUserAccess(retryCount + 1);
                    }, delay);
                }
            }        } catch (error) {
            console.error('Error checking user access:', error)
            setUserType('individual')
            setHasCompanyAccess(false)
            
            // Retry on error (max 3 retries)
            if (retryCount < 3) {
                const delay = (retryCount + 1) * 1000;
                console.log(`Retrying checkUserAccess after error in ${delay}ms...`);
                setTimeout(() => {
                    checkUserAccess(retryCount + 1);
                }, delay);
            }
        }
    }

    useEffect(() => {
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            setUser(session?.user ?? null)
            if (session?.user) {
                await checkUserAccess()
            }
            setLoading(false)
        }

        getSession()

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('Auth state change:', event, session?.user?.email);
            setUser(session?.user ?? null)
            
            if (event === 'SIGNED_IN' && session?.user) {
                // Handle Google sign-in user creation
                const { data: existingUser } = await supabase
                    .from('users')
                    .select('id')
                    .eq('id', session.user.id)
                    .single()

                if (!existingUser) {
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
                await checkUserAccess()
            } else if (event === 'SIGNED_OUT') {
                setUserType(null)
                setHasCompanyAccess(false)
            }
        })

        return () => subscription.unsubscribe()
    }, [user?.id]) // Add user.id as dependency to re-check when user changes

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
        }        return { error: { message: 'No user found' } }
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

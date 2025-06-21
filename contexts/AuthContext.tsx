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
        
        // First check if user previously had access (permanent flag)
        if (typeof window !== 'undefined') {
            const hasBeenGrantedAccess = localStorage.getItem(`invista_has_access_${user.id}`) === 'true';
            if (hasBeenGrantedAccess) {
                console.log('AuthContext - User previously had access, setting hasCompanyAccess to true');
                setUserType('company');
                setHasCompanyAccess(true);
                return;
            }
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
                
                // Set permanent access flag in localStorage
                if (typeof window !== 'undefined') {
                    localStorage.setItem(`invista_has_access_${user.id}`, 'true');
                }
                
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
                        .eq('isActive', true);                    if (companyUserByInternalId && companyUserByInternalId.length > 0) {
                        setUserType('company');
                        setHasCompanyAccess(true);
                        
                        // Set permanent access flag in localStorage
                        if (typeof window !== 'undefined') {
                            localStorage.setItem(`invista_has_access_${user.id}`, 'true');
                        }
                        
                        return;
                    }
                }
            }

            // Check if user created a company directly (using Auth user ID)
            const { data: companyData, error: companyError } = await supabase
                .from('companies')
                .select('id, name, createdBy')
                .eq('createdBy', user.id)
                .eq('isActive', true);            if (companyData && companyData.length > 0) {
                setUserType('company');
                setHasCompanyAccess(true);
                
                // Set permanent access flag in localStorage
                if (typeof window !== 'undefined') {
                    localStorage.setItem(`invista_has_access_${user.id}`, 'true');
                }
                
                return;
            }

            // Check company ownership with internal user IDs
            if (userRecords && userRecords.length > 0) {
                for (const userRecord of userRecords) {
                    const { data: companyByInternalId, error: companyByInternalIdError } = await supabase
                        .from('companies')
                        .select('id, name, createdBy')
                        .eq('createdBy', userRecord.id)
                        .eq('isActive', true);                    if (companyByInternalId && companyByInternalId.length > 0) {
                        setUserType('company');
                        setHasCompanyAccess(true);
                        
                        // Set permanent access flag in localStorage
                        if (typeof window !== 'undefined') {
                            localStorage.setItem(`invista_has_access_${user.id}`, 'true');
                        }
                        
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
                .gte('createdAt', fiveMinutesAgo);            if (recentCompanyByAuth && recentCompanyByAuth.length > 0) {
                setUserType('company');
                setHasCompanyAccess(true);
                
                // Set permanent access flag in localStorage
                if (typeof window !== 'undefined') {
                    localStorage.setItem(`invista_has_access_${user.id}`, 'true');
                }
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
                        .gte('createdAt', fiveMinutesAgo);                    if (recentCompanyByInternal && recentCompanyByInternal.length > 0) {
                        setUserType('company');
                        setHasCompanyAccess(true);
                        
                        // Set permanent access flag in localStorage
                        if (typeof window !== 'undefined') {
                            localStorage.setItem(`invista_has_access_${user.id}`, 'true');
                        }
                        
                        return;
                    }
                }
            }

            // Check if user has accepted company invitations
            const { data: inviteData, error: inviteError } = await supabase
                .from('user_invitations')
                .select('id, status, email')
                .eq('email', user.email)
                .eq('status', 'ACCEPTED');            if (inviteData && inviteData.length > 0) {
                setUserType('individual');
                setHasCompanyAccess(true);
                
                // Set permanent access flag in localStorage
                if (typeof window !== 'undefined') {
                    localStorage.setItem(`invista_has_access_${user.id}`, 'true');
                }
                
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
                    checkUserAccess(retryCount + 1);                }, delay);
            }
        }
    }
    
    useEffect(() => {
        let isMounted = true;
        let subscription: { unsubscribe: () => void } | undefined;
        
        const initializeAuth = async () => {
            try {
                console.log('AuthContext - Initializing auth state');
                
                // First, get the current session
                const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
                const currentSession = sessionData?.session;
                
                if (sessionError) {
                    console.error('AuthContext - Error getting session:', sessionError);
                }
                
                if (isMounted) {
                    if (currentSession?.user) {
                        console.log('AuthContext - Session found:', currentSession.user.email);
                        setUser(currentSession.user);
                        
                        // Wait for user access check to complete
                        try {
                            await checkUserAccess();
                        } catch (accessError) {
                            console.error('AuthContext - Error checking user access:', accessError);
                            // Don't fail initialization if access check fails
                        }
                    } else {
                        console.log('AuthContext - No session found');
                        setUser(null);
                        setUserType(null);
                        setHasCompanyAccess(false);
                    }
                    
                    // Only set loading to false after we've fully initialized
                    if (isMounted) {
                        setLoading(false);
                    }
                }
                
                // Set up the auth state change listener
                const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
                    if (!isMounted) return;
                    
                    console.log('AuthContext - Auth state change:', event);
                    
                    if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {                    if (session?.user) {
                            console.log('AuthContext - User signed in or token refreshed:', session.user.email);
                            setUser(session.user);
                            
                            // Check for invite acceptance flag and force check user access if found
                            if (typeof window !== 'undefined') {
                                const inviteAccepted = localStorage.getItem('invista_invite_accepted') === 'true';
                                const inviteAcceptedTime = parseInt(localStorage.getItem('invista_invite_accepted_time') || '0', 10);
                                const oneHourMs = 60 * 60 * 1000;
                                
                                if (inviteAccepted && (Date.now() - inviteAcceptedTime < oneHourMs)) {
                                    console.log('AuthContext - Found invite acceptance flag, forcing access check');
                                    await checkUserAccess(0);
                                }
                            }
                            
                            // Handle Google sign-in user creation
                            const { data: existingUser } = await supabase
                                .from('users')
                                .select('id')
                                .eq('id', session.user.id)
                                .single();

                            if (!existingUser && isMounted) {
                                // Create user record for Google sign-in
                                const fullName = session.user.user_metadata?.full_name || '';
                                const [firstName = '', lastName = ''] = fullName.split(' ');
                                
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
                                    });
                            }
                            
                            // Check user access after sign in
                            if (isMounted) {
                                await checkUserAccess();
                            }
                        }
                    } else if (event === 'SIGNED_OUT') {
                        console.log('AuthContext - User signed out or deleted');
                        if (isMounted) {
                            setUser(null);
                            setUserType(null);
                            setHasCompanyAccess(false);
                        }
                    }
                });
                
                subscription = data.subscription;
            } catch (error) {
                console.error('Error initializing auth:', error);
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        initializeAuth();

        return () => {
            isMounted = false;
            if (subscription) {
                subscription.unsubscribe();
            }
        };
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

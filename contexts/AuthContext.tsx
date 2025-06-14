'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

type AuthContextType = {
    user: any
    loading: boolean
    signUp: (email: string, password: string) => Promise<any>
    login: (email: string, password: string) => Promise<any>
    signInWithGoogle: () => Promise<any>
    logout: () => Promise<void>
    resetPassword: (email: string) => Promise<any>
    deleteAccount: () => Promise<any>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            setUser(session?.user ?? null)
            setLoading(false)
        }

        getSession()

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
        })

        return () => subscription.unsubscribe()
    }, [])

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
        <AuthContext.Provider value={{ user, loading, signUp, login, signInWithGoogle, logout, resetPassword, deleteAccount }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) throw new Error('useAuth must be used within AuthProvider')
    return context
}

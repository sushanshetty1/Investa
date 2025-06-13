// app/auth/page.tsx
'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function AuthPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [name, setName] = useState('')
    const [isSignup, setIsSignup] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()

    const handleAuth = async () => {
        setError('')
        if (!email || !password || (isSignup && !name)) {
            return setError('Please fill in all fields')
        }

        if (isSignup) {
            const { data, error: signupError } = await supabase.auth.signUp({
                email,
                password,
            })

            if (signupError) return setError(signupError.message)

            const user = data.user
            if (user) {
                await supabase.from('profiles').insert([{ id: user.id, name }])
                router.push('/')
            }
        } else {
            const { error: loginError } = await supabase.auth.signInWithPassword({
                email,
                password,
            })
            if (loginError) return setError(loginError.message)
            router.push('/')
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
            <div className="bg-gray-800 p-8 rounded-lg w-96 space-y-4 shadow-lg">
                <h1 className="text-2xl font-bold text-center">
                    {isSignup ? 'Create an account' : 'Login'}
                </h1>

                {isSignup && (
                    <input
                        type="text"
                        placeholder="Name"
                        className="w-full p-2 rounded bg-gray-700 focus:outline-none"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                )}

                <input
                    type="email"
                    placeholder="Email"
                    className="w-full p-2 rounded bg-gray-700 focus:outline-none"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    className="w-full p-2 rounded bg-gray-700 focus:outline-none"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                {error && <p className="text-red-400 text-sm">{error}</p>}

                <button
                    className="w-full bg-green-500 hover:bg-green-600 p-2 rounded font-semibold"
                    onClick={handleAuth}
                >
                    {isSignup ? 'Sign Up' : 'Login'}
                </button>

                <p
                    className="text-center text-sm cursor-pointer text-gray-300 hover:text-white"
                    onClick={() => setIsSignup(!isSignup)}
                >
                    {isSignup ? 'Already have an account? Login' : "Don't have an account? Sign up"}
                </p>
            </div>
        </div>
    )
}

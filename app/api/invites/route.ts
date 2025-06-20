import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'
import { z } from 'zod'

// Validation schema for invite request
const inviteSchema = z.object({
    email: z.string().email('Invalid email address'),
    message: z.string().optional(),
    roleId: z.string().optional(),
})

export async function POST(request: NextRequest) {
    try {
        // Get the authorization header
        const authHeader = request.headers.get('authorization')
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { error: 'Missing or invalid authorization header' },
                { status: 401 }
            )
        }        const authToken = authHeader.split(' ')[1]

        // Verify the user token
        const { data: { user }, error: authError } = await supabase.auth.getUser(authToken)
        if (authError || !user) {
            return NextResponse.json(
                { error: 'Invalid or expired token' },
                { status: 401 }
            )
        }

        // Parse and validate request body
        const body = await request.json()
        const validation = inviteSchema.safeParse(body)
        
        if (!validation.success) {
            return NextResponse.json(
                { error: 'Invalid request data', details: validation.error.errors },
                { status: 400 }
            )
        }

        const { email, message, roleId } = validation.data

        // Get inviter profile
        const { data: inviterProfile, error: profileError } = await supabase
            .from('users')
            .select('firstName, lastName, displayName, email')
            .eq('id', user.id)
            .single()

        if (profileError) {
            return NextResponse.json(
                { error: 'Failed to fetch inviter profile' },
                { status: 500 }
            )
        }

        // Check if user already exists
        const { data: existingUser, error: userCheckError } = await supabase
            .from('users')
            .select('id')
            .eq('email', email.toLowerCase())
            .maybeSingle()

        if (userCheckError) {
            return NextResponse.json(
                { error: 'Failed to check existing users' },
                { status: 500 }
            )
        }

        if (existingUser) {
            return NextResponse.json(
                { error: 'A user with this email already exists' },
                { status: 409 }
            )
        }

        // Check for existing active invitations
        const { data: existingInvite, error: inviteCheckError } = await supabase
            .from('user_invitations')
            .select('id, status, expiresAt')
            .eq('email', email.toLowerCase())
            .in('status', ['PENDING', 'SENT'])
            .maybeSingle()

        if (inviteCheckError) {
            return NextResponse.json(
                { error: 'Failed to check existing invitations' },
                { status: 500 }
            )
        }

        if (existingInvite) {
            const isExpired = new Date(existingInvite.expiresAt) <= new Date()
            if (!isExpired) {
                return NextResponse.json(
                    { error: 'A pending invitation already exists for this email' },
                    { status: 409 }
                )
            }
        }        // Generate invitation
        const inviteToken = crypto.randomUUID() + '-' + Date.now()
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        
        const inviterName = inviterProfile.displayName || 
                          (inviterProfile.firstName && inviterProfile.lastName 
                              ? `${inviterProfile.firstName} ${inviterProfile.lastName}` 
                              : null) ||
                          inviterProfile.email ||
                          'Someone'

        const { data: invitation, error: insertError } = await supabase
            .from('user_invitations')            .insert({
                email: email.toLowerCase(),
                roleId: roleId || null,
                token: inviteToken,
                invitedById: user.id,
                invitedByName: inviterName,
                message: message?.trim() || null,
                status: 'PENDING',
                expiresAt: expiresAt.toISOString(),
                sentAt: new Date().toISOString()
            })
            .select()
            .single()

        if (insertError) {
            console.error('Failed to create invitation:', insertError)
            return NextResponse.json(
                { error: 'Failed to create invitation' },
                { status: 500 }
            )
        }

        // TODO: Send email notification here
        // You would integrate with your email service (SendGrid, Resend, etc.)

        return NextResponse.json({
            success: true,
            message: 'Invitation sent successfully',
            invitation: {
                id: invitation.id,
                email: invitation.email,
                status: invitation.status,
                expiresAt: invitation.expiresAt
            }
        })

    } catch (error) {
        console.error('Invite API error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// Get invitations sent by the current user
export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization')
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { error: 'Missing or invalid authorization header' },
                { status: 401 }
            )
        }        const authToken = authHeader.split(' ')[1]

        const { data: { user }, error: authError } = await supabase.auth.getUser(authToken)
        if (authError || !user) {
            return NextResponse.json(
                { error: 'Invalid or expired token' },
                { status: 401 }
            )
        }

        const { data: invitations, error } = await supabase
            .from('user_invitations')
            .select('*')
            .eq('invitedById', user.id)
            .order('createdAt', { ascending: false })

        if (error) {
            return NextResponse.json(
                { error: 'Failed to fetch invitations' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            invitations
        })

    } catch (error) {
        console.error('Get invitations error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

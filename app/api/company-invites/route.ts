import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

// GET - Get company invites for a user by email
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const companyId = searchParams.get('companyId');
    const userId = searchParams.get('userId');

    if (email) {
      // Get invites for a specific email (for waiting page)
      const { data, error } = await supabase
        .from('company_invites')
        .select(`
          id,
          companyId,
          email,
          role,
          status,
          invitedByName,
          message,
          expiresAt,
          createdAt,
          company:companies(name, displayName, logo)
        `)
        .eq('email', email)
        .order('createdAt', { ascending: false });

      if (error) throw error;

      return NextResponse.json({ invites: data || [] });
    } else if (companyId && userId) {
      // Get invites for a specific company (for company profile)
      // First verify user has access to this company
      const { data: companyUser, error: authError } = await supabase
        .from('company_users')
        .select('role, isOwner')
        .eq('companyId', companyId)
        .eq('userId', userId)
        .single();

      if (authError || (!companyUser?.isOwner && companyUser?.role !== 'ADMIN')) {
        return NextResponse.json(
          { error: 'Unauthorized to view company invites' },
          { status: 403 }
        );
      }

      const { data, error } = await supabase
        .from('company_invites')
        .select('*')
        .eq('companyId', companyId)
        .order('createdAt', { ascending: false });

      if (error) throw error;

      return NextResponse.json({ invites: data || [] });
    } else {
      return NextResponse.json(
        { error: 'Email or companyId+userId parameters are required' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error fetching company invites:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invites' },
      { status: 500 }
    );
  }
}

// POST - Create new company invites
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyId, emails, role, invitedById, invitedByName, message } = body;

    if (!companyId || !emails || !role || !invitedById) {
      return NextResponse.json(
        { error: 'Missing required fields: companyId, emails, role, invitedById' },
        { status: 400 }
      );
    }

    // Validate that the user is authorized to invite (company owner or admin)
    const { data: companyUser, error: authError } = await supabase
      .from('company_users')
      .select('role, isOwner')
      .eq('companyId', companyId)
      .eq('userId', invitedById)
      .single();

    if (authError || (!companyUser?.isOwner && companyUser?.role !== 'ADMIN')) {
      return NextResponse.json(
        { error: 'Unauthorized to send invites' },
        { status: 403 }
      );
    }

    // Parse emails (comma-separated or array)
    const emailList = Array.isArray(emails) 
      ? emails 
      : emails.split(',').map((email: string) => email.trim()).filter((email: string) => email);

    if (emailList.length === 0) {
      return NextResponse.json(
        { error: 'No valid emails provided' },
        { status: 400 }
      );
    }

    // Check for existing invites or users
    const { data: existingInvites } = await supabase
      .from('company_invites')
      .select('email')
      .eq('companyId', companyId)
      .in('email', emailList);

    const { data: existingUsers } = await supabase
      .from('company_users')
      .select(`
        userId,
        user:users!inner(email)
      `)
      .eq('companyId', companyId);

    const existingEmails = new Set([
      ...(existingInvites || []).map(invite => invite.email),
      ...(existingUsers || []).map((user: any) => user.user.email)
    ]);

    const newEmails = emailList.filter((email: string) => !existingEmails.has(email));

    if (newEmails.length === 0) {
      return NextResponse.json(
        { error: 'All emails are already invited or are existing users' },
        { status: 400 }
      );
    }

    // Create invitations
    const invitations = newEmails.map((email: string) => ({
      id: uuidv4(),
      companyId,
      email,
      role,
      invitedById,
      invitedByName,
      message,
      status: 'PENDING',
      token: uuidv4(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));

    const { data, error } = await supabase
      .from('company_invites')
      .insert(invitations)
      .select();

    if (error) throw error;

    // TODO: Send email notifications here

    return NextResponse.json({ 
      invites: data,
      message: `Successfully sent ${newEmails.length} invitation(s)`,
      skipped: emailList.length - newEmails.length
    });
  } catch (error) {
    console.error('Error creating company invites:', error);
    return NextResponse.json(
      { error: 'Failed to create invites' },
      { status: 500 }
    );
  }
}

// PUT - Update invite status (accept/decline)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { inviteId, status, userId } = body;

    if (!inviteId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: inviteId, status' },
        { status: 400 }
      );
    }

    if (!['ACCEPTED', 'DECLINED'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be ACCEPTED or DECLINED' },
        { status: 400 }
      );
    }

    // Get the invite
    const { data: invite, error: inviteError } = await supabase
      .from('company_invites')
      .select('*')
      .eq('id', inviteId)
      .single();

    if (inviteError || !invite) {
      return NextResponse.json(
        { error: 'Invite not found' },
        { status: 404 }
      );
    }

    // Check if invite is expired
    if (new Date() > new Date(invite.expiresAt)) {
      return NextResponse.json(
        { error: 'Invite has expired' },
        { status: 400 }
      );
    }

    // Check if invite is already processed
    if (invite.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Invite has already been processed' },
        { status: 400 }
      );
    }

    // Update invite status
    const updateData: any = {
      status,
      updatedAt: new Date().toISOString()
    };

    if (status === 'ACCEPTED') {
      updateData.acceptedAt = new Date().toISOString();

      // If accepting, create company user record
      if (userId) {
        // Check if user exists
        const { data: user, error: userError } = await supabase
          .from('users')
          .select('id')
          .eq('id', userId)
          .single();

        if (userError || !user) {
          return NextResponse.json(
            { error: 'User not found' },
            { status: 404 }
          );
        }

        // Check if user is already a member
        const { data: existingMember } = await supabase
          .from('company_users')
          .select('id')
          .eq('companyId', invite.companyId)
          .eq('userId', userId)
          .single();

        if (!existingMember) {
          const { error: companyUserError } = await supabase
            .from('company_users')
            .insert({
              companyId: invite.companyId,
              userId,
              role: invite.role,
              isActive: true,
              joinedAt: new Date().toISOString()
            });

          if (companyUserError) {
            console.error('Error creating company user:', companyUserError);
            return NextResponse.json(
              { error: 'Failed to add user to company' },
              { status: 500 }
            );
          }
        }
      }
    } else {
      updateData.declinedAt = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('company_invites')
      .update(updateData)
      .eq('id', inviteId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ invite: data });
  } catch (error) {
    console.error('Error updating invite:', error);
    return NextResponse.json(
      { error: 'Failed to update invite' },
      { status: 500 }
    );
  }
}

// DELETE - Delete/cancel invite
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const inviteId = searchParams.get('id');
    const userId = searchParams.get('userId');

    if (!inviteId || !userId) {
      return NextResponse.json(
        { error: 'Missing required parameters: id, userId' },
        { status: 400 }
      );
    }

    // Get the invite and verify permissions
    const { data: invite, error: inviteError } = await supabase
      .from('company_invites')
      .select(`
        id,
        companyId,
        invitedById,
        company:companies!inner(*)
      `)
      .eq('id', inviteId)
      .single();

    if (inviteError || !invite) {
      return NextResponse.json(
        { error: 'Invite not found' },
        { status: 404 }
      );
    }

    // Check if user has permission to delete (invite sender or company admin/owner)
    const canDelete = invite.invitedById === userId;
    
    if (!canDelete) {
      const { data: companyUser } = await supabase
        .from('company_users')
        .select('role, isOwner')
        .eq('companyId', invite.companyId)
        .eq('userId', userId)
        .single();

      if (!companyUser?.isOwner && companyUser?.role !== 'ADMIN') {
        return NextResponse.json(
          { error: 'Unauthorized to delete this invite' },
          { status: 403 }
        );
      }
    }

    const { error } = await supabase
      .from('company_invites')
      .delete()
      .eq('id', inviteId);

    if (error) throw error;

    return NextResponse.json({ message: 'Invite deleted successfully' });
  } catch (error) {
    console.error('Error deleting invite:', error);
    return NextResponse.json(
      { error: 'Failed to delete invite' },
      { status: 500 }
    );
  }
}

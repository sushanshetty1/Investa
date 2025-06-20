# User Flow and Authentication System

## Overview

This implementation provides a comprehensive user authentication and authorization system with distinct flows for company owners and individual users.

## User Types

### 1. Company Owners
- Users who sign up via the "Create Company Account" flow
- Have full access to the dashboard immediately upon signup
- Can create and manage their company profile
- Can invite team members with specific roles
- Have admin privileges for their company workspace

### 2. Individual Users
- Users who sign up via the regular signup flow
- Are redirected to a waiting page after authentication
- Must be invited by a company to access the dashboard
- Can accept/decline company invitations
- Have role-based access once they join a company

## Authentication Flow

### Company Signup Flow
1. User clicks "Create Company Account"
2. Fills out company registration form
3. Creates company record in database
4. Gets immediate access to dashboard
5. Can start inviting team members

### Individual User Flow
1. User signs up via regular signup
2. Account is created but marked as individual user
3. Redirected to waiting page after authentication
4. Waiting page displays:
   - Message about needing company invitation
   - List of pending/accepted invitations
   - Ability to accept/decline invitations

### Company Invitation Flow
1. Company owner navigates to Company Profile → Team Management
2. Clicks "Invite Users" button
3. Enters email addresses (bulk or individual)
4. Selects role for invitees
5. Invitations are created in database
6. Invited users see invitations on their waiting page
7. Users can accept/decline invitations
8. Accepted users gain dashboard access

## Key Components

### AuthContext
- Enhanced with `userType`, `hasCompanyAccess`, and `checkUserAccess`
- Automatically determines user type and access level
- Provides centralized authentication state

### DashboardGuard
- Protects dashboard routes
- Redirects unauthenticated users to login
- Redirects users without company access to waiting page
- Used to wrap protected components

### AuthRedirect
- Handles post-authentication redirection
- Routes company owners to dashboard
- Routes individual users to waiting page or dashboard based on access

## Pages

### `/waiting`
- Landing page for individual users without company access
- Shows invitation status
- Allows accepting/declining invitations
- Beautiful UI with company branding

### `/company-profile`
- Company information management
- Team member invitation and management
- Bulk user invitation with role assignment
- Company settings and branding

### `/user-profile`
- Personal information management
- Company membership display
- User preferences and settings
- Security settings

## Database Schema

### Companies Table
```sql
- id (UUID, primary key)
- name (string, required)
- description (text)
- industry (string)
- website (string)
- logo (string)
- address fields
- owner_id (UUID, references auth.users)
- timestamps
```

### Company Invites Table
```sql
- id (UUID, primary key)
- company_id (UUID, references companies)
- email (string, required)
- role (string, default 'VIEWER')
- status (enum: PENDING, ACCEPTED, DECLINED, EXPIRED)
- invited_by (UUID, references auth.users)
- expires_at (timestamp, default +7 days)
- timestamps
```

## Roles

The system supports the following roles:
- `ADMIN`: Full administrative access
- `MANAGER`: Management-level access
- `INVENTORY_MANAGER`: Inventory-specific management
- `WAREHOUSE_STAFF`: Warehouse operations
- `SALES_REP`: Sales-related access
- `ACCOUNTANT`: Financial data access
- `VIEWER`: Read-only access

## Security Features

- Row Level Security (RLS) on all tables
- Company owners can only manage their own companies
- Users can only see invitations for their email
- Invitation expiration (7 days by default)
- Secure role-based access control

## Installation and Setup

1. Run the database setup SQL to create required tables
2. Update your Supabase configuration
3. The authentication flow is automatically handled by the components
4. Users will be properly routed based on their type and access level

## Navigation

The navbar automatically adapts based on user type:
- Shows appropriate profile link (Company Profile vs User Profile)
- Hides dashboard features for users without access
- Displays different menu items based on role

This system provides a seamless experience for both company owners and individual users while maintaining proper security and access controls.

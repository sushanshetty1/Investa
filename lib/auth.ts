import { NextRequest } from 'next/server'
import { createHash } from 'crypto'

// Types for authentication
export interface AuthenticatedUser {
  id: string
  email: string
  role: string
  permissions: string[]
}

export interface AuthenticationResult {
  success: boolean
  user?: AuthenticatedUser
  error?: string
}

// Mock authentication function - Replace with actual implementation
export async function authenticate(request: NextRequest): Promise<AuthenticationResult> {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { success: false, error: 'Missing or invalid authorization header' }
    } const token = authHeader.substring(7) // Remove 'Bearer ' prefix

    // Validate JWT token with Supabase
    try {
      const { createClient } = await import('@supabase/supabase-js')
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Missing Supabase configuration')
      }

      const supabase = createClient(supabaseUrl, supabaseAnonKey)
      const { data, error } = await supabase.auth.getUser(token)

      if (error || !data.user) {
        return { success: false, error: 'Invalid or expired token' }
      }

      // Get user profile from database
      const { data: profile, error: profileError } = await supabase
        .from('User')
        .select('id, email, role, permissions')
        .eq('id', data.user.id)
        .single()

      if (profileError || !profile) {
        // Create default user profile if not exists
        const defaultProfile = {
          id: data.user.id,
          email: data.user.email || '',
          role: 'user',
          permissions: ['inventory:read']
        }

        const { error: insertError } = await supabase
          .from('User')
          .insert(defaultProfile)

        if (insertError) {
          console.error('Failed to create user profile:', insertError)
        }

        return {
          success: true,
          user: defaultProfile
        }
      }

      return {
        success: true,
        user: {
          id: profile.id,
          email: profile.email,
          role: profile.role || 'user',
          permissions: Array.isArray(profile.permissions)
            ? profile.permissions
            : ['inventory:read']
        }
      }
    } catch (jwtError) {
      console.error('JWT validation error:', jwtError)
      return { success: false, error: 'Authentication service unavailable' }
    }
  } catch (error) {
    console.error('Authentication error:', error)
    return { success: false, error: 'Authentication failed' }
  }
}

// Permission checking
export function hasPermission(user: AuthenticatedUser, permission: string): boolean {
  if (user.permissions.includes('*')) {
    return true // Admin access
  }

  return user.permissions.includes(permission)
}

// API Key authentication for external integrations
export async function authenticateApiKey(request: NextRequest): Promise<AuthenticationResult> {
  try {
    const apiKey = request.headers.get('x-api-key')
    if (!apiKey) {
      return { success: false, error: 'Missing API key' }
    }    // Validate API key against database
    try {
      const { createClient } = await import('@supabase/supabase-js')
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

      if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Missing Supabase configuration')
      }

      const supabase = createClient(supabaseUrl, supabaseServiceKey)
      // Query the APIKey table for valid key
      const { data: keyRecord, error } = await supabase
        .from('APIKey')
        .select(`
          id, 
          name, 
          permissions, 
          isActive, 
          expiresAt,
          userId,
          User!inner(id, email, role)
        `)
        .eq('keyHash', await hashApiKey(apiKey))
        .eq('isActive', true)
        .single()

      if (error || !keyRecord) {
        return { success: false, error: 'Invalid API key' }
      }

      // Check if key has expired
      if (keyRecord.expiresAt && new Date(keyRecord.expiresAt) < new Date()) {
        return { success: false, error: 'API key has expired' }
      }

      // Update last used timestamp
      await supabase
        .from('APIKey')
        .update({ lastUsedAt: new Date().toISOString() })
        .eq('id', keyRecord.id)

      const user = Array.isArray(keyRecord.User) ? keyRecord.User[0] : keyRecord.User

      return {
        success: true,
        user: {
          id: user?.id || 'api-user',
          email: user?.email || 'api@system.com',
          role: 'api',
          permissions: Array.isArray(keyRecord.permissions)
            ? keyRecord.permissions
            : ['inventory:read', 'inventory:write']
        }
      }
    } catch (dbError) {
      console.error('API key validation error:', dbError)
      return { success: false, error: 'API key validation service unavailable' }
    }
  } catch (error) {
    console.error('API key authentication error:', error)
    return { success: false, error: 'API key authentication failed' }
  }
}

// Combined authentication that supports both JWT and API keys
export async function authenticateRequest(request: NextRequest): Promise<AuthenticationResult> {
  // Try JWT authentication first
  const jwtResult = await authenticate(request)
  if (jwtResult.success) {
    return jwtResult
  }

  // Fall back to API key authentication
  const apiKeyResult = await authenticateApiKey(request)
  if (apiKeyResult.success) {
    return apiKeyResult
  }

  return { success: false, error: 'Authentication required' }
}

// Security headers
export function getSecurityHeaders() {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';",
  }
}

// Input sanitization
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    // Basic XSS prevention
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .trim()
  }

  if (Array.isArray(input)) {
    return input.map(item => sanitizeInput(item))
  }
  if (input && typeof input === 'object') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sanitized: any = {}
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value)
    }
    return sanitized
  }

  return input
}

// Validate UUID format
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

// Common permission constants
export const PERMISSIONS = {
  // Products
  PRODUCT_READ: 'product:read',
  PRODUCT_WRITE: 'product:write',
  PRODUCT_DELETE: 'product:delete',

  // Inventory
  INVENTORY_READ: 'inventory:read',
  INVENTORY_WRITE: 'inventory:write',
  INVENTORY_ADJUST: 'inventory:adjust',
  INVENTORY_TRANSFER: 'inventory:transfer',

  // Suppliers
  SUPPLIER_READ: 'supplier:read',
  SUPPLIER_WRITE: 'supplier:write',
  SUPPLIER_DELETE: 'supplier:delete',

  // Orders
  ORDER_READ: 'order:read',
  ORDER_WRITE: 'order:write',
  ORDER_APPROVE: 'order:approve',

  // Reports
  REPORT_VIEW: 'report:view',
  REPORT_EXPORT: 'report:export',

  // Admin
  ADMIN_ALL: '*',
} as const

// Utility function to hash API keys for secure storage
async function hashApiKey(apiKey: string): Promise<string> {
  return createHash('sha256').update(apiKey).digest('hex')
}

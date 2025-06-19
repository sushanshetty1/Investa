import { NextRequest } from 'next/server'

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
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix

    // TODO: Implement actual JWT validation with your auth provider
    // This is a placeholder implementation
    if (token === 'dev-token') {
      return {
        success: true,
        user: {
          id: 'dev-user-id',
          email: 'dev@example.com',
          role: 'admin',
          permissions: ['*'] // Admin has all permissions
        }
      }
    }

    // Example: Validate JWT token
    // const payload = await validateJWT(token)
    // const user = await getUserFromDatabase(payload.sub)
    // return { success: true, user }

    return { success: false, error: 'Invalid token' }
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
    }

    // TODO: Validate API key against database
    // const keyRecord = await validateApiKey(apiKey)
    // if (!keyRecord) return { success: false, error: 'Invalid API key' }

    // For demo purposes, accept a dev API key
    if (apiKey === 'dev-api-key') {
      return {
        success: true,
        user: {
          id: 'api-user',
          email: 'api@example.com',
          role: 'api',
          permissions: ['inventory:read', 'inventory:write']
        }
      }
    }

    return { success: false, error: 'Invalid API key' }
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

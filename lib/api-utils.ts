import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

// Standard API response types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface ApiError {
  code: string
  message: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  details?: any
}

// Standard error codes
export const ErrorCodes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  CONFLICT: 'CONFLICT',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  RATE_LIMIT: 'RATE_LIMIT',
  BAD_REQUEST: 'BAD_REQUEST',
} as const

// Success response helper
export function successResponse<T>(
  data: T,
  message?: string,
  pagination?: ApiResponse['pagination']
): NextResponse<ApiResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    message,
    pagination,
  })
}

// Error response helper
export function errorResponse(
  error: string | ApiError,
  status: number = 400
): NextResponse<ApiResponse> {
  if (typeof error === 'string') {
    return NextResponse.json({
      success: false,
      error,
    }, { status })
  }

  return NextResponse.json({
    success: false,
    error: error.message,
    data: error.details,
  }, { status })
}

// Handle Zod validation errors
export function handleValidationError(error: ZodError): NextResponse<ApiResponse> {
  const formattedErrors = error.errors.map(err => ({
    field: err.path.join('.'),
    message: err.message,
  }))

  return errorResponse({
    code: ErrorCodes.VALIDATION_ERROR,
    message: 'Validation failed',
    details: formattedErrors,
  }, 400)
}

// Handle Prisma errors
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function handlePrismaError(error: any): NextResponse<ApiResponse> {
  // Unique constraint violation
  if (error.code === 'P2002') {
    const field = error.meta?.target?.[0] || 'field'
    return errorResponse({
      code: ErrorCodes.CONFLICT,
      message: `A record with this ${field} already exists`,
      details: { field, value: error.meta?.target },
    }, 409)
  }

  // Record not found
  if (error.code === 'P2025') {
    return errorResponse({
      code: ErrorCodes.NOT_FOUND,
      message: 'Record not found',
      details: error.meta,
    }, 404)
  }

  // Foreign key constraint violation
  if (error.code === 'P2003') {
    return errorResponse({
      code: ErrorCodes.BAD_REQUEST,
      message: 'Invalid reference to related record',
      details: error.meta,
    }, 400)
  }

  // Generic database error
  return errorResponse({
    code: ErrorCodes.INTERNAL_ERROR,
    message: 'Database operation failed',
    details: process.env.NODE_ENV === 'development' ? error.message : undefined,
  }, 500)
}

// Generic error handler for server actions and API routes
export function handleError(error: unknown): NextResponse<ApiResponse> {
  // Zod validation error
  if (error instanceof ZodError) {
    return handleValidationError(error)
  }

  // Prisma error
  if (error && typeof error === 'object' && 'code' in error) {
    return handlePrismaError(error)
  }

  // Known error with message
  if (error instanceof Error) {
    return errorResponse({
      code: ErrorCodes.INTERNAL_ERROR,
      message: error.message,
    }, 500)
  }

  // Unknown error
  return errorResponse({
    code: ErrorCodes.INTERNAL_ERROR,
    message: 'An unexpected error occurred',
  }, 500)
}

// Pagination helper
export function calculatePagination(page: number, limit: number, total: number) {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  }
}

// Response wrapper for server actions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ActionResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export function actionSuccess<T>(data: T, message?: string): ActionResponse<T> {
  return {
    success: true,
    data,
    message,
  }
}

export function actionError(error: string): ActionResponse {
  return {
    success: false,
    error,
  }
}

// Rate limiting helper (simple in-memory implementation)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(identifier: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(identifier)

  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (record.count < limit) {
    record.count++
    return true
  }

  return false
}

// Clean up expired rate limit records
setInterval(() => {
  const now = Date.now()
  for (const [key, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(key)
    }
  }
}, 60000) // Clean up every minute

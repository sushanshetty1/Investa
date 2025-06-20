import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    // Simple middleware that allows public access to auth and waiting pages
    // and protects dashboard routes
    const { pathname } = request.nextUrl

    // Allow access to public pages
    if (
        pathname.startsWith('/auth/') ||
        pathname.startsWith('/waiting') ||
        pathname === '/' ||
        pathname.startsWith('/api/') ||
        pathname.startsWith('/_next/') ||
        pathname.includes('.')
    ) {
        return NextResponse.next()
    }

    // For now, allow access to all other routes
    // The actual auth checking will be done in the components/pages
    return NextResponse.next()
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
}
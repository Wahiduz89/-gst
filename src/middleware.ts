import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    // Token exists, user is authenticated
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Define protected routes
        const protectedPaths = ['/dashboard', '/invoices', '/customers'];
        const isProtectedRoute = protectedPaths.some(path => 
          req.nextUrl.pathname.startsWith(path)
        );
        
        // If it's a protected route, check if token exists
        if (isProtectedRoute) {
          return !!token;
        }
        
        // Allow access to non-protected routes
        return true;
      },
    },
    pages: {
      signIn: '/login',
      error: '/login',
    },
  }
);

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
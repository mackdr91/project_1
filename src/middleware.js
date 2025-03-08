import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// This function can be marked `async` if using `await` inside
export async function middleware(request) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname;
  
  // Define public paths that don't require authentication
  const isPublicPath = path === '/auth/login' || 
                       path === '/auth/register' || 
                       path === '/' || 
                       path.startsWith('/api/');
  
  // Define protected paths that require authentication
  const isProtectedPath = path === '/dashboard' || 
                          path === '/profile' || 
                          path.startsWith('/admin');
  
  // Get the token from the request
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET || 'your-default-secret-key-change-this-in-production'
  });
  
  // If the path is protected and the user is not authenticated, redirect to login
  if (isProtectedPath && !token) {
    const url = new URL('/auth/login', request.url);
    url.searchParams.set('callbackUrl', path);
    return NextResponse.redirect(url);
  }
  
  // If the user is already authenticated and trying to access login/register, redirect to dashboard
  if ((path === '/auth/login' || path === '/auth/register') && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // Continue with the request if none of the above conditions are met
  return NextResponse.next();
}

// Configure middleware to run on specific paths
export const config = {
  matcher: [
    // Match all paths except for:
    // - API routes (except auth-related ones)
    // - Static files (images, etc.)
    // - Favicon
    '/((?!api/(?!auth)|_next/static|_next/image|favicon.ico).*)',
  ],
};

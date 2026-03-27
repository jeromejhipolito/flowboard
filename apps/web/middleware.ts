import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // In demo mode, bypass all auth checks
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
    return NextResponse.next();
  }

  // Check for the frontend-set auth indicator cookie
  const loggedIn = request.cookies.get('fb_logged_in')?.value;

  if (!loggedIn) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/workspaces/:path*'],
};

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    (pathname === '/signIn' || pathname === '/signUp') &&
    request.cookies.has('auth')
  )
    return NextResponse.redirect(new URL('/', request.url));

  if (
    (pathname === '/' || pathname === '/accounts') &&
    !request.cookies.has('auth')
  )
    return NextResponse.redirect(new URL('/signIn', request.url));

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/accounts', '/signIn', '/signUp'],
};

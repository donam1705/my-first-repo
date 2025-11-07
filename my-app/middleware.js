import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'mysecretkey';

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get('admin_token')?.value;

  if (pathname.startsWith('/admin/auth/login')) {
    if (token) {
      try {
        const decoded = jwt.verify(token, SECRET);
        if (decoded.role === 'admin') {
          return NextResponse.redirect(new URL('/admin', req.url));
        }
      } catch {}
    }
    return NextResponse.next();
  }

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/assets')
  ) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/admin')) {
    if (!token) {
      return NextResponse.redirect(new URL('/admin/auth/login', req.url));
    }

    try {
      const decoded = jwt.verify(token, SECRET);
      if (decoded.role !== 'admin') {
        return NextResponse.redirect(new URL('/', req.url));
      }
      return NextResponse.next();
    } catch (err) {
      console.error('Admin token invalid:', err.message);
      return NextResponse.redirect(new URL('/admin/auth/login', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};

import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const SECRET = process.env.JWT_SECRET || 'mysecretkey';

export function signToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: '7d' });
}

export async function setAuthCookie(token) {
  const cookieStore = await cookies();
  cookieStore.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  });
}

export async function removeAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.set('token', '', {
    httpOnly: true,
    maxAge: 0,
    path: '/',
  });
}

export async function getUserFromToken() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return null;

    return jwt.verify(token, SECRET);
  } catch (err) {
    console.error('JWT verify failed:', err);
    return null;
  }
}

export async function getUserFromRequest(req) {
  try {
    const cookieHeader = req.headers.get('cookie') || '';
    const token = cookieHeader
      .split('; ')
      .find((c) => c.startsWith('token='))
      ?.split('=')[1];
    if (!token) return null;

    return jwt.verify(token, SECRET);
  } catch (err) {
    console.error('Token from request invalid:', err);
    return null;
  }
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET);
  } catch {
    return null;
  }
}

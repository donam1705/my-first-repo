import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const SECRET = process.env.JWT_SECRET || 'mysecretkey';

export function signToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: '7d' });
}

export function setUserCookie(token) {
  const cookieStore = cookies();
  cookieStore.set('user_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60,
  });
}

export function setAdminCookie(token) {
  const cookieStore = cookies();
  cookieStore.set('admin_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60,
  });
}

export function removeAuthCookie(name = 'user_token') {
  const cookieStore = cookies();
  cookieStore.set(name, '', { httpOnly: true, maxAge: 0, path: '/' });
}

export function getUserFromToken(type = 'user') {
  try {
    const cookieStore = cookies();
    const tokenName = type === 'admin' ? 'admin_token' : 'user_token';
    const token = cookieStore.get(tokenName)?.value;
    if (!token) return null;
    return jwt.verify(token, SECRET);
  } catch (err) {
    console.error('JWT verify failed:', err.message);
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

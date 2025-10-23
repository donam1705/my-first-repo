import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return NextResponse.json({ user: null });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ user: null });

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        birthDate: true,
        address: true,
        avatar: true,
      },
    });

    if (!user) return NextResponse.json({ user: null });

    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      birthDate: user.birthDate,
      address: user.address,
      avatarUrl: user.avatar || null,
    };

    return NextResponse.json({ user: payload, avatarUrl: payload.avatarUrl });
  } catch (err) {
    console.error('GET /api/auth/me error', err);
    return NextResponse.json({ user: null });
  }
}

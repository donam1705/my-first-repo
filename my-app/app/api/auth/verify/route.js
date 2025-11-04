import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Thiếu token xác thực!' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: { verifyToken: token },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Token không hợp lệ hoặc đã được sử dụng!' },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verifyToken: null,
      },
    });

    return NextResponse.json({ message: 'Xác minh email thành công!' });
  } catch (error) {
    console.error('Lỗi API verify:', error);
    return NextResponse.json(
      { error: 'Lỗi server, thử lại sau!' },
      { status: 500 }
    );
  }
}

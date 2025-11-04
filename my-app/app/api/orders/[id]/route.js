import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const SECRET = process.env.JWT_SECRET || 'mysecretkey';

export async function GET(_, { params }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Bạn chưa đăng nhập' },
        { status: 401 }
      );
    }

    let decoded;
    try {
      decoded = jwt.verify(token, SECRET);
    } catch {
      return NextResponse.json(
        { error: 'Token không hợp lệ hoặc hết hạn' },
        { status: 403 }
      );
    }

    const userId = decoded.id;
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: 'Thiếu ID đơn hàng' }, { status: 400 });
    }

    const order = await prisma.order.findFirst({
      where: { id: Number(id), userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Đơn hàng không tồn tại hoặc không thuộc về bạn' },
        { status: 404 }
      );
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Lỗi API /orders/[id]:', error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(req, { params }) {
  try {
    const token = cookies().get('token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'Bạn chưa đăng nhập' },
        { status: 401 }
      );
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json(
        { error: 'Token không hợp lệ' },
        { status: 401 }
      );
    }

    const { id } = params;

    const order = await prisma.order.findFirst({
      where: { id: Number(id), userId: user.id },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Đơn hàng không tồn tại' },
        { status: 404 }
      );
    }
    if (order.status === 'CANCELLED') {
      return NextResponse.json(
        { error: 'Đơn đã bị hủy trước đó' },
        { status: 400 }
      );
    }
    if (order.status === 'COMPLETED') {
      return NextResponse.json(
        { error: 'Đơn đã hoàn thành, không thể hủy' },
        { status: 400 }
      );
    }

    const updated = await prisma.order.update({
      where: { id: Number(id) },
      data: { status: 'CANCELLED' },
    });

    return NextResponse.json({
      message: 'Hủy đơn hàng thành công',
      order: updated,
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

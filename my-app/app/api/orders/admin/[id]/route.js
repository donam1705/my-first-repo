import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req, { params }) {
  try {
    const orderId = Number(params.id);

    const order = await prisma.order.findUnique({
      where: { id: orderId },
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
        { error: 'Không tìm thấy đơn hàng' },
        { status: 404 }
      );
    }

    return NextResponse.json(order);
  } catch (err) {
    console.error('Lỗi khi lấy đơn hàng:', err);
    return NextResponse.json(
      { error: 'Lỗi server khi lấy đơn hàng' },
      { status: 500 }
    );
  }
}

export async function PATCH(req, { params }) {
  try {
    const orderId = Number(params.id);
    const body = await req.json();
    const { status } = body;

    const validStatuses = [
      'PENDING',
      'PAID',
      'SHIPPED',
      'COMPLETED',
      'CANCELLED',
    ];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Trạng thái không hợp lệ' },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return NextResponse.json(
        { error: 'Không tìm thấy đơn hàng' },
        { status: 404 }
      );
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      message: 'Cập nhật trạng thái thành công',
      order: updatedOrder,
    });
  } catch (err) {
    console.error('Lỗi khi cập nhật đơn hàng:', err);
    return NextResponse.json(
      { error: 'Lỗi server khi cập nhật đơn hàng' },
      { status: 500 }
    );
  }
}

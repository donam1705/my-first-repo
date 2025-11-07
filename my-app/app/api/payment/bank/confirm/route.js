import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req) {
  try {
    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: 'Thiếu ID đơn hàng' }, { status: 400 });
    }

    const order = await prisma.order.update({
      where: { id: Number(orderId) },
      data: {
        status: 'BANK_PENDING',
        paymentMethod: 'BANK_TRANSFER',
        paymentStatus: 'pending',
      },
    });

    return NextResponse.json({
      message: 'Đã cập nhật trạng thái đơn hàng sang chờ xác nhận thanh toán.',
      order,
    });
  } catch (error) {
    console.error('Lỗi xác nhận chuyển khoản:', error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}

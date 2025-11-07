import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromToken } from '@/lib/auth';

export async function POST(req) {
  try {
    const user = await getUserFromToken();
    if (!user)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { orderId } = await req.json();
    if (!orderId)
      return NextResponse.json({ error: 'Thiếu mã đơn hàng' }, { status: 400 });

    const order = await prisma.order.update({
      where: { id: Number(orderId) },
      data: {
        status: 'CONFIRMED',
        paymentMethod: 'COD',
        paymentStatus: 'unpaid',
      },
    });

    console.log(`Đơn hàng #${order.id} được đặt thành công (COD)`);

    return NextResponse.json({
      message: 'Đặt hàng thành công. Thanh toán khi nhận hàng.',
      order,
    });
  } catch (error) {
    console.error('Lỗi xác nhận COD:', error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}

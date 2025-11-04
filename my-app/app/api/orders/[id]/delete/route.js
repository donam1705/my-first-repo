import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromToken } from '@/lib/auth';

export async function DELETE(req, context) {
  try {
    const params = await context.params;
    const user = await getUserFromToken();

    if (!user) {
      return NextResponse.json(
        { error: 'Bạn chưa đăng nhập' },
        { status: 401 }
      );
    }

    const orderId = Number(params.id);
    if (!orderId) {
      return NextResponse.json({ error: 'Thiếu ID đơn hàng' }, { status: 400 });
    }

    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: user.id },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Không tìm thấy đơn hàng hoặc bạn không có quyền xóa' },
        { status: 404 }
      );
    }

    if (order.status === 'PAID') {
      return NextResponse.json(
        { error: 'Không thể xóa đơn hàng đã thanh toán' },
        { status: 400 }
      );
    }

    await prisma.orderItem.deleteMany({
      where: { orderId },
    });

    await prisma.order.delete({
      where: { id: orderId },
    });

    return NextResponse.json({
      message: 'Xóa đơn hàng thành công',
    });
  } catch (error) {
    console.error('Lỗi khi xóa đơn hàng:', error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}

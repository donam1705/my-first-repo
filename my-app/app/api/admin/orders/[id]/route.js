import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function PATCH(req, { params }) {
  try {
    const { status } = await req.json();
    const updated = await prisma.order.update({
      where: { id: Number(params.id) },
      data: { status },
    });
    return NextResponse.json(updated);
  } catch (err) {
    console.error('Lỗi cập nhật đơn hàng:', err);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}

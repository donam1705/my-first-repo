import { prisma } from '@/lib/prisma';
import { getUserFromToken } from '@/lib/auth';

export async function POST(req) {
  try {
    const user = await getUserFromToken();
    if (!user)
      return Response.json({ error: 'Chưa đăng nhập' }, { status: 401 });

    const { items, receiverName, phone, address } = await req.json();

    const totalAmount = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const order = await prisma.order.create({
      data: {
        userId: user.id,
        receiverName,
        phone,
        address,
        totalAmount,
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: { items: true },
    });

    return Response.json({ message: 'Đặt hàng thành công', order });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

import { prisma } from '@/lib/prisma';
import { getUserFromToken } from '@/lib/auth';

export async function GET(req) {
  const user = await getUserFromToken();
  if (!user) return Response.json({ error: 'Chưa đăng nhập' }, { status: 401 });

  const wishlist = await prisma.wishlist.findMany({
    where: { userId: user.id },
    include: { product: true },
  });
  return Response.json(wishlist);
}

export async function POST(req) {
  const user = await getUserFromToken();
  if (!user) return Response.json({ error: 'Chưa đăng nhập' }, { status: 401 });

  const { productId } = await req.json();
  const item = await prisma.wishlist.create({
    data: { userId: user.id, productId },
  });

  return Response.json(item);
}

export async function DELETE(req) {
  const user = await getUserFromToken();
  const { productId } = await req.json();

  await prisma.wishlist.delete({
    where: { userId_productId: { userId: user.id, productId } },
  });

  return Response.json({ message: 'Đã xóa khỏi Wishlist' });
}

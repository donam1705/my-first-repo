import { prisma } from '@/lib/prisma';

export async function POST(req) {
  const { token } = await req.json();

  const user = await prisma.user.findFirst({ where: { verifyToken: token } });

  if (!user) {
    return Response.json({ error: 'Token không hợp lệ' }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { isVerified: true, verifyToken: null },
  });

  return Response.json({
    message: 'Xác thực thành công! Bạn có thể đăng nhập.',
  });
}

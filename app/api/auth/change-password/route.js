import { prisma } from '@/lib/prisma';
import { getUserFromToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function PUT(req) {
  try {
    const user = await getUserFromToken();
    if (!user)
      return Response.json({ error: 'Chưa đăng nhập' }, { status: 401 });

    const { oldPassword, newPassword } = await req.json();

    const current = await prisma.user.findUnique({ where: { id: user.id } });
    const match = await bcrypt.compare(oldPassword, current.password);

    if (!match)
      return Response.json({ error: 'Mật khẩu cũ sai' }, { status: 400 });

    await prisma.user.update({
      where: { id: user.id },
      data: { password: await bcrypt.hash(newPassword, 10) },
    });

    return Response.json({ message: 'Đổi mật khẩu thành công' });
  } catch (error) {
    return Response.json({ error: 'Lỗi server' }, { status: 500 });
  }
}

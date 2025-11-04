import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  try {
    const { token, password } = await req.json();

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExp: { gt: new Date() },
      },
    });

    if (!user) {
      return Response.json(
        { error: 'Token không hợp lệ hoặc đã hết hạn' },
        { status: 400 }
      );
    }

    const hashed = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashed,
        resetToken: null,
        resetTokenExp: null,
      },
    });

    return Response.json({ message: 'Đổi mật khẩu thành công' });
  } catch (err) {
    console.error(err);
    return Response.json({ error: 'Server Error' }, { status: 500 });
  }
}

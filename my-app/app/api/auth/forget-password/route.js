import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { emailQueue } from '@/lib/queue';

export async function POST(req) {
  try {
    const { email } = await req.json();
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return Response.json({ error: 'Email không tồn tại' }, { status: 400 });
    }

    const token = crypto.randomBytes(40).toString('hex');
    const expiry = new Date(Date.now() + 5 * 60 * 1000);

    await prisma.user.update({
      where: { email },
      data: {
        resetToken: token,
        resetTokenExp: expiry,
      },
    });

    await emailQueue.add('sendResetEmail', {
      email: user.email,
      token: token,
    });

    return Response.json({
      message: 'Vui lòng kiểm tra email để đặt lại mật khẩu.',
    });
  } catch (err) {
    console.error(err);
    return Response.json({ error: 'Server Error' }, { status: 500 });
  }
}

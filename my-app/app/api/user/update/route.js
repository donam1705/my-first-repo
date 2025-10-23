import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function PUT(req) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token)
      return NextResponse.json({ error: 'Chưa đăng nhập!' }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const data = await req.json();

    const updated = await prisma.user.update({
      where: { id: decoded.id },
      data,
    });

    return NextResponse.json({ message: 'Cập nhật thành công', user: updated });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

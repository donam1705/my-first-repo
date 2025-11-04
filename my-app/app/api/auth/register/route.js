import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import { emailQueue } from '@/lib/queue';
import * as yup from 'yup';

const registerSchema = yup.object().shape({
  name: yup.string().trim().max(100, 'Tên quá dài').nullable(),
  email: yup
    .string()
    .required('Email là bắt buộc')
    .email('Định dạng email không hợp lệ'),
  password: yup
    .string()
    .required('Mật khẩu là bắt buộc')
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  phone: yup
    .string()
    .nullable()
    .transform((val) => (val === '' ? null : val))
    .matches(/^\+?\d{7,15}$/, 'Định dạng số điện thoại không hợp lệ'),
  address: yup.string().nullable(),
  gender: yup
    .string()
    .nullable()
    .oneOf(['male', 'female', null], 'Giới tính không hợp lệ'),
  birthDate: yup
    .date()
    .nullable()
    .transform((value, originalValue) => {
      if (!originalValue) return null;
      const d = new Date(originalValue);
      return isNaN(d.getTime()) ? new Date('invalid') : d;
    })
    .typeError('Định dạng ngày sinh không hợp lệ'),
});

export async function POST(req) {
  try {
    const data = await req.json();

    const body = await registerSchema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });

    const { name, email, password, phone, address, gender, birthDate } = body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return Response.json({ error: 'Email đã tồn tại' }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 10);

    const verifyToken = crypto.randomBytes(50).toString('hex');

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        isVerified: false,
        verifyToken,
        phone,
        address,
        gender,
        birthDate,
      },
    });

    await emailQueue.add('sendVerifyEmail', {
      email: user.email,
      token: verifyToken,
    });

    return Response.json({
      message: 'Đăng ký thành công! Vui lòng kiểm tra email để xác nhận.',
    });
  } catch (err) {
    if (err instanceof yup.ValidationError) {
      return Response.json({ errors: err.errors }, { status: 400 });
    }
    console.error('Lỗi server:', err);
    return Response.json({ error: 'Lỗi server' }, { status: 500 });
  }
}

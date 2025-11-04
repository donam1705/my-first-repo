'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useState } from 'react';

const ResetSchema = Yup.object().shape({
  password: Yup.string()
    .required('Mật khẩu mới không được bỏ trống')
    .min(6, 'Ít nhất 6 ký tự'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Mật khẩu không trùng khớp')
    .required('Vui lòng xác nhận lại mật khẩu'),
});

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const router = useRouter();
  const [message, setMessage] = useState('');

  if (!token) {
    return (
      <p className="text-center text-red-500 mt-10">
        Token không hợp lệ hoặc đã hết hạn!
      </p>
    );
  }

  return (
    <main className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
      <h1 className="text-2xl font-bold mb-4">Đặt lại mật khẩu</h1>

      {message && <p className="text-center p-2 text-green-600">{message}</p>}

      <Formik
        initialValues={{ password: '', confirmPassword: '' }}
        validationSchema={ResetSchema}
        onSubmit={async (values, { setSubmitting }) => {
          const res = await fetch('/api/auth/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, password: values.password }),
          });

          const data = await res.json();

          if (res.ok) {
            setMessage(
              'Đổi mật khẩu thành công! Chuyển đến trang đăng nhập...'
            );
            setTimeout(() => router.push('/auth/login'), 1500);
          } else {
            alert(data.error || 'Có lỗi xảy ra!');
          }

          setSubmitting(false);
        }}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-4">
            <div>
              <label className="block font-medium">Mật khẩu mới</label>
              <Field
                name="password"
                type="password"
                className="border w-full p-2 rounded focus:outline-blue-500"
              />
              <ErrorMessage
                name="password"
                component="p"
                className="text-red-500 text-sm"
              />
            </div>

            <div>
              <label className="block font-medium">Xác nhận mật khẩu</label>
              <Field
                name="confirmPassword"
                type="password"
                className="border w-full p-2 rounded focus:outline-blue-500"
              />
              <ErrorMessage
                name="confirmPassword"
                component="p"
                className="text-red-500 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full"
            >
              {isSubmitting ? 'Đang xử lý...' : 'Đổi mật khẩu'}
            </button>
          </Form>
        )}
      </Formik>
    </main>
  );
}

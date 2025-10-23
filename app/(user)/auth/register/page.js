'use client';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const RegisterSchema = Yup.object({
  name: Yup.string()
    .min(1, 'Tên bạn phải nhiều hơn 1 kí tự')
    .required('Vui lòng nhập họ tên'),
  email: Yup.string()
    .email('Email không hợp lệ')
    .required('Vui lòng nhập email'),
  password: Yup.string()
    .min(6, 'Mật khẩu ít nhất 6 ký tự')
    .required('Vui lòng nhập mật khẩu'),
  phone: Yup.string().matches(/^[0-9]{10,11}$/, 'SĐT không hợp lệ'),
  address: Yup.string(),
  gender: Yup.string(),
  birthDate: Yup.date().nullable(),
});

export default function RegisterPage() {
  const [message, setMessage] = useState('');
  const router = useRouter();

  return (
    <div className="max-w-md mx-auto mt-10 p-6 shadow rounded-lg bg-white">
      <h2 className="text-2xl font-bold mb-4 text-center">Đăng ký</h2>

      <Formik
        initialValues={{
          name: '',
          email: '',
          password: '',
          phone: '',
          address: '',
          gender: '',
          birthDate: '',
        }}
        validationSchema={RegisterSchema}
        onSubmit={async (values, { setSubmitting }) => {
          try {
            const res = await fetch('/api/auth/register', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(values),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            setMessage('Đăng ký thành công!');
            setTimeout(() => {
              router.push('/auth/login');
            }, 1000);
          } catch (error) {
            setMessage(error.message);
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-4">
            {[
              { name: 'name', label: 'Họ tên', placeholder: 'Nhập họ tên' },
              { name: 'email', label: 'Email', placeholder: 'Nhập email' },
              {
                name: 'password',
                label: 'Mật khẩu',
                placeholder: 'Nhập mật khẩu',
              },
              {
                name: 'phone',
                label: 'Số điện thoại',
                placeholder: 'Nhập số điện thoại',
              },
              {
                name: 'address',
                label: 'Địa chỉ',
                placeholder: 'Nhập địa chỉ',
              },
            ].map(({ name, label, placeholder }) => (
              <div key={name}>
                <label
                  htmlFor={name}
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {label}
                </label>
                <Field
                  id={name}
                  type={name === 'password' ? 'password' : 'text'}
                  name={name}
                  placeholder={placeholder}
                  className="input"
                />
                <ErrorMessage
                  name={name}
                  component="div"
                  className="text-red-500 text-sm"
                />
              </div>
            ))}

            <div>
              <label
                htmlFor="gender"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Giới tính
              </label>
              <Field as="select" name="gender" id="gender" className="input">
                <option value="">Chọn giới tính</option>
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
              </Field>
            </div>

            <div>
              <label
                htmlFor="birthDate"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Ngày sinh
              </label>
              <Field
                type="date"
                name="birthDate"
                id="birthDate"
                className="input"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition"
            >
              {isSubmitting ? 'Đang xử lý...' : 'Đăng ký'}
            </button>

            {message && (
              <p className="text-center text-sm text-green-600">{message}</p>
            )}

            <p className="text-center text-sm mt-4">
              Đã có tài khoản?{' '}
              <a href="/auth/login" className="text-blue-600 hover:underline">
                Đăng nhập tại đây
              </a>
            </p>
          </Form>
        )}
      </Formik>
    </div>
  );
}

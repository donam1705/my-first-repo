'use client';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const LoginSchema = Yup.object({
  email: Yup.string().email('Email không đúng').required('Nhập email'),
  password: Yup.string()
    .min(6, 'Mật khẩu tối thiểu 6 ký tự')
    .required('Nhập mật khẩu'),
});

export default function LoginPage() {
  const router = useRouter();

  return (
    <div className="max-w-md mx-auto mt-10 p-6 shadow rounded-lg bg-white">
      <h2 className="text-2xl font-bold mb-4 text-center">Đăng nhập</h2>

      <Formik
        initialValues={{ email: '', password: '' }}
        validationSchema={LoginSchema}
        onSubmit={async (values, { setSubmitting }) => {
          try {
            const res = await fetch('/api/auth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(values),
            });

            const data = await res.json();

            if (!res.ok) {
              toast.error(data.message || 'Email hoặc mật khẩu không đúng');
              throw new Error();
            }

            toast.success('Đăng nhập thành công!');
            setTimeout(() => {
              router.push('/');
            }, 1000);
          } catch (error) {
            // lỗi đã được xử lý bằng toast.error
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-4">
            <div>
              <Field
                name="email"
                type="email"
                placeholder="Email"
                className="input"
              />
              <ErrorMessage
                name="email"
                component="div"
                className="text-red-500 text-sm"
              />
            </div>

            <div>
              <Field
                name="password"
                type="password"
                placeholder="Mật khẩu"
                className="input"
              />
              <ErrorMessage
                name="password"
                component="div"
                className="text-red-500 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
            >
              {isSubmitting ? 'Đang xử lý...' : 'Đăng nhập'}
            </button>

            <p className="text-center text-sm mt-4">
              Chưa có tài khoản?{' '}
              <a
                href="/auth/register"
                className="text-blue-600 hover:underline"
              >
                Đăng kí ngay
              </a>
            </p>
          </Form>
        )}
      </Formik>

      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="light"
      />
    </div>
  );
}

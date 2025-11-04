'use client';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const ForgotSchema = Yup.object().shape({
  email: Yup.string().email('Email không hợp lệ').required('Bắt buộc'),
});

export default function ForgotPassword() {
  return (
    <main className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
      <h1 className="text-xl font-bold">Quên mật khẩu</h1>

      <Formik
        initialValues={{ email: '' }}
        validationSchema={ForgotSchema}
        onSubmit={async (values, { setSubmitting, resetForm }) => {
          const res = await fetch('/api/auth/forget-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(values),
          });
          if (res.ok) alert('Đã gửi mail. Vui lòng kiểm tra hòm thư.');
          else alert('Có lỗi xảy ra');
          setSubmitting(false);
        }}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-4 mt-4">
            <label>Email</label>
            <Field name="email" className="border p-2 w-full rounded" />
            <ErrorMessage
              name="email"
              className="text-red-500 text-sm"
              component="p"
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              {isSubmitting ? 'Đang gửi...' : 'Gửi'}
            </button>
          </Form>
        )}
      </Formik>
    </main>
  );
}

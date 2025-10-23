'use client';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const PasswordSchema = Yup.object({
  oldPassword: Yup.string().required('Nhập mật khẩu cũ'),
  newPassword: Yup.string()
    .min(6, 'Tối thiểu 6 ký tự')
    .required('Nhập mật khẩu mới'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword'), null], 'Mật khẩu không khớp')
    .required('Nhập lại mật khẩu mới'),
});

export default function ChangePassword() {
  const handleSubmit = async (values, { resetForm }) => {
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (res.ok) {
        toast.success('Đổi mật khẩu thành công!');
        resetForm();
      } else {
        const data = await res.json();
        toast.error(data.message || 'Đổi mật khẩu thất bại');
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra, vui lòng thử lại');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-xl font-bold mb-6 text-center text-gray-800">
        Đổi mật khẩu
      </h2>

      <Formik
        initialValues={{
          oldPassword: '',
          newPassword: '',
          confirmPassword: '',
        }}
        validationSchema={PasswordSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mật khẩu hiện tại
              </label>
              <Field
                name="oldPassword"
                type="password"
                className="w-full border px-4 py-2 rounded-lg "
              />
              <ErrorMessage
                name="oldPassword"
                component="p"
                className="text-red-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mật khẩu mới
              </label>
              <Field
                name="newPassword"
                type="password"
                className="w-full border px-4 py-2 rounded-lg  "
              />
              <ErrorMessage
                name="newPassword"
                component="p"
                className="text-red-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nhập lại mật khẩu mới
              </label>
              <Field
                name="confirmPassword"
                type="password"
                className="w-full border px-4 py-2 rounded-lg  "
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
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-full shadow transition disabled:opacity-50"
            >
              {isSubmitting ? 'Đang xử lý...' : 'Lưu thay đổi'}
            </button>
          </Form>
        )}
      </Formik>

      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
}

'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCartStore } from '@/lib/store/useCart';
import { useAuth } from '@/lib/useAuth';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart } = useCartStore();
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const totalPrice = items.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  const initialValues = {
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    note: '',
  };

  const validationSchema = Yup.object({
    name: Yup.string().required('Vui lòng nhập họ tên'),
    email: Yup.string()
      .email('Email không hợp lệ')
      .required('Vui lòng nhập email'),
    phone: Yup.string().required('Vui lòng nhập số điện thoại'),
    address: Yup.string().required('Vui lòng nhập địa chỉ'),
    note: Yup.string(),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    if (!items.length) {
      setMessage('Giỏ hàng đang trống!');
      setSubmitting(false);
      return;
    }

    setLoading(true);

    try {
      console.log('Gửi dữ liệu đơn hàng:', {
        user,
        items,
        values,
      });

      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userId: user.id,
          items: items.map((item) => ({
            productId: item.id,
            quantity: item.qty,
            price: item.price,
            image: item.imageUrl,
          })),
          receiverName: values.name,
          phone: values.phone,
          address: values.address,
          note: values.note,
        }),
      });

      console.log('Kết quả từ /api/orders:', orderRes.status);
      const orderData = await orderRes.json();
      console.log('Nội dung trả về:', orderData);

      if (!orderRes.ok) {
        throw new Error(orderData.error || 'Không tạo được đơn hàng.');
      }

      if (!orderData.order?.id) {
        throw new Error('Không có ID đơn hàng hợp lệ.');
      }

      const vnpayRes = await fetch('/api/payment/vnpay/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: totalPrice,
          orderId: orderData.order.id,
          orderInfo: `Thanh toán đơn hàng #${orderData.order.id}`,
        }),
      });

      console.log('Kết quả từ /api/payment/vnpay/checkout:', vnpayRes.status);
      const vnpayData = await vnpayRes.json();
      console.log('VNPay data:', vnpayData);

      if (!vnpayRes.ok || !vnpayData.paymentUrl) {
        throw new Error(
          vnpayData.error || 'Không tạo được liên kết thanh toán VNPay.'
        );
      }

      console.log('Chuyển hướng đến VNPay sau 2s...');
      router.push('/payment/pending');

      setTimeout(() => {
        clearCart();
        window.location.href = vnpayData.paymentUrl;
      }, 2000);
    } catch (err) {
      console.error('Lỗi khi thanh toán:', err);
      setMessage(err.message || 'Đã xảy ra lỗi!');
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  const labels = {
    name: 'Họ và tên',
    email: 'Email',
    phone: 'Số điện thoại',
    address: 'Địa chỉ',
  };

  return (
    <div className="max-w-5xl mx-auto mt-6 p-6 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-4">Thanh toán</h1>

      {items.length === 0 ? (
        <div className="text-center">
          <p>Giỏ hàng đang trống.</p>
          <Link href="/" className="text-blue-600 underline">
            Quay lại mua hàng
          </Link>
        </div>
      ) : (
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ isSubmitting }) => (
            <Form className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-lg font-semibold mb-3">
                  Thông tin người nhận
                </h2>
                {['name', 'email', 'phone', 'address'].map((field) => (
                  <div key={field} className="mb-3">
                    <label className="block mb-1">{labels[field]}</label>
                    <Field
                      type="text"
                      name={field}
                      className="w-full border p-2 rounded"
                    />
                    <ErrorMessage
                      name={field}
                      component="div"
                      className="text-red-500 text-sm"
                    />
                  </div>
                ))}

                <div className="mb-3">
                  <label className="block mb-1">Ghi chú</label>
                  <Field
                    as="textarea"
                    name="note"
                    rows="3"
                    className="w-full border p-2 rounded"
                  />
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold mb-3">Đơn hàng của bạn</h2>
                <div className="border rounded-lg p-4 bg-gray-50">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between mb-3"
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={item.imageUrl || '/no-image.jpg'}
                          alt={item.name}
                          className="w-14 h-14 object-cover rounded border"
                        />
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-500">
                            Số lượng: {item.qty}
                          </p>
                        </div>
                      </div>
                      <span className="font-semibold">
                        {(item.price * item.qty).toLocaleString()} đ
                      </span>
                    </div>
                  ))}
                  <div className="border-t pt-2 font-bold mt-3 flex justify-between">
                    <span>Tổng cộng:</span>
                    <span>{totalPrice.toLocaleString()} đ</span>
                  </div>
                </div>

                {message && <p className="text-red-500 mt-2">{message}</p>}

                <button
                  type="submit"
                  disabled={isSubmitting || loading}
                  className="w-full bg-blue-600 text-white py-2 rounded mt-4 hover:bg-blue-700 transition"
                >
                  {isSubmitting || loading
                    ? 'Đang xử lý...'
                    : 'Thanh toán qua VNPay'}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      )}
    </div>
  );
}

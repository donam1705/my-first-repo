'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCartStore } from '@/lib/store/useCart';
import { useAuth } from '@/lib/useAuth';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { CreditCard, Truck, Banknote } from 'lucide-react';

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
    paymentMethod: 'VNPAY',
  };

  const validationSchema = Yup.object({
    name: Yup.string().required('Vui lòng nhập họ tên'),
    email: Yup.string()
      .email('Email không hợp lệ')
      .required('Vui lòng nhập email'),
    phone: Yup.string().required('Vui lòng nhập số điện thoại'),
    address: Yup.string().required('Vui lòng nhập địa chỉ'),
    paymentMethod: Yup.string().required(
      'Vui lòng chọn phương thức thanh toán'
    ),
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

      const orderData = await orderRes.json();
      if (!orderRes.ok)
        throw new Error(orderData.error || 'Không tạo được đơn hàng.');

      const orderId = orderData.order?.id;
      if (!orderId) throw new Error('Không tìm thấy ID đơn hàng hợp lệ.');

      if (values.paymentMethod === 'VNPAY') {
        const vnpayRes = await fetch('/api/payment/vnpay/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: totalPrice,
            orderId,
            orderInfo: `Thanh toán đơn hàng #${orderId}`,
          }),
        });
        const vnpayData = await vnpayRes.json();
        if (!vnpayRes.ok || !vnpayData.paymentUrl) {
          throw new Error(
            vnpayData.error || 'Không tạo được liên kết thanh toán VNPay.'
          );
        }
        router.push('/payment/pending');
        setTimeout(() => {
          clearCart();
          window.location.href = vnpayData.paymentUrl;
        }, 2000);
      } else if (values.paymentMethod === 'COD') {
        await fetch('/api/payment/cod/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId }),
        });
        clearCart();
        router.push(`/payment/success?method=COD&orderId=${orderId}`);
      } else if (values.paymentMethod === 'BANK_TRANSFER') {
        router.push(`/payment/bank?orderId=${orderId}&amount=${totalPrice}`);
      }
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
    <div className="max-w-5xl mx-auto mt-8 p-8 bg-white rounded-2xl shadow-lg">
      {' '}
      <h1 className="text-3xl font-extrabold mb-6 text-blue-700 text-center">
        Xác nhận thanh toán
      </h1>
      {items.length === 0 ? (
        <div className="text-center">
          <p className="text-gray-600 mb-3">Giỏ hàng đang trống.</p>
          <Link href="/" className="text-blue-600 underline font-medium">
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
          {({ isSubmitting, values, setFieldValue }) => (
            <Form className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-lg font-semibold mb-4 text-gray-800">
                  Thông tin người nhận
                </h2>
                {['name', 'email', 'phone', 'address'].map((field) => (
                  <div key={field} className="mb-3">
                    <label className="block mb-1 font-medium text-gray-700">
                      {labels[field]}
                    </label>
                    <Field
                      type="text"
                      name={field}
                      className="w-full border border-gray-300 p-2 rounded-lg focus:ring focus:ring-blue-200"
                    />
                    <ErrorMessage
                      name={field}
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>
                ))}

                <div className="mb-4">
                  <label className="block mb-1 font-medium text-gray-700">
                    Ghi chú (tùy chọn)
                  </label>
                  <Field
                    as="textarea"
                    name="note"
                    rows="3"
                    className="w-full border border-gray-300 p-2 rounded-lg"
                  />
                </div>

                <div className="mt-6">
                  <h3 className="font-semibold mb-3 text-gray-800">
                    Phương thức thanh toán
                  </h3>
                  <div className="space-y-3">
                    <label
                      className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition ${
                        values.paymentMethod === 'VNPAY'
                          ? 'border-blue-600 bg-blue-50'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setFieldValue('paymentMethod', 'VNPAY')}
                    >
                      <CreditCard className="text-blue-600" size={22} />
                      <span className="font-medium">Thanh toán qua VNPay</span>
                    </label>

                    <label
                      className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition ${
                        values.paymentMethod === 'BANK_TRANSFER'
                          ? 'border-green-600 bg-green-50'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() =>
                        setFieldValue('paymentMethod', 'BANK_TRANSFER')
                      }
                    >
                      <Banknote className="text-green-600" size={22} />
                      <span className="font-medium">
                        Chuyển khoản ngân hàng
                      </span>
                    </label>

                    <label
                      className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition ${
                        values.paymentMethod === 'COD'
                          ? 'border-orange-600 bg-orange-50'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setFieldValue('paymentMethod', 'COD')}
                    >
                      <Truck className="text-orange-600" size={22} />
                      <span className="font-medium">
                        Thanh toán khi nhận hàng (COD)
                      </span>
                    </label>
                  </div>
                  <ErrorMessage
                    name="paymentMethod"
                    component="div"
                    className="text-red-500 text-sm mt-2"
                  />
                </div>
              </div>

              <div>
                {' '}
                <h2 className="text-lg font-semibold mb-3">
                  Đơn hàng của bạn
                </h2>{' '}
                <div className="border rounded-lg p-4 bg-gray-50">
                  {' '}
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between mb-3"
                    >
                      {' '}
                      <div className="flex items-center gap-4">
                        {' '}
                        <img
                          src={item.imageUrl || '/no-image.jpg'}
                          alt={item.name}
                          className="w-14 h-14 object-cover rounded border"
                        />{' '}
                        <div>
                          {' '}
                          <p className="font-medium">{item.name}</p>{' '}
                          <p className="text-sm text-gray-500">
                            {' '}
                            Số lượng: {item.qty}{' '}
                          </p>{' '}
                        </div>{' '}
                      </div>{' '}
                      <span className="font-semibold">
                        {' '}
                        {(item.price * item.qty).toLocaleString()} đ{' '}
                      </span>{' '}
                    </div>
                  ))}{' '}
                  <div className="border-t pt-2 font-bold mt-3 flex justify-between">
                    {' '}
                    <span>Tổng cộng:</span>{' '}
                    <span>{totalPrice.toLocaleString()} đ</span>{' '}
                  </div>{' '}
                </div>{' '}
                {message && <p className="text-red-500 mt-2">{message}</p>}{' '}
                <button
                  type="submit"
                  disabled={isSubmitting || loading}
                  className="w-full bg-blue-600 text-white py-2 rounded mt-4 hover:bg-blue-700 transition"
                >
                  {' '}
                  {isSubmitting || loading
                    ? 'Đang xử lý...'
                    : 'Xác nhận thanh toán'}{' '}
                </button>{' '}
              </div>
            </Form>
          )}
        </Formik>
      )}
    </div>
  );
}

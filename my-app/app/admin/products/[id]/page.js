'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const ProductSchema = Yup.object().shape({
  name: Yup.string().required('Tên sản phẩm không được để trống'),
  sku: Yup.string().required('Mã SKU là bắt buộc'),
  price: Yup.number()
    .typeError('Giá phải là số')
    .positive('Giá phải lớn hơn 0')
    .required('Giá không được để trống'),
  qty: Yup.number()
    .typeError('Số lượng phải là số')
    .integer('Số lượng phải là số nguyên')
    .min(0, 'Số lượng không hợp lệ')
    .required('Số lượng không được để trống'),
  categoryId: Yup.string().required('Vui lòng chọn danh mục'),
  description: Yup.string().max(1000, 'Mô tả tối đa 1000 ký tự'),
});

export default function EditProductPage() {
  const { id } = useParams();
  const router = useRouter();

  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const [productRes, categoryRes] = await Promise.all([
          fetch(`/api/products/${id}`),
          fetch('/api/categories'),
        ]);

        const productData = productRes.ok ? await productRes.json() : null;
        const categoriesData = categoryRes.ok ? await categoryRes.json() : [];

        setProduct(productData);
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu sản phẩm:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (res.ok) {
        alert('Cập nhật sản phẩm thành công!');
        router.push('/admin/products');
      } else {
        const err = await res.json();
        alert('Lỗi: ' + (err.error || 'Không xác định'));
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật sản phẩm:', error);
      alert('Không thể cập nhật sản phẩm.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="p-6 text-gray-600">Đang tải dữ liệu...</p>;
  if (!product)
    return <p className="p-6 text-red-500">Không tìm thấy sản phẩm.</p>;

  return (
    <main className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Chỉnh sửa sản phẩm
        </h1>

        <Formik
          initialValues={{
            name: product.name || '',
            sku: product.sku || '',
            price: product.price || '',
            qty: product.qty || '',
            imageUrl: product.imageUrl || '',
            description: product.description || '',
            categoryId: product.categoryId ? String(product.categoryId) : '',
          }}
          validationSchema={ProductSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ isSubmitting, setFieldValue, values }) => (
            <Form className="grid gap-4">
              <div>
                <label className="font-medium text-gray-700">
                  Tên sản phẩm
                </label>
                <Field
                  name="name"
                  className="border p-2 rounded w-full"
                  placeholder="Nhập tên sản phẩm"
                />
                <ErrorMessage
                  name="name"
                  component="p"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              <div>
                <label className="font-medium text-gray-700">Mã SKU</label>
                <Field
                  name="sku"
                  className="border p-2 rounded w-full"
                  placeholder="Mã SKU"
                />
                <ErrorMessage
                  name="sku"
                  component="p"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              <div>
                <label className="font-medium text-gray-700">Giá (₫)</label>
                <Field
                  type="number"
                  name="price"
                  className="border p-2 rounded w-full"
                  placeholder="Nhập giá sản phẩm"
                />
                <ErrorMessage
                  name="price"
                  component="p"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              <div>
                <label className="font-medium text-gray-700">
                  Số lượng tồn kho
                </label>
                <Field
                  type="number"
                  name="qty"
                  className="border p-2 rounded w-full"
                  placeholder="Nhập số lượng"
                />
                <ErrorMessage
                  name="qty"
                  component="p"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              <div>
                <label className="font-medium text-gray-700">Danh mục</label>
                <Field
                  as="select"
                  name="categoryId"
                  className="border p-2 rounded w-full"
                >
                  <option value="">-- Chọn danh mục --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Field>
                <ErrorMessage
                  name="categoryId"
                  component="p"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              <div>
                <label className="font-medium text-gray-700">
                  Mô tả sản phẩm
                </label>
                <Field
                  as="textarea"
                  name="description"
                  rows="4"
                  placeholder="Nhập mô tả sản phẩm..."
                  className="border p-2 rounded w-full resize-none"
                />
                <ErrorMessage
                  name="description"
                  component="p"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              <div>
                <label className="font-medium text-gray-700">
                  Ảnh sản phẩm
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;

                    const formData = new FormData();
                    formData.append('file', file);

                    try {
                      const res = await fetch('/api/upload', {
                        method: 'POST',
                        body: formData,
                      });

                      const data = await res.json();
                      if (res.ok) {
                        alert('Tải ảnh thành công!');
                        setFieldValue('imageUrl', data.url);
                      } else {
                        alert(
                          'Lỗi tải ảnh: ' + (data.error || 'Không xác định')
                        );
                      }
                    } catch (err) {
                      alert('Upload thất bại: ' + err.message);
                    }
                  }}
                  className="border p-2 rounded w-full mb-2"
                />

                {values.imageUrl && (
                  <img
                    src={values.imageUrl}
                    alt="Ảnh sản phẩm"
                    className="w-40 h-40 object-cover rounded border mt-2"
                  />
                )}
              </div>

              <div className="flex justify-between mt-6">
                <button
                  type="button"
                  onClick={() => router.push('/admin/products')}
                  className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                >
                  Quay lại
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </main>
  );
}

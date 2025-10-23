'use client';
import { useEffect, useState } from 'react';
import { useProductStore } from '@/lib/store/useProduct';
import { useCategoryStore } from '@/lib/store/useCategory';
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

export default function AdminProductsPage() {
  const { products, fetchProducts, addProduct, updateProduct, deleteProduct } =
    useProductStore();
  const { categories, fetchCategories } = useCategoryStore();

  const [editing, setEditing] = useState(null);
  const [previewImage, setPreviewImage] = useState('');

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  const handleSubmit = async (values, { resetForm, setSubmitting }) => {
    const method = editing ? 'PUT' : 'POST';
    const url = editing ? `/api/products/${editing}` : '/api/products';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (res.ok) {
        if (editing) updateProduct(editing, data);
        else addProduct(data);
        setEditing(null);
        resetForm();
        setPreviewImage('');
      } else {
        alert('Lỗi khi lưu sản phẩm: ' + (data.error || 'Không xác định'));
      }
    } catch (err) {
      alert('Không thể lưu sản phẩm: ' + err.message);
    }

    setSubmitting(false);
  };

  const handleDelete = async (id) => {
    if (confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) deleteProduct(id);
    }
  };

  const getInitialValues = () => {
    if (!editing) {
      return {
        name: '',
        sku: '',
        price: '',
        qty: '',
        imageUrl: '',
        categoryId: '',
        description: '',
      };
    }
    const product = products.find((p) => p.id === editing);
    return {
      name: product?.name || '',
      sku: product?.sku || '',
      price: product?.price || '',
      qty: product?.qty || '',
      imageUrl: product?.imageUrl || '',
      categoryId: product?.categoryId || '',
      description: product?.description || '',
    };
  };

  return (
    <main className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Quản lý sản phẩm
        </h1>

        <Formik
          enableReinitialize
          initialValues={getInitialValues()}
          validationSchema={ProductSchema}
          onSubmit={handleSubmit}
        >
          {({
            isSubmitting,
            resetForm,
            setFieldValue,
            status,
            setStatus,
            values,
          }) => (
            <Form className="grid md:grid-cols-2 gap-4 mb-8">
              <div>
                <label className="block font-medium text-gray-700 mb-1">
                  Tên sản phẩm
                </label>
                <Field
                  name="name"
                  placeholder="Nhập tên sản phẩm"
                  className="border p-2 rounded w-full"
                />
                <ErrorMessage
                  name="name"
                  component="p"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">
                  Mã SKU
                </label>
                <Field
                  name="sku"
                  placeholder="Mã SKU"
                  className="border p-2 rounded w-full"
                />
                <ErrorMessage
                  name="sku"
                  component="p"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">
                  Giá sản phẩm (₫)
                </label>
                <Field
                  type="number"
                  name="price"
                  placeholder="Giá sản phẩm"
                  className="border p-2 rounded w-full"
                />
                <ErrorMessage
                  name="price"
                  component="p"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">
                  Số lượng
                </label>
                <Field
                  type="number"
                  name="qty"
                  placeholder="Số lượng"
                  className="border p-2 rounded w-full"
                />
                <ErrorMessage
                  name="qty"
                  component="p"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">
                  Danh mục
                </label>
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
                <label className="block font-medium text-gray-700 mb-1">
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
                        setFieldValue('imageUrl', data.url);
                        setPreviewImage(data.url);
                        setStatus({ success: 'Tải ảnh thành công!' });
                      } else {
                        setStatus({ error: 'Lỗi tải ảnh: ' + data.error });
                      }
                    } catch (err) {
                      setStatus({ error: 'Upload thất bại: ' + err.message });
                    }
                  }}
                  className="border p-2 rounded w-full"
                />

                {status?.success && (
                  <p className="text-green-600 text-sm mt-2">
                    {status.success}
                  </p>
                )}
                {status?.error && (
                  <p className="text-red-500 text-sm mt-2">{status.error}</p>
                )}

                {values.imageUrl && (
                  <div className="mt-3">
                    <img
                      src={values.imageUrl}
                      alt="Ảnh sản phẩm"
                      className="w-48 h-36 object-cover rounded border"
                    />
                  </div>
                )}
              </div>

              <div className="mb-4 col-span-2">
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Mô tả sản phẩm
                </label>
                <Field
                  as="textarea"
                  name="description"
                  placeholder="Nhập mô tả sản phẩm..."
                  rows={3}
                  className="border p-2 rounded w-full resize-none"
                />
                <ErrorMessage
                  name="description"
                  component="p"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              <div className="col-span-2 flex gap-3 mt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  {editing ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới'}
                </button>
                {editing && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(null);
                      resetForm();
                      setPreviewImage('');
                    }}
                    className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                  >
                    Hủy
                  </button>
                )}
              </div>
            </Form>
          )}
        </Formik>

        <div className="mt-8 overflow-x-auto">
          <table className="w-full border-collapse min-w-[800px]">
            <thead className="bg-gray-100 text-sm">
              <tr>
                <th className="border p-2">Ảnh</th>
                <th className="border p-2">Tên</th>
                <th className="border p-2">Giá</th>
                <th className="border p-2">SL</th>
                <th className="border p-2">Danh mục</th>
                <th className="border p-2">Mô tả</th>
                <th className="border p-2 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-t hover:bg-gray-50">
                  <td className="p-2 border text-center">
                    {p.imageUrl ? (
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="w-14 h-14 object-cover rounded"
                      />
                    ) : (
                      <span className="text-gray-400 italic">Không có</span>
                    )}
                  </td>
                  <td className="p-2 border">{p.name}</td>
                  <td className="p-2 border text-right">
                    {Number(p.price).toLocaleString()}₫
                  </td>
                  <td className="p-2 border text-center">{p.qty}</td>
                  <td className="p-2 border text-center">
                    {categories.find((c) => c.id === p.categoryId)?.name || '—'}
                  </td>
                  <td className="p-2 border text-sm text-gray-600 max-w-[200px] truncate">
                    {p.description || '—'}
                  </td>
                  <td className="p-2 border text-center">
                    <button
                      onClick={() => {
                        setEditing(p.id);
                        setPreviewImage(p.imageUrl || '');
                      }}
                      className="bg-blue-500 text-white px-3 py-1 rounded mr-2 hover:bg-blue-600"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {products.length === 0 && (
            <p className="text-center text-gray-500 mt-4">
              Chưa có sản phẩm nào.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}

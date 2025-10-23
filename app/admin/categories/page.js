'use client';
import { useEffect, useState } from 'react';
import { useCategoryStore } from '@/lib/store/useCategory';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const CategorySchema = Yup.object().shape({
  name: Yup.string()
    .required('Tên danh mục không được để trống')
    .min(2, 'Tên danh mục phải có ít nhất 2 ký tự'),
  description: Yup.string().max(200, 'Mô tả tối đa 200 ký tự').nullable(),
});

export default function AdminCategoriesPage() {
  const { categories, fetchCategories, addCategory, deleteCategory } =
    useCategoryStore();

  const [editingCategory, setEditingCategory] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleSubmit = async (values, { resetForm, setSubmitting }) => {
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi khi thêm danh mục');
      addCategory(data);
      resetForm();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (category) => {
    setEditingCategory(category);
  };

  const handleUpdate = async (values, { resetForm, setSubmitting }) => {
    try {
      const res = await fetch(`/api/categories/${editingCategory.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi khi cập nhật danh mục');
      fetchCategories();
      resetForm();
      setEditingCategory(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Bạn có chắc muốn xóa danh mục này?')) {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      if (res.ok) deleteCategory(id);
    }
  };

  return (
    <main className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Quản lý danh mục
        </h1>

        <Formik
          enableReinitialize
          initialValues={{
            name: editingCategory?.name || '',
            description: editingCategory?.description || '',
          }}
          validationSchema={CategorySchema}
          onSubmit={editingCategory ? handleUpdate : handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="grid sm:grid-cols-2 gap-4 mb-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Tên danh mục
                </label>
                <Field
                  name="name"
                  id="name"
                  placeholder="Tên danh mục"
                  className="border p-2 rounded w-full"
                />
                <ErrorMessage
                  name="name"
                  component="p"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Mô tả
                </label>
                <Field
                  as="textarea"
                  name="description"
                  id="description"
                  placeholder="Mô tả"
                  rows={1}
                  className="border p-2 rounded w-full resize-none"
                />
                <ErrorMessage
                  name="description"
                  component="p"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              <div className="col-span-2 flex items-center">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  {isSubmitting
                    ? editingCategory
                      ? 'Đang cập nhật...'
                      : 'Đang thêm...'
                    : editingCategory
                    ? 'Cập nhật danh mục'
                    : 'Thêm danh mục'}
                </button>
                {editingCategory && (
                  <button
                    type="button"
                    onClick={() => setEditingCategory(null)}
                    className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 pl-3 ml-3"
                  >
                    Hủy
                  </button>
                )}
              </div>
            </Form>
          )}
        </Formik>

        <div className="overflow-x-auto mt-4">
          <table className="w-full border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2 text-left">Tên</th>
                <th className="border p-2 text-left">Mô tả</th>
                <th className="border p-2 text-center w-40">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id} className="border-t hover:bg-gray-50">
                  <td className="p-2 border">{c.name}</td>
                  <td className="p-2 border text-gray-600">
                    {c.description || '-'}
                  </td>
                  <td className="p-2 border text-center">
                    <button
                      onClick={() => handleEditClick(c)}
                      className="bg-blue-500 text-white px-3 py-1 rounded mr-2 hover:bg-blue-600"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {categories.length === 0 && (
            <p className="text-center text-gray-500 mt-4">
              Chưa có danh mục nào.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}

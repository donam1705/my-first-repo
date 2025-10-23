'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function EditCategoryPage() {
  const { id } = useParams();
  const router = useRouter();

  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const res = await fetch(`/api/categories/${id}`);
        if (!res.ok) throw new Error(`Lỗi API: ${res.status}`);
        const text = await res.text();
        const data = text ? JSON.parse(text) : null;

        if (!data?.name) {
          setError('Không tìm thấy danh mục này.');
        } else {
          setName(data.name);
        }
      } catch (err) {
        console.error('Lỗi khi tải danh mục:', err);
        setError('Không thể tải dữ liệu danh mục.');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchCategory();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Tên danh mục không được để trống.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || `Lỗi API: ${res.status}`);
      }

      router.push('/admin/categories');
    } catch (err) {
      console.error('Lỗi khi cập nhật danh mục:', err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="p-6 text-gray-500">Đang tải dữ liệu danh mục...</div>
    );

  if (error && !name)
    return (
      <div className="p-6">
        <p className="text-red-500">{error}</p>
        <Link
          href="/admin/categories"
          className="text-blue-600 hover:underline"
        >
          Quay lại danh sách
        </Link>
      </div>
    );

  return (
    <main className="p-6 max-w-xl mx-auto bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Chỉnh sửa danh mục</h1>

      {error && <p className="text-red-500 mb-3">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium text-gray-700 mb-1">
            Tên danh mục
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex justify-between items-center">
          <Link
            href="/admin/categories"
            className="text-gray-600 bg-gray-300 hover:bg-gray-200 px-5 py-2 rounded-md"
          >
            Quay lại
          </Link>

          <button
            type="submit"
            disabled={saving}
            className={`px-5 py-2 rounded-md text-white ${
              saving
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </form>
    </main>
  );
}

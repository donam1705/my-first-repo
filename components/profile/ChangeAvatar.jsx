'use client';
import { useState, useEffect } from 'react';
import useSWR, { mutate } from 'swr';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function ChangeAvatar() {
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetcher = (url) => fetch(url).then((r) => (r.ok ? r.json() : null));
  const { data } = useSWR('/api/auth/me', fetcher);

  useEffect(() => {
    if (data?.avatarUrl) {
      setPreview(`${data.avatarUrl}`);
    }
  }, [data?.avatarUrl]);

  useEffect(() => {
    return () => {
      if (preview && preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (preview && preview.startsWith('blob:')) {
      URL.revokeObjectURL(preview);
    }
    setFile(selectedFile);
    if (selectedFile) {
      const objUrl = URL.createObjectURL(selectedFile);
      setPreview(objUrl);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Vui lòng chọn ảnh');
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      setLoading(true);
      const res = await fetch('/api/auth/avatar', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        toast.error('Upload thất bại!');
      } else {
        const result = await res.json().catch(() => ({}));
        if (result?.avatarUrl) {
          const newUrl = `${result.avatarUrl}?t=${Date.now()}`;
          setPreview(newUrl);
          await mutate('/api/auth/me');
        } else {
          setPreview(URL.createObjectURL(file));
          await mutate('/api/auth/me');
        }
        toast.success('Cập nhật avatar thành công!');
      }
    } catch (err) {
      console.error('Upload lỗi', err);
      toast.error('Có lỗi xảy ra khi upload');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-6 text-center text-gray-800">
        Đổi ảnh đại diện
      </h2>

      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <img
          src={preview || '/default-avatar.png'}
          alt="Preview"
          className="w-28 h-28 object-cover rounded-full border-2 border-gray-300 shadow-sm"
        />

        <div className="flex-1 w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Chọn ảnh mới
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4
                   file:rounded-full file:border-0
                   file:text-sm file:font-semibold
                   file:bg-blue-50 file:text-blue-700
                   hover:file:bg-blue-100"
          />
          <p className="text-xs text-gray-400 mt-1">
            Hỗ trợ định dạng JPG, PNG.
          </p>

          <button
            onClick={handleUpload}
            disabled={loading}
            className="mt-4 w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-md transition disabled:opacity-50"
          >
            {loading ? 'Đang tải...' : 'Cập nhật'}
          </button>
        </div>
      </div>

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

'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Link from 'next/link';
import ConfirmModal from '@/components/ConfirmModal';

export default function WishlistPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmAction, setConfirmAction] = useState(null);

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/wishlist', { credentials: 'include' });
      if (res.status === 401) {
        router.push('/auth/login');
        return;
      }
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Lỗi lấy wishlist', err);
      toast.error('Không thể tải danh sách yêu thích');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = (productId) => {
    setConfirmMessage('Bạn có chắc muốn xóa sản phẩm này khỏi yêu thích?');
    setConfirmAction(() => async () => {
      try {
        const res = await fetch('/api/wishlist', {
          method: 'DELETE',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId }),
        });
        if (res.status === 401) {
          router.push('/auth/login');
          return;
        }
        const data = await res.json();
        if (!res.ok) {
          toast.error(data?.error || 'Xóa thất bại');
          return;
        }
        setItems((prev) =>
          prev.filter((it) => {
            const id = it.productId ?? it.product?.id;
            return id !== productId;
          })
        );
        toast.success('Đã xóa khỏi yêu thích');
      } catch (err) {
        console.error('Xóa wishlist lỗi', err);
        toast.error('Có lỗi xảy ra');
      }
    });
    setConfirmOpen(true);
  };

  if (loading) {
    return <p className="text-center text-gray-500 mt-8">Đang tải...</p>;
  }

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Sản phẩm yêu thích</h1>

      {items.length === 0 ? (
        <p className="text-gray-600">Bạn chưa có sản phẩm yêu thích nào.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((it) => {
            const p = it.product || it;
            const productId = p.id ?? it.productId;
            return (
              <div
                key={productId}
                className="border rounded-lg p-4 flex gap-4 items-start"
              >
                <img
                  src={p.image || p.thumbnail || '/default-product.png'}
                  alt={p.name}
                  className="w-28 h-20 object-cover rounded"
                />
                <div className="flex-1">
                  <Link
                    href={`/products/${productId}`}
                    className="text-lg font-semibold hover:underline"
                  >
                    {p.name}
                  </Link>
                  <p className="text-sm text-gray-500 mt-1">
                    {p.description?.slice(0, 120)}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-blue-600 font-bold">
                      {(p.price || 0).toLocaleString()} ₫
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRemove(productId)}
                        className="px-3 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100"
                      >
                        Bỏ yêu thích
                      </button>
                      {/* <Link
                        href={`/products/${productId}`}
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Xem
                      </Link> */}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="light"
      />

      {confirmOpen && (
        <ConfirmModal
          message={confirmMessage}
          onConfirm={async () => {
            if (confirmAction) await confirmAction();
            setConfirmOpen(false);
            setConfirmAction(null);
          }}
          onCancel={() => {
            setConfirmOpen(false);
            setConfirmAction(null);
          }}
        />
      )}
    </main>
  );
}

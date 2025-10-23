'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { Loader2 } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    categories: 0,
    products: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [categoriesRes, productsRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/products'),
        ]);

        const safeJson = async (res) => {
          if (!res.ok) {
            console.warn(`API lỗi (${res.status}): ${res.url}`);
            return [];
          }
          const text = await res.text();
          try {
            return text ? JSON.parse(text) : [];
          } catch {
            console.error(`API không trả JSON hợp lệ: ${res.url}`);
            return [];
          }
        };

        const categoriesData = await safeJson(categoriesRes);
        const productsData = await safeJson(productsRes);

        setStats({
          categories: Array.isArray(categoriesData) ? categoriesData.length : 0,
          products: Array.isArray(productsData) ? productsData.length : 0,
        });
      } catch (err) {
        console.error('Lỗi khi tải thống kê:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const data = [
    { name: 'Categories', value: stats.categories, color: '#22c55e' },
    { name: 'Products', value: stats.products, color: '#ef4444' },
  ];

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="animate-spin text-blue-500 mr-2" />
        <span className="text-gray-600">Đang tải thống kê...</span>
      </div>
    );

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Categories"
          value={stats.categories}
          color="bg-green-500"
          href="/admin/categories"
        />
        <StatCard
          title="Products"
          value={stats.products}
          color="bg-red-500"
          href="/admin/products"
        />
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          Tổng quan dữ liệu
        </h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, value }) => `${name}: ${value}`}
              >
                {data.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, color, href }) {
  return (
    <Link href={href}>
      <div
        className={`${color} text-white rounded-xl p-5 shadow hover:shadow-lg transform hover:scale-[1.03] transition duration-150`}
      >
        <h3 className="text-sm uppercase tracking-wide opacity-90">{title}</h3>
        <p className="text-4xl font-bold mt-2">{value}</p>
      </div>
    </Link>
  );
}

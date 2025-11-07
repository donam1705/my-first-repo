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
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { Loader2, TrendingUp, DollarSign, CalendarDays } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    categories: 0,
    products: 0,
    orders: [],
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('month');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [categoriesRes, productsRes, ordersRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/products'),
          fetch('/api/orders'),
        ]);

        const safeJson = async (res) => {
          if (!res.ok) return [];
          const text = await res.text();
          try {
            return text ? JSON.parse(text) : [];
          } catch {
            return [];
          }
        };

        const [categoriesData, productsData, ordersData] = await Promise.all([
          safeJson(categoriesRes),
          safeJson(productsRes),
          safeJson(ordersRes),
        ]);

        setStats({
          categories: Array.isArray(categoriesData) ? categoriesData.length : 0,
          products: Array.isArray(productsData) ? productsData.length : 0,
          orders: Array.isArray(ordersData) ? ordersData : [],
        });
      } catch (err) {
        console.error('Lỗi khi tải thống kê:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const revenueByPeriod = () => {
    const paidOrders = stats.orders.filter((o) => o.status === 'PAID');
    const result = {};

    paidOrders.forEach((o) => {
      const date = new Date(o.createdAt);
      let key;

      if (filter === 'month') {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
          2,
          '0'
        )}`;
      } else if (filter === 'quarter') {
        const q = Math.floor(date.getMonth() / 3) + 1;
        key = `Q${q}-${date.getFullYear()}`;
      } else {
        key = `${date.getFullYear()}`;
      }

      result[key] = (result[key] || 0) + o.totalAmount;
    });

    return Object.entries(result).map(([period, total]) => ({ period, total }));
  };

  const revenueData = revenueByPeriod();
  const totalRevenue = revenueData.reduce((sum, r) => sum + r.total, 0);
  const avgRevenue = revenueData.length ? totalRevenue / revenueData.length : 0;

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="animate-spin text-blue-500 mr-2" />
        <span className="text-gray-600">Đang tải thống kê...</span>
      </div>
    );

  const pieData = [
    { name: 'Danh mục', value: stats.categories, color: '#3b82f6' },
    { name: 'Sản phẩm', value: stats.products, color: '#22c55e' },
  ];

  return (
    <div className="space-y-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Bảng điều khiển</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Danh mục"
          value={stats.categories}
          color="bg-blue-500"
          href="/admin/categories"
        />
        <StatCard
          title="Sản phẩm"
          value={stats.products}
          color="bg-green-500"
          href="/admin/products"
        />
        <StatCard
          title="Đơn đã thanh toán"
          value={stats.orders.filter((o) => o.status === 'PAID').length}
          color="bg-indigo-500"
          href="/admin/orders"
        />
        <StatCard
          title="Tổng doanh thu"
          value={`${totalRevenue.toLocaleString()} đ`}
          color="bg-purple-600"
          href="/admin/orders"
        />
      </div>

      <div className="flex items-center gap-4 mt-6">
        <label className="text-gray-700 font-medium flex items-center gap-2">
          <CalendarDays size={18} />
          Lọc theo:
        </label>
        {['month', 'quarter', 'year'].map((opt) => (
          <button
            key={opt}
            onClick={() => setFilter(opt)}
            className={`px-4 py-1 rounded-lg border text-sm transition ${
              filter === opt
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white border-gray-300 hover:bg-gray-100'
            }`}
          >
            {opt === 'month' ? 'Tháng' : opt === 'quarter' ? 'Quý' : 'Năm'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
        <ChartCard title="Phân bố dữ liệu">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, value }) => `${name}: ${value}`}
              >
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title={`Doanh thu theo ${
            filter === 'month' ? 'tháng' : filter === 'quarter' ? 'quý' : 'năm'
          }`}
        >
          {revenueData.length === 0 ? (
            <p className="text-gray-500 text-center pt-6">
              Chưa có dữ liệu doanh thu.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip formatter={(v) => `${v.toLocaleString()} đ`} />
                <Bar
                  dataKey="total"
                  fill="#2563eb"
                  barSize={45}
                  radius={[6, 6, 0, 0]}
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={false}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      <div className="bg-white rounded-xl shadow p-6 mt-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Tóm tắt doanh thu
        </h3>
        <div className="grid sm:grid-cols-3 gap-6 text-center">
          <SummaryItem
            icon={<DollarSign className="mx-auto text-blue-500" />}
            label="Tổng doanh thu"
            value={`${totalRevenue.toLocaleString()} đ`}
          />
          <SummaryItem
            icon={<TrendingUp className="mx-auto text-green-500" />}
            label="Doanh thu trung bình"
            value={`${avgRevenue.toLocaleString()} đ`}
          />
          <SummaryItem
            icon={<CalendarDays className="mx-auto text-purple-500" />}
            label="Số kỳ dữ liệu"
            value={revenueData.length}
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, color, href }) {
  return (
    <Link href={href}>
      <div
        className={`${color} text-white rounded-xl p-5 shadow hover:shadow-lg transition transform hover:scale-[1.03] duration-150`}
      >
        <h3 className="text-sm uppercase tracking-wide opacity-90">{title}</h3>
        <p className="text-3xl font-bold mt-1">{value}</p>
      </div>
    </Link>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
      <h2 className="text-base font-semibold text-gray-700 mb-4">{title}</h2>
      <div className="h-72">{children}</div>
    </div>
  );
}

function SummaryItem({ icon, label, value }) {
  return (
    <div className="p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition">
      {icon}
      <p className="text-gray-600 mt-2">{label}</p>
      <p className="font-bold text-lg">{value}</p>
    </div>
  );
}

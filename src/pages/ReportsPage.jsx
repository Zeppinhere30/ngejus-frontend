// src/pages/ReportsPage.jsx

import { useMemo, useState } from 'react';

import { FiTrendingUp, FiDollarSign, FiShoppingBag, FiUsers, FiCalendar, FiDownload, FiFilter, FiBarChart2, FiPieChart, FiArrowUpRight, FiArrowDownRight, FiBox, FiStar } from 'react-icons/fi';

const salesData = [
  {
    id: 1,
    product: 'Green Detox',
    category: 'Healthy Juice',
    qty: 120,
    revenue: 3360000,
  },

  {
    id: 2,
    product: 'Berry Smoothie',
    category: 'Smoothies',
    qty: 92,
    revenue: 2944000,
  },

  {
    id: 3,
    product: 'Chicken Salad Bowl',
    category: 'Protein Salad',
    qty: 61,
    revenue: 2562000,
  },

  {
    id: 4,
    product: 'Caesar Salad',
    category: 'Fresh Salad',
    qty: 54,
    revenue: 1890000,
  },

  {
    id: 5,
    product: 'Orange Fresh',
    category: 'Fruit Juice',
    qty: 78,
    revenue: 1872000,
  },
];

const monthlySales = [
  { month: 'Jan', value: 4200000 },
  { month: 'Feb', value: 5100000 },
  { month: 'Mar', value: 6800000 },
  { month: 'Apr', value: 7200000 },
  { month: 'Mei', value: 8600000 },
  { month: 'Jun', value: 9200000 },
];

const fmt = (n) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(n);

export default function ReportsPage() {
  const [filter, setFilter] = useState('Bulanan');

  const totalRevenue = useMemo(() => {
    return salesData.reduce((a, b) => a + b.revenue, 0);
  }, []);

  const totalOrders = useMemo(() => {
    return salesData.reduce((a, b) => a + b.qty, 0);
  }, []);

  const bestSeller = salesData.reduce((a, b) => (a.qty > b.qty ? a : b));

  const totalCustomers = 284;

  return (
    <div
      style={{
        padding: 32,
        background: '#F8FAFC',
        minHeight: '100vh',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 30,
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: 34,
              fontWeight: 800,
              color: '#0F172A',
            }}
          >
            Laporan Bisnis
          </h1>

          <p
            style={{
              marginTop: 8,
              color: '#64748B',
              fontSize: 14,
            }}
          >
            Analisis penjualan, produk, dan performa bisnis
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            gap: 12,
          }}
        >
          {/* FILTER */}
          <button
            style={{
              height: 52,
              padding: '0 18px',
              borderRadius: 14,
              border: '1px solid #E2E8F0',
              background: '#fff',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            <FiFilter size={16} />
            {filter}
          </button>

          {/* EXPORT */}
          <button
            style={{
              height: 52,
              padding: '0 22px',
              borderRadius: 14,
              border: 'none',
              background: 'linear-gradient(135deg,#0F172A,#1E293B)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 12px 30px rgba(15,23,42,.18)',
            }}
          >
            <FiDownload size={17} />
            Export PDF
          </button>
        </div>
      </div>

      {/* SUMMARY */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4,1fr)',
          gap: 20,
          marginBottom: 30,
        }}
      >
        {[
          {
            title: 'Total Pendapatan',
            value: fmt(totalRevenue),
            icon: <FiDollarSign size={22} />,
            color: '#16A34A',
            bg: '#ECFDF5',
            growth: '+18%',
          },

          {
            title: 'Total Order',
            value: totalOrders,
            icon: <FiShoppingBag size={22} />,
            color: '#2563EB',
            bg: '#EFF6FF',
            growth: '+12%',
          },

          {
            title: 'Pelanggan',
            value: totalCustomers,
            icon: <FiUsers size={22} />,
            color: '#EA580C',
            bg: '#FFF7ED',
            growth: '+9%',
          },

          {
            title: 'Best Seller',
            value: bestSeller.product,
            icon: <FiStar size={22} />,
            color: '#CA8A04',
            bg: '#FEFCE8',
            growth: 'Top',
          },
        ].map((card) => (
          <div
            key={card.title}
            style={{
              background: '#fff',
              borderRadius: 24,
              padding: 24,
              border: '1px solid #E2E8F0',
              boxShadow: '0 10px 30px rgba(0,0,0,.03)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'start',
                marginBottom: 18,
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 18,
                  background: card.bg,
                  color: card.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {card.icon}
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  color: '#16A34A',
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                <FiArrowUpRight size={14} />
                {card.growth}
              </div>
            </div>

            <div
              style={{
                fontSize: 28,
                fontWeight: 800,
                color: '#0F172A',
              }}
            >
              {card.value}
            </div>

            <div
              style={{
                marginTop: 6,
                fontSize: 13,
                color: '#64748B',
                fontWeight: 600,
              }}
            >
              {card.title}
            </div>
          </div>
        ))}
      </div>

      {/* CHART SECTION */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: 22,
          marginBottom: 28,
        }}
      >
        {/* SALES CHART */}
        <div
          style={{
            background: '#fff',
            borderRadius: 24,
            padding: 26,
            border: '1px solid #E2E8F0',
            boxShadow: '0 10px 30px rgba(0,0,0,.03)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: 28,
            }}
          >
            <div>
              <h3
                style={{
                  margin: 0,
                  fontSize: 20,
                  fontWeight: 800,
                  color: '#0F172A',
                }}
              >
                Grafik Penjualan
              </h3>

              <p
                style={{
                  marginTop: 6,
                  color: '#64748B',
                  fontSize: 13,
                }}
              >
                Pendapatan 6 bulan terakhir
              </p>
            </div>

            <div
              style={{
                width: 50,
                height: 50,
                borderRadius: 16,
                background: '#EFF6FF',
                color: '#2563EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FiBarChart2 size={22} />
            </div>
          </div>

          {/* BAR CHART */}
          <div
            style={{
              display: 'flex',
              alignItems: 'end',
              justifyContent: 'space-between',
              height: 260,
              gap: 16,
            }}
          >
            {monthlySales.map((item) => {
              const max = Math.max(...monthlySales.map((m) => m.value));

              const height = (item.value / max) * 100;

              return (
                <div
                  key={item.month}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'end',
                    height: '100%',
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      marginBottom: 10,
                      color: '#64748B',
                    }}
                  >
                    {(item.value / 1000000).toFixed(1)}
                    jt
                  </div>

                  <div
                    style={{
                      width: '100%',
                      height: `${height}%`,
                      borderRadius: '16px 16px 6px 6px',
                      background: 'linear-gradient(180deg,#2563EB,#60A5FA)',
                      boxShadow: '0 10px 20px rgba(37,99,235,.2)',
                    }}
                  />

                  <div
                    style={{
                      marginTop: 12,
                      fontSize: 13,
                      fontWeight: 700,
                      color: '#475569',
                    }}
                  >
                    {item.month}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CATEGORY */}
        <div
          style={{
            background: '#fff',
            borderRadius: 24,
            padding: 26,
            border: '1px solid #E2E8F0',
            boxShadow: '0 10px 30px rgba(0,0,0,.03)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: 24,
            }}
          >
            <div>
              <h3
                style={{
                  margin: 0,
                  fontSize: 20,
                  fontWeight: 800,
                  color: '#0F172A',
                }}
              >
                Kategori
              </h3>

              <p
                style={{
                  marginTop: 6,
                  color: '#64748B',
                  fontSize: 13,
                }}
              >
                Distribusi produk
              </p>
            </div>

            <div
              style={{
                width: 50,
                height: 50,
                borderRadius: 16,
                background: '#ECFDF5',
                color: '#16A34A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FiPieChart size={22} />
            </div>
          </div>

          {[
            {
              label: 'Healthy Juice',
              percent: 45,
              color: '#22C55E',
            },

            {
              label: 'Fresh Salad',
              percent: 28,
              color: '#2563EB',
            },

            {
              label: 'Smoothies',
              percent: 18,
              color: '#F59E0B',
            },

            {
              label: 'Protein Salad',
              percent: 9,
              color: '#EF4444',
            },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                marginBottom: 18,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: 8,
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                <span>{item.label}</span>

                <span>{item.percent}%</span>
              </div>

              <div
                style={{
                  height: 10,
                  background: '#F1F5F9',
                  borderRadius: 999,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${item.percent}%`,
                    height: '100%',
                    borderRadius: 999,
                    background: item.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TABLE */}
      <div
        style={{
          background: '#fff',
          borderRadius: 24,
          border: '1px solid #E2E8F0',
          overflow: 'hidden',
          boxShadow: '0 10px 30px rgba(0,0,0,.03)',
        }}
      >
        {/* TABLE HEADER */}
        <div
          style={{
            padding: 24,
            borderBottom: '1px solid #F1F5F9',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <h3
              style={{
                margin: 0,
                fontSize: 20,
                fontWeight: 800,
                color: '#0F172A',
              }}
            >
              Laporan Produk
            </h3>

            <p
              style={{
                marginTop: 6,
                color: '#64748B',
                fontSize: 13,
              }}
            >
              Produk terlaris dan performa penjualan
            </p>
          </div>

          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 16,
              background: '#FFF7ED',
              color: '#EA580C',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FiBox size={22} />
          </div>
        </div>

        {/* TABLE */}
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
          }}
        >
          <thead>
            <tr
              style={{
                background: '#F8FAFC',
              }}
            >
              {['Produk', 'Kategori', 'Terjual', 'Pendapatan', 'Trend'].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: '16px 20px',
                    textAlign: 'left',
                    fontSize: 12,
                    fontWeight: 700,
                    color: '#64748B',
                    textTransform: 'uppercase',
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {salesData.map((item) => (
              <tr
                key={item.id}
                style={{
                  borderTop: '1px solid #F1F5F9',
                }}
              >
                <td
                  style={{
                    padding: '18px 20px',
                    fontWeight: 700,
                    color: '#0F172A',
                  }}
                >
                  {item.product}
                </td>

                <td
                  style={{
                    padding: '18px 20px',
                    color: '#64748B',
                    fontSize: 14,
                  }}
                >
                  {item.category}
                </td>

                <td
                  style={{
                    padding: '18px 20px',
                    fontWeight: 700,
                  }}
                >
                  {item.qty}
                </td>

                <td
                  style={{
                    padding: '18px 20px',
                    color: '#16A34A',
                    fontWeight: 800,
                  }}
                >
                  {fmt(item.revenue)}
                </td>

                <td
                  style={{
                    padding: '18px 20px',
                  }}
                >
                  <span
                    style={{
                      background: '#ECFDF5',
                      color: '#15803D',
                      padding: '6px 12px',
                      borderRadius: 999,
                      fontSize: 12,
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <FiArrowUpRight size={12} />
                    Naik
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* STYLE */}
      <style>
        {`
          button {
            transition:.2s;
          }

          button:hover {
            transform:translateY(-1px);
          }

          tr {
            transition:.2s;
          }

          tr:hover {
            background:#FAFAFA;
          }
        `}
      </style>
    </div>
  );
}

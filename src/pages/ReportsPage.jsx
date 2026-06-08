// src/pages/ReportsPage.jsx
import { useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import { FiTrendingUp, FiDollarSign, FiShoppingBag, FiUsers, FiDownload, FiBarChart2, FiArrowUpRight, FiArrowDownRight, FiBox, FiStar, FiCalendar, FiLoader, FiPackage, FiRefreshCw, FiAlertCircle } from 'react-icons/fi';

const fmt = (n) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(n || 0);

const fmtShort = (n) => {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}Jt`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}Rb`;
  return String(n || 0);
};

// Mini bar chart component
const BarChart = ({ data = [], height = 140 }) => {
  const safeData = Array.isArray(data) ? data : [];
  const max = Math.max(...safeData.map((d) => d.value), 1);

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height, padding: '0 4px' }}>
      {safeData.map((d, i) => {
        const pct = (d.value / max) * 100;
        const isLast = i === safeData.length - 1;
        return (
          <div key={d.month || i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: isLast ? '#10B981' : '#94A3B8' }}>{fmtShort(d.value)}</div>
            <div
              style={{
                width: '100%',
                height: `${pct}%`,
                minHeight: 4,
                borderRadius: '6px 6px 0 0',
                background: isLast ? 'linear-gradient(180deg,#10B981,#059669)' : 'linear-gradient(180deg,#CBD5E1,#E2E8F0)',
                transition: 'height 0.6s cubic-bezier(0.34,1.56,0.64,1)',
                position: 'relative',
              }}
            >
              {isLast && (
                <div
                  style={{
                    position: 'absolute',
                    top: -2,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: '#10B981',
                    boxShadow: '0 0 0 3px rgba(16,185,129,0.2)',
                  }}
                />
              )}
            </div>
            <div style={{ fontSize: 10, fontWeight: 700, color: isLast ? '#053B2F' : '#94A3B8' }}>{d.month}</div>
          </div>
        );
      })}
    </div>
  );
};

// Donut chart component
const DonutChart = ({ segments = [], size = 120 }) => {
  const safeSegments = Array.isArray(segments) ? segments : [];
  const r = 40;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  let accumulated = 0;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F1F5F9" strokeWidth={16} />
      {safeSegments.map((seg, i) => {
        const dash = (seg.percent / 100) * circumference;
        const offset = circumference - (accumulated * circumference) / 100;
        accumulated += seg.percent;
        return (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={seg.color}
            strokeWidth={16}
            strokeDasharray={`${dash} ${circumference - dash}`}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform={`rotate(-90 ${cx} ${cy})`}
            style={{ transition: 'stroke-dasharray 0.8s ease' }}
          />
        );
      })}
      <text x={cx} y={cy - 4} textAnchor="middle" fontSize="11" fontWeight="800" fill="#0F172A">
        Total
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle" fontSize="9" fontWeight="600" fill="#64748B">
        Penjualan
      </text>
    </svg>
  );
};

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('today');
  const [salesReport, setSalesReport] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [orders, setOrders] = useState([]);
  const [exporting, setExporting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const printRef = useRef(null);

  useEffect(() => {
    loadData();
  }, [period]);

  const loadData = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const [dashRes, salesRes, ordersRes] = await Promise.all([
        api.get('/dashboard').catch(() => ({ data: {} })),
        api.get(`/reports/sales?period=${period}`).catch(() => ({ data: [] })),
        api.get('/orders?per_page=5&status=paid').catch(() => ({ data: [] })),
      ]);

      setDashboard(dashRes.data?.data || dashRes.data || null);
      setSalesReport(Array.isArray(salesRes.data?.data) ? salesRes.data.data : Array.isArray(salesRes.data) ? salesRes.data : []);

      const o = ordersRes.data?.data || ordersRes.data;
      setOrders(Array.isArray(o) ? o.slice(0, 5) : []);
    } catch (e) {
      console.error('Gagal mengambil data API:', e);
      setErrorMsg('Gagal memuat beberapa data dari server. Menampilkan data lokal.');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => {
      window.print();
      setExporting(false);
    }, 300);
  };

  // Safe Fallback Data
  const safeSalesReport =
    Array.isArray(salesReport) && salesReport.length > 0
      ? salesReport
      : [
          { id: 1, product: 'Green Detox', category: 'Healthy Juice', qty: 120, revenue: 3360000 },
          { id: 2, product: 'Berry Smoothie', category: 'Smoothies', qty: 92, revenue: 2944000 },
          { id: 3, product: 'Chicken Salad Bowl', category: 'Protein Salad', qty: 61, revenue: 2562000 },
          { id: 4, product: 'Caesar Salad', category: 'Fresh Salad', qty: 54, revenue: 1890000 },
          { id: 5, product: 'Orange Fresh', category: 'Fruit Juice', qty: 78, revenue: 1872000 },
        ];

  const totalRevLocal = safeSalesReport.reduce((a, b) => a + (b.revenue || b.total_revenue || 0), 0);
  const totalRevenue = dashboard?.total_revenue || totalRevLocal;
  const totalOrders = dashboard?.total_orders || 405;
  const totalProducts = dashboard?.total_products || safeSalesReport.length;

  let bestSellerName = '—';
  if (dashboard?.best_seller?.name) bestSellerName = dashboard.best_seller.name;
  else if (typeof dashboard?.best_seller === 'string') bestSellerName = dashboard.best_seller;
  else if (safeSalesReport[0]) bestSellerName = safeSalesReport[0].product || safeSalesReport[0].name || '—';

  const monthlySales = [
    { month: 'Jan', value: 4200000 },
    { month: 'Feb', value: 5100000 },
    { month: 'Mar', value: 6800000 },
    { month: 'Apr', value: 7200000 },
    { month: 'Mei', value: 8600000 },
    { month: 'Jun', value: totalRevenue },
  ];

  const categoryData = [
    { label: 'Jus Segar', percent: 45, color: '#10B981' },
    { label: 'Smoothie', percent: 28, color: '#3B82F6' },
    { label: 'Bowl', percent: 18, color: '#F59E0B' },
    { label: 'Lainnya', percent: 9, color: '#EF4444' },
  ];

  const periods = [
    { key: 'today', label: 'Hari Ini' },
    { key: 'week', label: '7 Hari' },
    { key: 'month', label: 'Bulan Ini' },
    { key: 'year', label: 'Tahun Ini' },
  ];

  return (
    <div ref={printRef} style={S.page}>
      <style>{`
        * { box-sizing: border-box; }
        .report-row { transition: background 0.15s; }
        .report-row:hover { background: #F0FDF4 !important; }
        .stat-card { transition: transform 0.2s, box-shadow 0.2s; }
        .stat-card:hover { transform: translateY(-4px); box-shadow: 0 20px 40px rgba(0,0,0,0.08) !important; }
        .period-btn { transition: all 0.2s; cursor: pointer; }
        .period-btn:hover { transform: translateY(-1px); }
        .export-btn { transition: transform 0.2s, box-shadow 0.2s; }
        .export-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 30px rgba(5,59,47,0.3) !important; }
        .refresh-btn { transition: transform 0.2s; cursor: pointer; }
        .refresh-btn:hover { transform: rotate(180deg); }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .fade-up { animation: fadeUp 0.4s ease both; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 4px; }
        @media print {
          body { background: white !important; }
          .no-print { display: none !important; }
          .stat-card { break-inside: avoid; }
        }
      `}</style>

      {/* HEADER */}
      <div style={S.header}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#ECFDF5', color: '#053B2F', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiBarChart2 size={20} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#64748B', letterSpacing: 1, textTransform: 'uppercase' }}>Analitik</span>
          </div>
          <h1 style={S.title}>Laporan Bisnis</h1>
          <p style={S.sub}>Performa penjualan & analisis produk NgeJus</p>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }} className="no-print">
          <div style={{ display: 'flex', background: '#fff', borderRadius: 12, border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
            {periods.map((p) => (
              <button
                key={p.key}
                className="period-btn"
                onClick={() => setPeriod(p.key)}
                style={{
                  padding: '10px 16px',
                  border: 'none',
                  background: period === p.key ? '#053B2F' : 'transparent',
                  color: period === p.key ? '#fff' : '#64748B',
                  fontWeight: 700,
                  fontSize: 13,
                  fontFamily: "'Plus Jakarta Sans',sans-serif",
                }}
              >
                {p.label}
              </button>
            ))}
          </div>

          <button
            className="refresh-btn"
            onClick={loadData}
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              border: '1px solid #E2E8F0',
              background: '#fff',
              color: '#64748B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
            }}
          >
            <FiRefreshCw size={17} className={loading ? 'spin' : ''} />
          </button>

          <button
            className="export-btn"
            onClick={handleExport}
            disabled={exporting}
            style={{
              height: 44,
              padding: '0 20px',
              borderRadius: 12,
              border: 'none',
              background: 'linear-gradient(135deg,#053B2F,#0F5C47)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontWeight: 700,
              fontSize: 14,
              boxShadow: '0 6px 20px rgba(5,59,47,0.25)',
              fontFamily: "'Plus Jakarta Sans',sans-serif",
            }}
          >
            {exporting ? <FiLoader className="spin" size={16} /> : <FiDownload size={16} />}
            Export PDF
          </button>
        </div>
      </div>

      {errorMsg && (
        <div
          style={{ background: '#FEF2F2', border: '1px solid #FECACA', padding: '12px 16px', borderRadius: 12, color: '#DC2626', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600 }}
          className="fade-up"
        >
          <FiAlertCircle size={18} /> {errorMsg}
        </div>
      )}

      {loading && !dashboard ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <FiLoader className="spin" size={36} color="#053B2F" />
          <div style={{ marginTop: 12, color: '#64748B', fontWeight: 600 }}>Memuat laporan...</div>
        </div>
      ) : (
        <>
          {/* STAT CARDS */}
          <div style={S.statsGrid}>
            {[
              { title: 'Total Pendapatan', value: fmt(totalRevenue), icon: <FiDollarSign size={22} />, bg: 'linear-gradient(135deg,#064E3B,#059669)', accent: '#6EE7B7', growth: '+18%', up: true },
              { title: 'Total Order', value: totalOrders, icon: <FiShoppingBag size={22} />, bg: 'linear-gradient(135deg,#1E3A5F,#1D4ED8)', accent: '#93C5FD', growth: '+12%', up: true },
              { title: 'Produk Aktif', value: totalProducts, icon: <FiPackage size={22} />, bg: 'linear-gradient(135deg,#78350F,#B45309)', accent: '#FCD34D', growth: '+5%', up: true },
              { title: 'Best Seller', value: bestSellerName, icon: <FiStar size={22} />, bg: 'linear-gradient(135deg,#4C1D95,#7C3AED)', accent: '#C4B5FD', growth: 'Top', up: true },
            ].map((card, i) => (
              <div key={i} className="stat-card fade-up" style={{ ...S.statCard, background: card.bg, animationDelay: `${i * 0.08}s` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(255,255,255,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: card.accent }}>{card.icon}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 20, background: 'rgba(255,255,255,.15)', color: '#fff', fontSize: 11, fontWeight: 800 }}>
                    {card.up ? <FiArrowUpRight size={11} /> : <FiArrowDownRight size={11} />} {card.growth}
                  </div>
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: card.accent, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 6 }}>{card.title}</div>
                <div style={{ fontSize: typeof card.value === 'string' && card.value.length > 12 ? 14 : 28, fontWeight: 800, color: '#fff', lineHeight: 1.2, fontVariantNumeric: 'tabular-nums' }}>{card.value}</div>
              </div>
            ))}
          </div>

          {/* CHART + CATEGORY ROW */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, marginBottom: 20 }}>
            {/* BAR CHART */}
            <div style={S.card}>
              <div style={S.cardHeader}>
                <div>
                  <div style={S.cardTitle}>Tren Penjualan</div>
                  <div style={S.cardSub}>Pendapatan 6 bulan terakhir</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#10B981', fontWeight: 700 }}>
                  <FiTrendingUp size={16} /> +18.4%
                </div>
              </div>
              <div style={{ padding: '0 8px 8px' }}>
                <BarChart data={monthlySales} height={160} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, padding: '16px 0 0', borderTop: '1px solid #F1F5F9', marginTop: 8 }}>
                {[
                  { label: 'Rata-rata/Bln', value: fmt(monthlySales.reduce((a, b) => a + b.value, 0) / monthlySales.length) },
                  { label: 'Tertinggi', value: fmt(Math.max(...monthlySales.map((d) => d.value))) },
                  { label: 'Bulan Ini', value: fmt(monthlySales[monthlySales.length - 1].value) },
                ].map((s, i) => (
                  <div key={i} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600, marginBottom: 4 }}>{s.label}</div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#0F172A' }}>{s.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* CATEGORY DONUT */}
            <div style={S.card}>
              <div style={S.cardHeader}>
                <div>
                  <div style={S.cardTitle}>Kategori</div>
                  <div style={S.cardSub}>Distribusi penjualan</div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', margin: '8px 0 16px' }}>
                <DonutChart segments={categoryData} size={120} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {categoryData.map((item) => (
                  <div key={item.label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13, fontWeight: 700, color: '#0F172A' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 10, height: 10, borderRadius: 3, background: item.color, flexShrink: 0 }} />
                        {item.label}
                      </div>
                      <span style={{ color: '#64748B' }}>{item.percent}%</span>
                    </div>
                    <div style={{ height: 6, background: '#F1F5F9', borderRadius: 999, overflow: 'hidden' }}>
                      <div style={{ width: `${item.percent}%`, height: '100%', borderRadius: 999, background: item.color, transition: 'width 0.8s ease' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* SALES TABLE */}
          <div style={S.card}>
            <div style={{ ...S.cardHeader, marginBottom: 0, paddingBottom: 16, borderBottom: '1px solid #F1F5F9' }}>
              <div>
                <div style={S.cardTitle}>Laporan Produk Terlaris</div>
                <div style={S.cardSub}>Performa penjualan per produk</div>
              </div>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#FFF7ED', color: '#EA580C', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FiBox size={20} />
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
                <thead>
                  <tr style={{ background: '#F8FAFC' }}>
                    {['#', 'Produk', 'Kategori', 'Terjual', 'Pendapatan', 'Share', 'Trend'].map((h, i) => (
                      <th key={h} style={{ ...S.th, textAlign: i >= 3 ? 'right' : 'left', paddingRight: i === 6 ? 20 : undefined }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {safeSalesReport.map((item, i) => {
                    const share = totalRevLocal > 0 ? (((item.revenue || item.total_revenue || 0) / totalRevLocal) * 100).toFixed(1) : 0;
                    const isTop = i === 0;
                    return (
                      <tr key={item.id || i} className="report-row fade-up" style={{ borderBottom: '1px solid #F1F5F9', animationDelay: `${i * 0.05}s` }}>
                        <td style={{ ...S.td, width: 40 }}>
                          {isTop ? (
                            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg,#F59E0B,#FBBF24)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <FiStar size={13} color="#fff" />
                            </div>
                          ) : (
                            <span style={{ fontSize: 13, fontWeight: 700, color: '#94A3B8' }}>{i + 1}</span>
                          )}
                        </td>
                        <td style={S.td}>
                          <div style={{ fontWeight: 700, color: '#0F172A', fontSize: 14 }}>{item.product || item.name || 'Produk Anonim'}</div>
                        </td>
                        <td style={S.td}>
                          <span style={{ padding: '4px 10px', borderRadius: 20, background: '#F8FAFC', border: '1px solid #E2E8F0', fontSize: 12, fontWeight: 600, color: '#475569' }}>{item.category || 'Lainnya'}</span>
                        </td>
                        <td style={{ ...S.td, textAlign: 'right' }}>
                          <span style={{ fontWeight: 800, fontSize: 15, color: '#0F172A', fontVariantNumeric: 'tabular-nums' }}>{item.qty || item.total_sold || 0}</span>
                          <span style={{ fontSize: 11, color: '#94A3B8', marginLeft: 4 }}>pcs</span>
                        </td>
                        <td style={{ ...S.td, textAlign: 'right' }}>
                          <span style={{ fontWeight: 800, color: '#053B2F', fontSize: 14 }}>{fmt(item.revenue || item.total_revenue || 0)}</span>
                        </td>
                        <td style={{ ...S.td, textAlign: 'right', width: 120 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
                            <div style={{ flex: 1, height: 6, background: '#F1F5F9', borderRadius: 999, overflow: 'hidden', maxWidth: 60 }}>
                              <div style={{ width: `${share}%`, height: '100%', background: 'linear-gradient(90deg,#10B981,#34D399)', borderRadius: 999 }} />
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 700, color: '#64748B', minWidth: 32 }}>{share}%</span>
                          </div>
                        </td>
                        <td style={{ ...S.td, textAlign: 'right', paddingRight: 20 }}>
                          <span style={{ background: '#ECFDF5', color: '#15803D', padding: '5px 10px', borderRadius: 20, fontSize: 11, fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <FiArrowUpRight size={11} /> Naik
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* RECENT ORDERS */}
          {orders && orders.length > 0 && (
            <div style={{ ...S.card, marginTop: 20 }}>
              <div style={{ ...S.cardHeader, marginBottom: 0, paddingBottom: 16, borderBottom: '1px solid #F1F5F9' }}>
                <div>
                  <div style={S.cardTitle}>Transaksi Terbaru</div>
                  <div style={S.cardSub}>5 order terakhir yang sudah dibayar</div>
                </div>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC' }}>
                      {['Order ID', 'Pelanggan', 'Metode', 'Total', 'Status'].map((h) => (
                        <th key={h} style={S.th}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.id} className="report-row" style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={S.td}>
                          <span style={{ fontWeight: 700, color: '#0F172A' }}>#{o.id || o.order_number}</span>
                        </td>
                        <td style={S.td}>{o.customer?.name || o.notes || 'Pelanggan Walk-in'}</td>
                        <td style={S.td}>
                          <span style={{ padding: '4px 10px', borderRadius: 20, background: '#F0FDF4', color: '#15803D', fontSize: 12, fontWeight: 700 }}>{(o.payment_method || 'cash').toUpperCase()}</span>
                        </td>
                        <td style={S.td}>
                          <span style={{ fontWeight: 800, color: '#053B2F' }}>{fmt(o.total_amount || o.total || 0)}</span>
                        </td>
                        <td style={S.td}>
                          <span style={{ padding: '4px 10px', borderRadius: 20, background: '#ECFDF5', color: '#15803D', fontSize: 12, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>✓ Lunas</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

const S = {
  page: { padding: '32px 36px', background: '#F8FAFC', minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', sans-serif" },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 16 },
  title: { margin: 0, fontSize: 30, fontWeight: 900, color: '#0F172A', lineHeight: 1.1 },
  sub: { margin: '6px 0 0', color: '#94A3B8', fontSize: 14, fontWeight: 500 },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 20 },
  statCard: { borderRadius: 18, padding: '20px 22px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' },
  card: { background: '#fff', borderRadius: 18, padding: 24, border: '1px solid #E2E8F0', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', marginBottom: 20 },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  cardTitle: { fontSize: 17, fontWeight: 800, color: '#0F172A', marginBottom: 4 },
  cardSub: { fontSize: 13, color: '#94A3B8', fontWeight: 500 },
  th: { padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 800, color: '#94A3B8', letterSpacing: 0.8, textTransform: 'uppercase', borderBottom: '1px solid #F1F5F9' },
  td: { padding: '14px 16px', fontSize: 14, color: '#475569', verticalAlign: 'middle', whiteSpace: 'nowrap' },
};

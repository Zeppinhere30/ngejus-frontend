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
const BarChart = ({ data = [], height = 160 }) => {
  const safeData = Array.isArray(data) ? data : [];
  const max = Math.max(...safeData.map((d) => d.value), 1);

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height, padding: '10px 4px 0' }}>
      {safeData.map((d, i) => {
        const pct = (d.value / max) * 100;
        const isLast = i === safeData.length - 1;
        return (
          <div key={d.month || i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, height: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', width: '100%', height: '100%', position: 'relative' }}>
              <div style={{ position: 'absolute', bottom: `${pct}%`, left: '50%', transform: 'translateX(-50%)', marginBottom: 8, fontSize: 10, fontWeight: 700, color: isLast ? '#10B981' : '#94A3B8' }}>{fmtShort(d.value)}</div>
              <div
                className="bar-chart-fill"
                style={{
                  width: '100%',
                  height: `${pct}%`,
                  minHeight: 4,
                  borderRadius: '6px 6px 0 0',
                  background: isLast ? 'linear-gradient(180deg,#10B981,#059669)' : 'linear-gradient(180deg,#CBD5E1,#F1F5F9)',
                  transition: 'height 0.6s cubic-bezier(0.34,1.56,0.64,1)',
                  position: 'relative',
                }}
              >
                {isLast && (
                  <div
                    className="bar-indicator"
                    style={{ position: 'absolute', top: -3, left: '50%', transform: 'translateX(-50%)', width: 8, height: 8, borderRadius: '50%', background: '#10B981', boxShadow: '0 0 0 3px rgba(16,185,129,0.2)' }}
                  />
                )}
              </div>
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: isLast ? '#053B2F' : '#64748B' }}>{d.month}</div>
          </div>
        );
      })}
    </div>
  );
};

// Donut chart component
const DonutChart = ({ segments = [], size = 140 }) => {
  const safeSegments = Array.isArray(segments) ? segments : [];
  const r = 50;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  let accumulated = 0;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F1F5F9" strokeWidth={18} />
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
            strokeWidth={18}
            strokeDasharray={`${dash} ${circumference - dash}`}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform={`rotate(-90 ${cx} ${cy})`}
            style={{ transition: 'stroke-dasharray 0.8s ease' }}
          />
        );
      })}
      <text x={cx} y={cy - 4} textAnchor="middle" fontSize="13" fontWeight="800" fill="#0F172A">
        Total
      </text>
      <text x={cx} y={cy + 12} textAnchor="middle" fontSize="10" fontWeight="600" fill="#64748B">
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
      setErrorMsg('Gagal memuat beberapa data dari server. Menampilkan data lokal sementara.');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => {
      window.print();
      setExporting(false);
    }, 500); // Sedikit delay agar state loading tombol hilang sebelum print
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
    <>
      <style>{`
        /* GLOBAL STYLES */
        * { box-sizing: border-box; }
        .page-container { padding: 32px; background: #F8FAFC; min-height: 100vh; font-family: 'Plus Jakarta Sans', sans-serif; }
        
        /* ANIMATIONS & HOVERS */
        .report-row { transition: background 0.15s ease; }
        .report-row:hover { background: #F0FDF4 !important; }
        .stat-card { transition: transform 0.2s, box-shadow 0.2s; }
        .stat-card:hover { transform: translateY(-4px); box-shadow: 0 20px 40px rgba(0,0,0,0.08) !important; }
        .btn-hover { transition: all 0.2s; cursor: pointer; }
        .btn-hover:hover { transform: translateY(-2px); }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .fade-up { animation: fadeUp 0.5s ease both; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(15px); } to { opacity:1; transform:translateY(0); } }
        
        /* CUSTOM SCROLLBAR */
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 6px; }
        ::-webkit-scrollbar-track { background: #F1F5F9; }

        /* RESPONSIVE GRIDS */
        .grid-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 24px; }
        .grid-charts { display: grid; grid-template-columns: 1fr 360px; gap: 24px; margin-bottom: 24px; }
        
        @media (max-width: 1200px) {
          .grid-stats { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 900px) {
          .grid-charts { grid-template-columns: 1fr; }
        }
        @media (max-width: 600px) {
          .grid-stats { grid-template-columns: 1fr; }
          .page-container { padding: 16px; }
          .header-actions { flex-direction: column; width: 100%; }
          .header-actions > div, .header-actions button { width: 100%; justify-content: center; }
        }

        /* PRINT STYLES - FIXING THE SIDEBAR ISSUE */
        @media print {
          @page { size: A4 portrait; margin: 1.5cm; }
          
          /* Sembunyikan SEMUA elemen di body secara default */
          body * { visibility: hidden; }
          
          /* Tampilkan HANYA area laporan dan anak-anaknya */
          #print-area, #print-area * { visibility: visible; }
          
          /* Posisikan area laporan di pojok kiri atas kertas */
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
            background: white !important;
          }
          
          .no-print { display: none !important; }
          body { background: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .page-container { padding: 0 !important; background: white !important; }
          
          /* Sesuaikan grid untuk kertas A4 */
          .grid-stats { grid-template-columns: repeat(4, 1fr) !important; gap: 12px; margin-bottom: 20px; }
          .grid-charts { grid-template-columns: 1fr 300px !important; gap: 16px; margin-bottom: 20px; }
          
          /* Ubah warna stat card agar hemat tinta & terbaca jelas */
          .stat-card { 
            background: white !important; 
            border: 1px solid #E2E8F0; 
            box-shadow: none !important; 
            break-inside: avoid;
            padding: 16px !important;
          }
          .stat-card-title, .stat-card-value { color: #0F172A !important; }
          .stat-card-icon { background: #F1F5F9 !important; color: #0F172A !important; }
          .stat-card-badge { background: #F1F5F9 !important; color: #0F172A !important; border: 1px solid #E2E8F0; }
          
          /* Hindari elemen terpotong antar halaman */
          .card-container { break-inside: avoid; page-break-inside: avoid; border: 1px solid #E2E8F0 !important; box-shadow: none !important; margin-bottom: 20px !important; }
          tr { break-inside: avoid; page-break-inside: avoid; }
          
          .bar-chart-fill { background: #CBD5E1 !important; }
          .bar-chart-fill:last-child { background: #0F172A !important; }
          .bar-indicator { display: none; }
        }
      `}</style>

      <div className="page-container" id="print-area" ref={printRef}>
        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 20 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: '#ECFDF5', color: '#053B2F', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FiBarChart2 size={22} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#64748B', letterSpacing: 1.5, textTransform: 'uppercase' }}>Analitik System</span>
            </div>
            <h1 style={{ margin: 0, fontSize: 32, fontWeight: 900, color: '#0F172A', lineHeight: 1.2 }}>Laporan Bisnis</h1>
            <p style={{ margin: '6px 0 0', color: '#64748B', fontSize: 15, fontWeight: 500 }}>Performa penjualan & analisis produk NgeJus per {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>

          <div className="no-print header-actions" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ display: 'flex', background: '#fff', borderRadius: 14, border: '1px solid #E2E8F0', padding: 4, boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
              {periods.map((p) => (
                <button
                  key={p.key}
                  className="btn-hover"
                  onClick={() => setPeriod(p.key)}
                  style={{
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: 10,
                    background: period === p.key ? '#053B2F' : 'transparent',
                    color: period === p.key ? '#fff' : '#64748B',
                    fontWeight: 700,
                    fontSize: 13,
                    fontFamily: 'inherit',
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <button
              className="btn-hover"
              onClick={loadData}
              title="Refresh Data"
              style={{ width: 46, height: 46, borderRadius: 14, border: '1px solid #E2E8F0', background: '#fff', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}
            >
              <FiRefreshCw size={18} className={loading ? 'spin' : ''} />
            </button>

            <button
              className="btn-hover"
              onClick={handleExport}
              disabled={exporting}
              style={{
                height: 46,
                padding: '0 24px',
                borderRadius: 14,
                border: 'none',
                background: 'linear-gradient(135deg,#053B2F,#0F5C47)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                fontWeight: 700,
                fontSize: 14,
                boxShadow: '0 8px 25px rgba(5,59,47,0.25)',
                fontFamily: 'inherit',
                cursor: exporting ? 'wait' : 'pointer',
              }}
            >
              {exporting ? <FiLoader className="spin" size={18} /> : <FiDownload size={18} />}
              {exporting ? 'Menyiapkan...' : 'Cetak PDF'}
            </button>
          </div>
        </div>

        {errorMsg && (
          <div
            className="fade-up no-print"
            style={{ background: '#FEF2F2', border: '1px solid #FECACA', padding: '16px 20px', borderRadius: 14, color: '#DC2626', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12, fontSize: 14, fontWeight: 600 }}
          >
            <FiAlertCircle size={20} /> {errorMsg}
          </div>
        )}

        {loading && !dashboard ? (
          <div style={{ textAlign: 'center', padding: '100px 0' }}>
            <FiLoader className="spin" size={40} color="#053B2F" style={{ margin: '0 auto' }} />
            <div style={{ marginTop: 16, color: '#64748B', fontWeight: 600, fontSize: 15 }}>Menyiapkan laporan analitik...</div>
          </div>
        ) : (
          <>
            {/* STAT CARDS */}
            <div className="grid-stats">
              {[
                { title: 'Total Pendapatan', value: fmt(totalRevenue), icon: <FiDollarSign size={24} />, bg: 'linear-gradient(135deg,#064E3B,#059669)', accent: '#6EE7B7', growth: '+18.4%', up: true },
                { title: 'Total Order', value: totalOrders, icon: <FiShoppingBag size={24} />, bg: 'linear-gradient(135deg,#1E3A5F,#2563EB)', accent: '#93C5FD', growth: '+12.5%', up: true },
                { title: 'Produk Aktif', value: totalProducts, icon: <FiPackage size={24} />, bg: 'linear-gradient(135deg,#78350F,#D97706)', accent: '#FDE68A', growth: '+5.2%', up: true },
                { title: 'Best Seller', value: bestSellerName, icon: <FiStar size={24} />, bg: 'linear-gradient(135deg,#4C1D95,#8B5CF6)', accent: '#DDD6FE', growth: 'Peringkat #1', up: true },
              ].map((card, i) => (
                <div key={i} className="stat-card fade-up" style={{ background: card.bg, borderRadius: 20, padding: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', animationDelay: `${i * 0.1}s` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                    <div className="stat-card-icon" style={{ width: 52, height: 52, borderRadius: 16, background: 'rgba(255,255,255,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: card.accent }}>
                      {card.icon}
                    </div>
                    <div className="stat-card-badge" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 20, background: 'rgba(255,255,255,.2)', color: '#fff', fontSize: 12, fontWeight: 800 }}>
                      {card.up ? <FiArrowUpRight size={14} /> : <FiArrowDownRight size={14} />} {card.growth}
                    </div>
                  </div>
                  <div className="stat-card-title" style={{ fontSize: 13, fontWeight: 700, color: card.accent, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 8 }}>
                    {card.title}
                  </div>
                  <div className="stat-card-value" style={{ fontSize: typeof card.value === 'string' && card.value.length > 12 ? 20 : 32, fontWeight: 900, color: '#fff', lineHeight: 1.2, fontVariantNumeric: 'tabular-nums' }}>
                    {card.value}
                  </div>
                </div>
              ))}
            </div>

            {/* CHART + CATEGORY ROW */}
            <div className="grid-charts">
              {/* BAR CHART */}
              <div className="card-container fade-up" style={{ background: '#fff', borderRadius: 20, padding: 28, border: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', animationDelay: '0.4s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#0F172A', marginBottom: 6 }}>Tren Penjualan</h3>
                    <p style={{ margin: 0, fontSize: 14, color: '#64748B', fontWeight: 500 }}>Pendapatan 6 bulan terakhir</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: '#ECFDF5', borderRadius: 20, color: '#10B981', fontWeight: 800, fontSize: 13 }}>
                    <FiTrendingUp size={16} /> +18.4%
                  </div>
                </div>

                <BarChart data={monthlySales} height={200} />

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, padding: '24px 0 0', borderTop: '1px dashed #E2E8F0', marginTop: 20 }}>
                  {[
                    { label: 'Rata-rata / Bulan', value: fmt(monthlySales.reduce((a, b) => a + b.value, 0) / monthlySales.length) },
                    { label: 'Pencapaian Tertinggi', value: fmt(Math.max(...monthlySales.map((d) => d.value))) },
                    { label: 'Bulan Berjalan', value: fmt(monthlySales[monthlySales.length - 1].value) },
                  ].map((s, i) => (
                    <div key={i} style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 12, color: '#64748B', fontWeight: 600, marginBottom: 6 }}>{s.label}</div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: '#0F172A' }}>{s.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CATEGORY DONUT */}
              <div className="card-container fade-up" style={{ background: '#fff', borderRadius: 20, padding: 28, border: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', animationDelay: '0.5s' }}>
                <div style={{ marginBottom: 24 }}>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#0F172A', marginBottom: 6 }}>Kategori Produk</h3>
                  <p style={{ margin: 0, fontSize: 14, color: '#64748B', fontWeight: 500 }}>Distribusi penjualan</p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', margin: '16px 0 32px' }}>
                  <DonutChart segments={categoryData} size={150} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {categoryData.map((item) => (
                    <div key={item.label}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14, fontWeight: 700, color: '#0F172A' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 12, height: 12, borderRadius: 4, background: item.color, flexShrink: 0 }} />
                          {item.label}
                        </div>
                        <span style={{ color: '#64748B' }}>{item.percent}%</span>
                      </div>
                      <div style={{ height: 8, background: '#F1F5F9', borderRadius: 999, overflow: 'hidden' }}>
                        <div style={{ width: `${item.percent}%`, height: '100%', borderRadius: 999, background: item.color, transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* SALES TABLE */}
            <div
              className="card-container fade-up"
              style={{ background: '#fff', borderRadius: 20, padding: 0, border: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', animationDelay: '0.6s', overflow: 'hidden', marginBottom: 24 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 28px', borderBottom: '1px solid #F1F5F9' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#0F172A', marginBottom: 6 }}>Laporan Produk Terlaris</h3>
                  <p style={{ margin: 0, fontSize: 14, color: '#64748B', fontWeight: 500 }}>Performa penjualan mendetail per produk</p>
                </div>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: '#FFF7ED', color: '#EA580C', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FiBox size={22} />
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC' }}>
                      {['Peringkat', 'Nama Produk', 'Kategori', 'Terjual', 'Pendapatan', 'Porsi (Share)', 'Trend'].map((h, i) => (
                        <th key={h} style={{ padding: '16px 28px', textAlign: i >= 3 ? 'right' : 'left', fontSize: 12, fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: '1px solid #E2E8F0' }}>
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
                        <tr key={item.id || i} className="report-row" style={{ borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '16px 28px', width: 60 }}>
                            {isTop ? (
                              <div
                                style={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: 10,
                                  background: 'linear-gradient(135deg,#F59E0B,#FBBF24)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  boxShadow: '0 4px 10px rgba(245,158,11,0.3)',
                                }}
                              >
                                <FiStar size={16} color="#fff" />
                              </div>
                            ) : (
                              <div style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: '#94A3B8' }}>#{i + 1}</div>
                            )}
                          </td>
                          <td style={{ padding: '16px 28px', fontWeight: 800, color: '#0F172A', fontSize: 15 }}>{item.product || item.name || 'Produk Anonim'}</td>
                          <td style={{ padding: '16px 28px' }}>
                            <span style={{ padding: '6px 12px', borderRadius: 20, background: '#F8FAFC', border: '1px solid #E2E8F0', fontSize: 13, fontWeight: 600, color: '#475569' }}>{item.category || 'Lainnya'}</span>
                          </td>
                          <td style={{ padding: '16px 28px', textAlign: 'right' }}>
                            <span style={{ fontWeight: 800, fontSize: 16, color: '#0F172A', fontVariantNumeric: 'tabular-nums' }}>{item.qty || item.total_sold || 0}</span>
                            <span style={{ fontSize: 12, color: '#94A3B8', marginLeft: 4 }}>pcs</span>
                          </td>
                          <td style={{ padding: '16px 28px', textAlign: 'right', fontWeight: 800, color: '#053B2F', fontSize: 15 }}>{fmt(item.revenue || item.total_revenue || 0)}</td>
                          <td style={{ padding: '16px 28px', textAlign: 'right', width: 140 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'flex-end' }}>
                              <div style={{ flex: 1, height: 8, background: '#F1F5F9', borderRadius: 999, overflow: 'hidden', maxWidth: 70 }}>
                                <div style={{ width: `${share}%`, height: '100%', background: 'linear-gradient(90deg,#10B981,#34D399)', borderRadius: 999 }} />
                              </div>
                              <span style={{ fontSize: 13, fontWeight: 800, color: '#64748B', minWidth: 36 }}>{share}%</span>
                            </div>
                          </td>
                          <td style={{ padding: '16px 28px', textAlign: 'right' }}>
                            <span style={{ background: '#ECFDF5', color: '#15803D', padding: '6px 12px', borderRadius: 20, fontSize: 12, fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              <FiArrowUpRight size={14} /> Naik
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
              <div className="card-container fade-up" style={{ background: '#fff', borderRadius: 20, padding: 0, border: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', animationDelay: '0.7s', overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 28px', borderBottom: '1px solid #F1F5F9' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#0F172A', marginBottom: 6 }}>Transaksi Terbaru</h3>
                    <p style={{ margin: 0, fontSize: 14, color: '#64748B', fontWeight: 500 }}>5 pesanan terakhir yang sudah diselesaikan</p>
                  </div>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: '#F0F9FF', color: '#0284C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FiCalendar size={22} />
                  </div>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
                    <thead>
                      <tr style={{ background: '#F8FAFC' }}>
                        {['ID Pesanan', 'Pelanggan', 'Metode Bayar', 'Total Harga', 'Status'].map((h) => (
                          <th key={h} style={{ padding: '16px 28px', textAlign: 'left', fontSize: 12, fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: '1px solid #E2E8F0' }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((o) => (
                        <tr key={o.id} className="report-row" style={{ borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '16px 28px', fontWeight: 800, color: '#0F172A', fontSize: 14 }}>#{o.id || o.order_number}</td>
                          <td style={{ padding: '16px 28px', fontSize: 14, color: '#475569', fontWeight: 500 }}>{o.customer?.name || o.notes || 'Pelanggan Walk-in'}</td>
                          <td style={{ padding: '16px 28px' }}>
                            <span style={{ padding: '6px 12px', borderRadius: 20, background: '#F8FAFC', border: '1px solid #E2E8F0', color: '#475569', fontSize: 12, fontWeight: 800 }}>{(o.payment_method || 'cash').toUpperCase()}</span>
                          </td>
                          <td style={{ padding: '16px 28px', fontWeight: 800, color: '#053B2F', fontSize: 15 }}>{fmt(o.total_amount || o.total || 0)}</td>
                          <td style={{ padding: '16px 28px' }}>
                            <span style={{ padding: '6px 12px', borderRadius: 20, background: '#ECFDF5', color: '#15803D', fontSize: 12, fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 6 }}>✓ Lunas</span>
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
    </>
  );
}

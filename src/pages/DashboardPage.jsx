// src/pages/DashboardPage.jsx

import { useState, useEffect } from 'react';
import api from '../utils/api';

import { FiTrendingUp, FiFileText, FiPackage, FiAlertCircle, FiAward, FiCheckCircle, FiLoader } from 'react-icons/fi';

const fmt = (n) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(n || 0);

const fmtN = (n) => new Intl.NumberFormat('id-ID').format(n || 0);

export default function DashboardPage() {
  const [data, setData] = useState(null);

  const [loading, setLoading] = useState(true);

  // ==========================================
  // BACKEND TIDAK DIUBAH
  // ==========================================

  useEffect(() => {
    Promise.all([api.get('/dashboard'), api.get('/inventory/low-stock')])
      .then(([dash, low]) => {
        setData({
          ...dash.data,
          lowStock: low.data,
        });
      })
      .finally(() => setLoading(false));
  }, []);

  // ==========================================
  // LOADING
  // ==========================================

  if (loading)
    return (
      <div style={styles.loadingWrap}>
        <div style={styles.loadingBox}>
          <FiLoader size={42} className="spin-icon" color="#10B981" />

          <div style={styles.loadingText}>Menyiapkan Workspace...</div>
        </div>

        <style>
          {`
            .spin-icon {
              animation: spin 1s linear infinite;
            }

            @keyframes spin {
              to {
                transform: rotate(360deg);
              }
            }
          `}
        </style>
      </div>
    );

  // ==========================================
  // DATA CARD
  // ==========================================

  const stats = [
    {
      label: 'Penjualan Hari Ini',
      value: fmt(data?.today_revenue),
      icon: <FiTrendingUp size={24} />,
      grad: 'linear-gradient(135deg,#34D399,#10B981)',
      shadow: 'rgba(16,185,129,.25)',
    },

    {
      label: 'Transaksi Hari Ini',
      value: fmtN(data?.today_orders),
      icon: <FiFileText size={24} />,
      grad: 'linear-gradient(135deg,#60A5FA,#3B82F6)',
      shadow: 'rgba(59,130,246,.25)',
    },

    {
      label: 'Produk Aktif',
      value: fmtN(data?.total_products),
      icon: <FiPackage size={24} />,
      grad: 'linear-gradient(135deg,#A78BFA,#8B5CF6)',
      shadow: 'rgba(139,92,246,.25)',
    },

    {
      label: 'Stok Kritis',
      value: fmtN(data?.lowStock?.length),
      icon: <FiAlertCircle size={24} />,
      grad: 'linear-gradient(135deg,#F87171,#EF4444)',
      shadow: 'rgba(239,68,68,.25)',
    },
  ];

  return (
    <div style={styles.wrapper}>
      {/* HEADER */}

      <div
        className="fadeUp"
        style={{
          marginBottom: 32,
        }}
      >
        <h1 style={styles.title}>Dashboard</h1>

        <p style={styles.subtitle}>
          Ringkasan performa{' '}
          <span
            style={{
              color: '#10B981',
              fontWeight: 800,
            }}
          >
            NgeJus
          </span>{' '}
          pada{' '}
          {new Date().toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </p>
      </div>

      {/* STATS */}

      <div className="fadeUp" style={styles.statsGrid}>
        {stats.map((s, i) => (
          <div key={i} className="statCard" style={styles.statCard}>
            <div
              style={{
                ...styles.statGlow,
                background: s.grad,
              }}
            />

            <div
              style={{
                ...styles.statIcon,
                background: s.grad,
                boxShadow: `0 10px 25px ${s.shadow}`,
              }}
            >
              {s.icon}
            </div>

            <div
              style={{
                position: 'relative',
                zIndex: 2,
              }}
            >
              <div style={styles.statValue}>{s.value}</div>

              <div style={styles.statLabel}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* MAIN GRID */}

      <div style={styles.mainGrid}>
        {/* LEFT */}

        <div className="panelCard fadeUp" style={styles.panel}>
          <div style={styles.panelHeader}>
            <div
              style={{
                ...styles.panelIcon,
                background: 'linear-gradient(135deg,#FCD34D,#F59E0B)',
              }}
            >
              <FiAward size={20} />
            </div>

            <div>
              <h3 style={styles.panelTitle}>Produk Terlaris Hari Ini</h3>

              <div style={styles.panelSub}>Menu paling dicari pelanggan</div>
            </div>
          </div>

          {data?.top_products?.length ? (
            <div style={styles.listWrap}>
              {data.top_products.slice(0, 5).map((p, i) => (
                <div key={i} className="listItem" style={styles.listItem}>
                  <div
                    style={{
                      ...styles.rankBox,

                      background: i === 0 ? 'linear-gradient(135deg,#34D399,#10B981)' : '#F1F5F9',

                      color: i === 0 ? '#fff' : '#64748B',
                    }}
                  >
                    {i + 1}
                  </div>

                  <div
                    style={{
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    <div style={styles.productName}>{p.name}</div>

                    <div style={styles.productQty}>{p.qty_sold} porsi terjual</div>
                  </div>

                  <div style={styles.productRevenue}>{fmt(p.revenue)}</div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyData />
          )}
        </div>

        {/* RIGHT */}

        <div className="panelCard fadeUp" style={styles.panel}>
          <div style={styles.panelHeader}>
            <div
              style={{
                ...styles.panelIcon,
                background: 'linear-gradient(135deg,#FCA5A5,#EF4444)',
              }}
            >
              <FiAlertCircle size={20} />
            </div>

            <div>
              <h3 style={styles.panelTitle}>Peringatan Stok</h3>

              <div style={styles.panelSub}>Bahan baku butuh restock</div>
            </div>
          </div>

          {data?.lowStock?.length ? (
            <div style={styles.listWrap}>
              {data.lowStock.slice(0, 6).map((i) => (
                <div key={i.id} className="listItem" style={styles.stockItem}>
                  <div>
                    <div style={styles.stockName}>{i.name}</div>

                    <div style={styles.stockText}>
                      Sisa stok <strong>{parseFloat(i.stock).toFixed(2)}</strong> {i.unit}
                    </div>
                  </div>

                  <div style={styles.stockBadge}>Min {parseFloat(i.min_stock).toFixed(2)}</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={styles.safeBox}>
              <div style={styles.safeIcon}>
                <FiCheckCircle size={36} color="#fff" />
              </div>

              <div style={styles.safeTitle}>Semua Stok Aman!</div>

              <div style={styles.safeDesc}>Sistem tidak mendeteksi bahan baku menipis.</div>
            </div>
          )}
        </div>
      </div>

      {/* CSS */}

      <style>
        {`
          .fadeUp{
            animation:
              fadeUp .5s ease;
          }

          @keyframes fadeUp{
            from{
              opacity:0;
              transform:translateY(18px);
            }
            to{
              opacity:1;
              transform:translateY(0);
            }
          }

          .statCard{
            transition:.3s;
          }

          .statCard:hover{
            transform:
              translateY(-6px);

            box-shadow:
              0 18px 40px rgba(0,0,0,.06);
          }

          .panelCard{
            transition:.3s;
          }

          .panelCard:hover{
            box-shadow:
              0 20px 45px rgba(0,0,0,.05);
          }

          .listItem{
            transition:.25s;
          }

          .listItem:hover{
            transform:
              translateX(6px);

            border-color:#CBD5E1 !important;

            box-shadow:
              0 10px 25px rgba(0,0,0,.04);
          }

          @media(max-width:1200px){

            .mainGrid{
              grid-template-columns:1fr !important;
            }

          }

          @media(max-width:768px){

            .statsGrid{
              grid-template-columns:1fr !important;
            }

            .mainGrid{
              grid-template-columns:1fr !important;
            }

          }
        `}
      </style>
    </div>
  );
}

function EmptyData() {
  return (
    <div
      style={{
        textAlign: 'center',
        padding: '50px 0',
        color: '#94A3B8',
        fontWeight: 600,
      }}
    >
      Belum ada penjualan hari ini
    </div>
  );
}

const styles = {
  wrapper: {
    padding: 32,

    fontFamily: "'Plus Jakarta Sans', sans-serif",

    width: '100%',

    boxSizing: 'border-box',
  },

  loadingWrap: {
    height: '100vh',

    display: 'flex',

    justifyContent: 'center',

    alignItems: 'center',
  },

  loadingBox: {
    display: 'flex',

    flexDirection: 'column',

    alignItems: 'center',

    gap: 16,
  },

  loadingText: {
    fontWeight: 700,

    color: '#64748B',
  },

  title: {
    margin: 0,

    fontSize: 46,

    fontWeight: 900,

    letterSpacing: '-2px',

    color: '#0F172A',
  },

  subtitle: {
    marginTop: 8,

    color: '#64748B',

    fontSize: 15,

    fontWeight: 500,
  },

  statsGrid: {
    display: 'grid',

    gridTemplateColumns: 'repeat(4,minmax(0,1fr))',

    gap: 22,

    marginBottom: 28,
  },

  statCard: {
    background: '#F8FAFC',

    borderRadius: 28,

    padding: 28,

    border: '1px solid #E2E8F0',

    position: 'relative',

    overflow: 'hidden',

    minHeight: 190,

    display: 'flex',

    flexDirection: 'column',

    justifyContent: 'space-between',
  },

  statGlow: {
    position: 'absolute',

    width: 120,
    height: 120,

    borderRadius: '50%',

    top: -30,
    right: -30,

    opacity: 0.08,

    filter: 'blur(20px)',
  },

  statIcon: {
    width: 58,
    height: 58,

    borderRadius: 18,

    display: 'flex',

    justifyContent: 'center',

    alignItems: 'center',

    color: '#fff',

    position: 'relative',

    zIndex: 2,
  },

  statValue: {
    fontSize: 28,

    fontWeight: 900,

    color: '#0F172A',

    marginBottom: 6,
  },

  statLabel: {
    color: '#64748B',

    fontSize: 15,

    fontWeight: 600,
  },

  mainGrid: {
    display: 'grid',

    gridTemplateColumns: '1fr 1fr',

    gap: 24,

    alignItems: 'start',
  },

  panel: {
    background: '#F8FAFC',

    borderRadius: 30,

    border: '1px solid #E2E8F0',

    padding: 28,

    minHeight: 480,
  },

  panelHeader: {
    display: 'flex',

    alignItems: 'center',

    gap: 16,

    marginBottom: 28,
  },

  panelIcon: {
    width: 52,
    height: 52,

    borderRadius: 16,

    display: 'flex',

    justifyContent: 'center',

    alignItems: 'center',

    color: '#fff',

    boxShadow: '0 10px 20px rgba(0,0,0,.12)',
  },

  panelTitle: {
    margin: 0,

    fontSize: 18,

    fontWeight: 800,

    color: '#0F172A',
  },

  panelSub: {
    marginTop: 4,

    color: '#64748B',

    fontSize: 13,

    fontWeight: 500,
  },

  listWrap: {
    display: 'flex',

    flexDirection: 'column',

    gap: 14,
  },

  listItem: {
    display: 'flex',

    alignItems: 'center',

    gap: 16,

    background: '#fff',

    border: '1px solid #E2E8F0',

    borderRadius: 22,

    padding: 16,
  },

  rankBox: {
    width: 42,
    height: 42,

    borderRadius: 14,

    display: 'flex',

    justifyContent: 'center',

    alignItems: 'center',

    fontWeight: 800,
  },

  productName: {
    fontSize: 16,

    fontWeight: 800,

    color: '#0F172A',

    marginBottom: 4,
  },

  productQty: {
    fontSize: 13,

    color: '#64748B',

    fontWeight: 600,
  },

  productRevenue: {
    fontWeight: 800,

    color: '#10B981',

    fontSize: 16,
  },

  stockItem: {
    display: 'flex',

    justifyContent: 'space-between',

    alignItems: 'center',

    background: '#fff',

    border: '1px solid #FECACA',

    borderRadius: 22,

    padding: '16px 18px',
  },

  stockName: {
    fontWeight: 800,

    color: '#991B1B',

    marginBottom: 6,
  },

  stockText: {
    fontSize: 13,

    color: '#DC2626',

    fontWeight: 600,
  },

  stockBadge: {
    background: 'rgba(239,68,68,.08)',

    color: '#DC2626',

    border: '1px solid rgba(239,68,68,.15)',

    padding: '8px 14px',

    borderRadius: 12,

    fontSize: 12,

    fontWeight: 800,
  },

  safeBox: {
    height: '100%',

    minHeight: 320,

    display: 'flex',

    flexDirection: 'column',

    justifyContent: 'center',

    alignItems: 'center',

    textAlign: 'center',
  },

  safeIcon: {
    width: 90,
    height: 90,

    borderRadius: '50%',

    background: 'linear-gradient(135deg,#34D399,#10B981)',

    display: 'flex',

    justifyContent: 'center',

    alignItems: 'center',

    marginBottom: 20,

    boxShadow: '0 20px 40px rgba(16,185,129,.25)',
  },

  safeTitle: {
    fontSize: 26,

    fontWeight: 900,

    color: '#0F172A',

    marginBottom: 10,
  },

  safeDesc: {
    color: '#64748B',

    fontSize: 15,

    fontWeight: 500,
  },
};

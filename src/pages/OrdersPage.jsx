// src/pages/OrdersPage.jsx
import { useState, useEffect } from 'react';
import api from '../utils/api';
// Menggunakan Feather Icons yang lebih profesional dan minimalis
import { FiSearch, FiFilter, FiInbox, FiLoader, FiCalendar, FiShoppingBag, FiCreditCard, FiChevronDown } from 'react-icons/fi';

const fmt = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n || 0);

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    setLoading(true);
    api
      .get(`/orders?search=${search}&status=${status}`)
      .then((r) => {
        setOrders(r.data.data || r.data);
      })
      .finally(() => setLoading(false));
  }, [search, status]);

  const STATUS_CFG = {
    paid: { label: 'Lunas', bg: '#D1FAE5', color: '#064E3B', border: '#34D399' },
    pending: { label: 'Pending', bg: '#FEF3C7', color: '#92400E', border: '#FBBF24' },
    cancelled: { label: 'Dibatalkan', bg: '#FEE2E2', color: '#7F1D1D', border: '#F87171' },
  };

  return (
    <div className="no-scrollbar" style={{ padding: '32px 40px', fontFamily: "'Plus Jakarta Sans', sans-serif", background: '#F8FAFC', minHeight: '100vh', overflowY: 'auto' }}>
      {/* HEADER */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: '#064E3B', letterSpacing: '-0.5px' }}>Riwayat Pesanan</h1>
        <p style={{ margin: '6px 0 0', color: '#64748B', fontSize: 15, fontWeight: 500 }}>Kelola dan tinjau seluruh riwayat transaksi pelanggan</p>
      </div>

      {/* FILTER & SEARCH */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 500 }}>
          <FiSearch size={18} style={{ position: 'absolute', left: 16, top: 14, color: '#94A3B8' }} />
          <input
            placeholder="Cari nomor order..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px 12px 44px',
              borderRadius: 12,
              border: '1px solid #E2E8F0',
              fontSize: 14,
              outline: 'none',
              fontWeight: 500,
            }}
          />
        </div>

        <div style={{ position: 'relative' }}>
          <FiFilter size={18} style={{ position: 'absolute', left: 16, top: 14, color: '#94A3B8' }} />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            style={{
              padding: '12px 40px 12px 44px',
              borderRadius: 12,
              border: '1px solid #E2E8F0',
              fontSize: 14,
              fontWeight: 600,
              color: '#475569',
              outline: 'none',
              appearance: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="">Semua Status</option>
            <option value="paid">Lunas</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Dibatalkan</option>
          </select>
          <FiChevronDown size={16} style={{ position: 'absolute', right: 14, top: 14, color: '#94A3B8', pointerEvents: 'none' }} />
        </div>
      </div>

      {/* TABEL */}
      <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #F1F5F9', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
              {['No. Order', 'Pelanggan', 'Item', 'Total Bayar', 'Metode', 'Waktu', 'Status'].map((h) => (
                <th key={h} style={{ padding: '16px 24px', textAlign: 'left', fontSize: 12, fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: 60 }}>
                  <FiLoader className="spin-icon" color="#10B981" size={30} />
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: 60 }}>
                  <FiInbox size={40} color="#CBD5E1" />
                  <p style={{ color: '#94A3B8', marginTop: 12 }}>Data tidak ditemukan</p>
                </td>
              </tr>
            ) : (
              orders.map((o) => {
                const s = STATUS_CFG[o.status] || STATUS_CFG.pending;
                return (
                  <tr key={o.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '16px 24px', fontWeight: 800, color: '#0F291E', fontSize: 14 }}>{o.order_number}</td>
                    <td style={{ padding: '16px 24px', fontSize: 14 }}>{o.customer?.name || 'Walk-in'}</td>
                    <td style={{ padding: '16px 24px', fontSize: 14, color: '#64748B' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <FiShoppingBag size={14} /> {o.items?.length || 0}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px', fontWeight: 800, color: '#059669', fontSize: 14 }}>{fmt(o.total)}</td>
                    <td style={{ padding: '16px 24px', fontSize: 13, textTransform: 'uppercase', fontWeight: 700, color: '#475569' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <FiCreditCard size={14} /> {o.payment_method}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px', fontSize: 13, color: '#64748B' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <FiCalendar size={14} /> {new Date(o.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{ background: s.bg, color: s.color, padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 800 }}>{s.label}</span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

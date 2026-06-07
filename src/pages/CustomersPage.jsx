// src/pages/CustomersPage.jsx
import { useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import { FiSearch, FiPlus, FiUsers, FiUser, FiPhone, FiMail, FiMapPin, FiShoppingBag, FiStar, FiEye, FiEdit3, FiTrash2, FiCheckCircle, FiX, FiAward, FiPackage, FiDollarSign, FiLoader, FiAlertCircle } from 'react-icons/fi';

const fmt = (n) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(n || 0);

const getMemberConfig = (member) => {
  const configs = {
    VIP: { bg: 'linear-gradient(135deg,#F59E0B,#FBBF24)', color: '#fff', icon: <FiStar size={10} />, label: 'VIP' },
    Regular: { bg: 'linear-gradient(135deg,#3B82F6,#60A5FA)', color: '#fff', icon: <FiUser size={10} />, label: 'Regular' },
    New: { bg: 'linear-gradient(135deg,#10B981,#34D399)', color: '#fff', icon: <FiAward size={10} />, label: 'Baru' },
  };
  return configs[member] || configs.New;
};

const Avatar = ({ name, avatar, size = 44 }) => {
  const [err, setErr] = useState(false);
  const initials = name
    ?.split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const colors = ['#6366F1', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6'];
  const color = colors[name?.charCodeAt(0) % colors.length] || '#6366F1';

  if (avatar && !err) {
    return <img src={avatar} alt={name} onError={() => setErr(true)} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />;
  }
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontWeight: 800,
        fontSize: size * 0.35,
        flexShrink: 0,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      {initials}
    </div>
  );
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterMember, setFilterMember] = useState('all');
  const [toast, setToast] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editCustomer, setEditCustomer] = useState(null);
  const [deleteCustomer, setDeleteCustomer] = useState(null);
  const [viewCustomer, setViewCustomer] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '' });
  const searchRef = useRef(null);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/customers');
      setCustomers(res.data.data || res.data || []);
    } catch {
      showToast('Gagal memuat data pelanggan', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const filtered = customers.filter((c) => {
    const matchSearch = c.name?.toLowerCase().includes(search.toLowerCase()) || c.email?.toLowerCase().includes(search.toLowerCase()) || c.phone?.includes(search);
    const matchMember = filterMember === 'all' || c.member === filterMember;
    return matchSearch && matchMember;
  });

  const stats = {
    total: customers.length,
    vip: customers.filter((c) => c.member === 'VIP').length,
    regular: customers.filter((c) => c.member === 'Regular').length,
    newC: customers.filter((c) => c.member === 'New').length,
  };

  const handleSave = async () => {
    if (!form.name || !form.email || !form.phone) {
      showToast('Lengkapi nama, email, dan telepon', 'error');
      return;
    }
    setSaving(true);
    try {
      if (editCustomer) {
        const res = await api.put(`/customers/${editCustomer.id}`, {
          name: form.name,
          email: form.email,
          phone: form.phone,
          address: form.address,
        });
        const updated = res.data.data || res.data;
        setCustomers((prev) => prev.map((c) => (c.id === editCustomer.id ? { ...c, ...updated } : c)));
        showToast('Pelanggan berhasil diperbarui');
      } else {
        const res = await api.post('/customers', {
          name: form.name,
          email: form.email,
          phone: form.phone,
          address: form.address,
        });
        const created = res.data.data || res.data;
        setCustomers((prev) => [created, ...prev]);
        showToast('Pelanggan berhasil ditambahkan');
      }
      closeModal();
    } catch (e) {
      const msg = e?.response?.data?.message || 'Gagal menyimpan data';
      showToast(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/customers/${deleteCustomer.id}`);
      setCustomers((prev) => prev.filter((c) => c.id !== deleteCustomer.id));
      setDeleteCustomer(null);
      showToast('Pelanggan berhasil dihapus');
    } catch {
      showToast('Gagal menghapus pelanggan', 'error');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditCustomer(null);
    setForm({ name: '', email: '', phone: '', address: '' });
  };

  const openAdd = () => {
    setEditCustomer(null);
    setForm({ name: '', email: '', phone: '', address: '' });
    setShowModal(true);
  };

  const openEdit = (c) => {
    setEditCustomer(c);
    setForm({ name: c.name || '', email: c.email || '', phone: c.phone || '', address: c.address || '' });
    setShowModal(true);
  };

  return (
    <div style={S.page}>
      {/* STYLES */}
      <style>{`
        * { box-sizing: border-box; }

        .cust-row { transition: background 0.15s; }
        .cust-row:hover { background: #F0FDF4 !important; }

        .stat-card { transition: transform 0.2s, box-shadow 0.2s; }
        .stat-card:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,0.1) !important; }

        .action-btn { transition: transform 0.15s; }
        .action-btn:hover { transform: scale(1.12); }

        .add-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 28px rgba(5,59,47,0.35) !important; }

        .filter-chip { transition: all 0.2s; }
        .filter-chip:hover { transform: translateY(-1px); }

        .modal-anim { animation: modalPop 0.25s cubic-bezier(0.16,1,0.3,1); }
        @keyframes modalPop { from { opacity:0; transform:scale(0.94) translateY(12px); } to { opacity:1; transform:scale(1) translateY(0); } }

        .toast-anim { animation: toastIn 0.3s cubic-bezier(0.16,1,0.3,1); }
        @keyframes toastIn { from { opacity:0; transform:translateX(60px); } to { opacity:1; transform:translateX(0); } }

        .fade-in { animation: fadeIn 0.35s ease both; }
        @keyframes fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }

        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        input:focus { border-color: #053B2F !important; outline: none; box-shadow: 0 0 0 3px rgba(5,59,47,0.1); }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 4px; }
      `}</style>

      {/* TOAST */}
      {toast && (
        <div
          className="toast-anim"
          style={{
            position: 'fixed',
            top: 24,
            right: 24,
            zIndex: 9999,
            background: toast.type === 'error' ? 'linear-gradient(135deg,#DC2626,#EF4444)' : 'linear-gradient(135deg,#053B2F,#0F5C47)',
            color: '#fff',
            padding: '14px 18px',
            borderRadius: 16,
            boxShadow: '0 15px 40px rgba(0,0,0,.25)',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            minWidth: 300,
          }}
        >
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {toast.type === 'error' ? <FiAlertCircle size={18} /> : <FiCheckCircle size={18} />}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 13 }}>{toast.type === 'error' ? 'Gagal' : 'Berhasil'}</div>
            <div style={{ fontSize: 12, opacity: 0.9 }}>{toast.message}</div>
          </div>
          <button onClick={() => setToast(null)} style={{ border: 0, background: 'transparent', color: '#fff', cursor: 'pointer', padding: 4 }}>
            <FiX size={16} />
          </button>
        </div>
      )}

      {/* HEADER */}
      <div style={S.header}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div style={S.headerIcon}>
              <FiUsers size={20} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#64748B', letterSpacing: 1, textTransform: 'uppercase' }}>Manajemen</span>
          </div>
          <h1 style={S.title}>Pelanggan</h1>
          <p style={S.sub}>{customers.length} pelanggan terdaftar</p>
        </div>
        <button className="add-btn" onClick={openAdd} style={S.addBtn}>
          <FiPlus size={18} /> Tambah Pelanggan
        </button>
      </div>

      {/* STAT CARDS */}
      <div style={S.statsGrid}>
        {[
          { label: 'Total Pelanggan', value: stats.total, icon: <FiUsers size={20} />, bg: 'linear-gradient(135deg,#0F172A,#1E293B)', accent: '#38BDF8' },
          { label: 'Pelanggan VIP', value: stats.vip, icon: <FiStar size={20} />, bg: 'linear-gradient(135deg,#78350F,#B45309)', accent: '#FCD34D' },
          { label: 'Regular', value: stats.regular, icon: <FiUser size={20} />, bg: 'linear-gradient(135deg,#1E3A5F,#1D4ED8)', accent: '#93C5FD' },
          { label: 'Pelanggan Baru', value: stats.newC, icon: <FiAward size={20} />, bg: 'linear-gradient(135deg,#064E3B,#059669)', accent: '#6EE7B7' },
        ].map((s, i) => (
          <div key={i} className="stat-card" style={{ ...S.statCard, background: s.bg }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: s.accent, letterSpacing: 0.5, marginBottom: 10, textTransform: 'uppercase' }}>{s.label}</div>
                <div style={{ fontSize: 34, fontWeight: 800, color: '#fff', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{s.value}</div>
              </div>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(255,255,255,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.accent }}>{s.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* SEARCH & FILTER */}
      <div style={S.toolbar}>
        <div style={S.searchWrap}>
          <FiSearch size={18} color="#94A3B8" />
          <input ref={searchRef} value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari nama, email, atau telepon..." style={S.searchInput} />
          {search && (
            <button onClick={() => setSearch('')} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: '#94A3B8', display: 'flex', padding: 0 }}>
              <FiX size={16} />
            </button>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { key: 'all', label: 'Semua' },
            { key: 'VIP', label: 'VIP' },
            { key: 'Regular', label: 'Regular' },
            { key: 'New', label: 'Baru' },
          ].map((m) => {
            const active = filterMember === m.key;
            return (
              <button
                key={m.key}
                className="filter-chip"
                onClick={() => setFilterMember(m.key)}
                style={{
                  padding: '8px 18px',
                  borderRadius: 10,
                  border: active ? 'none' : '1px solid #E2E8F0',
                  background: active ? '#053B2F' : '#fff',
                  color: active ? '#fff' : '#64748B',
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                  fontFamily: "'Plus Jakarta Sans',sans-serif",
                }}
              >
                {m.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* TABLE */}
      <div style={S.tableWrap}>
        {loading ? (
          <div style={S.centerBox}>
            <FiLoader className="spin" size={36} color="#053B2F" />
            <div style={{ marginTop: 12, color: '#64748B', fontWeight: 600 }}>Memuat data pelanggan...</div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={S.centerBox}>
            <div style={S.emptyIcon}>
              <FiUsers size={32} color="#94A3B8" />
            </div>
            <div style={{ fontWeight: 700, color: '#475569', fontSize: 16 }}>Tidak ada pelanggan</div>
            <div style={{ color: '#94A3B8', fontSize: 14, marginTop: 4 }}>{search ? `Tidak ada hasil untuk "${search}"` : 'Tambahkan pelanggan pertama'}</div>
          </div>
        ) : (
          <table style={S.table}>
            <thead>
              <tr style={{ background: '#F8FAFC' }}>
                {['Pelanggan', 'Kontak', 'Lokasi', 'Transaksi', 'Total Belanja', 'Status', 'Aksi'].map((h, i) => (
                  <th key={h} style={{ ...S.th, textAlign: i === 6 ? 'center' : 'left' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => {
                const mc = getMemberConfig(c.member);
                return (
                  <tr key={c.id} className="cust-row fade-in" style={{ borderBottom: '1px solid #F1F5F9', animationDelay: `${i * 0.04}s` }}>
                    {/* Pelanggan */}
                    <td style={S.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Avatar name={c.name} avatar={c.avatar} />
                        <div>
                          <div style={{ fontWeight: 700, color: '#0F172A', fontSize: 14 }}>{c.name}</div>
                          <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 1 }}>ID #{c.id}</div>
                        </div>
                      </div>
                    </td>

                    {/* Kontak */}
                    <td style={S.td}>
                      <div style={{ fontSize: 13, color: '#475569', display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <FiMail size={12} color="#94A3B8" /> {c.email || '-'}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <FiPhone size={12} color="#94A3B8" /> {c.phone || '-'}
                        </div>
                      </div>
                    </td>

                    {/* Lokasi */}
                    <td style={S.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#475569' }}>
                        <FiMapPin size={13} color="#94A3B8" />
                        {c.address || <span style={{ color: '#CBD5E1' }}>—</span>}
                      </div>
                    </td>

                    {/* Transaksi */}
                    <td style={S.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 10, background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <FiShoppingBag size={14} color="#10B981" />
                        </div>
                        <div>
                          <span style={{ fontWeight: 700, fontSize: 15, color: '#0F172A', fontVariantNumeric: 'tabular-nums' }}>{c.orders || 0}</span>
                          <span style={{ fontSize: 12, color: '#94A3B8', marginLeft: 4 }}>order</span>
                        </div>
                      </div>
                    </td>

                    {/* Total Belanja */}
                    <td style={S.td}>
                      <div style={{ fontWeight: 800, fontSize: 14, color: '#053B2F' }}>{fmt(c.total_spent || c.spent || 0)}</div>
                    </td>

                    {/* Status */}
                    <td style={S.td}>
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                          padding: '5px 12px',
                          borderRadius: 20,
                          background: mc.bg,
                          color: mc.color,
                          fontSize: 11,
                          fontWeight: 800,
                        }}
                      >
                        {mc.icon} {mc.label}
                      </div>
                    </td>

                    {/* Aksi */}
                    <td style={{ ...S.td, textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                        <button
                          className="action-btn"
                          onClick={() => setViewCustomer(c)}
                          title="Detail"
                          style={{ width: 34, height: 34, borderRadius: 10, border: 'none', background: '#EFF6FF', color: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                        >
                          <FiEye size={15} />
                        </button>
                        <button
                          className="action-btn"
                          onClick={() => openEdit(c)}
                          title="Edit"
                          style={{ width: 34, height: 34, borderRadius: 10, border: 'none', background: '#F0FDF4', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                        >
                          <FiEdit3 size={15} />
                        </button>
                        <button
                          className="action-btn"
                          onClick={() => setDeleteCustomer(c)}
                          title="Hapus"
                          style={{ width: 34, height: 34, borderRadius: 10, border: 'none', background: '#FEF2F2', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                        >
                          <FiTrash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* COUNT */}
      {!loading && filtered.length > 0 && (
        <div style={{ padding: '12px 0', color: '#94A3B8', fontSize: 13, fontWeight: 500 }}>
          Menampilkan {filtered.length} dari {customers.length} pelanggan
        </div>
      )}

      {/* ADD / EDIT MODAL */}
      {showModal && (
        <div style={S.overlay}>
          <div className="modal-anim" style={S.modal}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#0F172A' }}>{editCustomer ? 'Edit Pelanggan' : 'Tambah Pelanggan'}</h2>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: '#94A3B8' }}>{editCustomer ? `Perbarui data ${editCustomer.name}` : 'Isi detail pelanggan baru'}</p>
              </div>
              <button onClick={closeModal} style={{ width: 36, height: 36, borderRadius: 10, border: 'none', background: '#F1F5F9', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <FiX size={18} />
              </button>
            </div>

            {[
              { label: 'Nama Lengkap', key: 'name', placeholder: 'Contoh: Budi Santoso', icon: <FiUser size={15} />, required: true },
              { label: 'Email', key: 'email', placeholder: 'budi@email.com', icon: <FiMail size={15} />, required: true },
              { label: 'No. Telepon', key: 'phone', placeholder: '08xxxxxxxxxx', icon: <FiPhone size={15} />, required: true },
              { label: 'Alamat', key: 'address', placeholder: 'Kota, Provinsi', icon: <FiMapPin size={15} />, required: false },
            ].map(({ label, key, placeholder, icon, required }) => (
              <div key={key} style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                  {label} {required && <span style={{ color: '#EF4444' }}>*</span>}
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none' }}>{icon}</div>
                  <input
                    value={form[key]}
                    onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
                    placeholder={placeholder}
                    style={{
                      width: '100%',
                      padding: '12px 14px 12px 40px',
                      borderRadius: 12,
                      border: '1.5px solid #E5E7EB',
                      fontSize: 14,
                      fontWeight: 500,
                      boxSizing: 'border-box',
                      fontFamily: "'Plus Jakarta Sans',sans-serif",
                      transition: 'border-color 0.2s, box-shadow 0.2s',
                      color: '#0F172A',
                    }}
                  />
                </div>
              </div>
            ))}

            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <button
                onClick={closeModal}
                style={{
                  flex: 1,
                  height: 48,
                  borderRadius: 12,
                  border: '1.5px solid #E5E7EB',
                  background: '#fff',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: 14,
                  color: '#475569',
                  fontFamily: "'Plus Jakarta Sans',sans-serif",
                }}
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  flex: 1,
                  height: 48,
                  borderRadius: 12,
                  border: 'none',
                  background: saving ? '#94A3B8' : 'linear-gradient(135deg,#053B2F,#0F5C47)',
                  color: '#fff',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  fontWeight: 700,
                  fontSize: 14,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  fontFamily: "'Plus Jakarta Sans',sans-serif",
                }}
              >
                {saving ? (
                  <>
                    <FiLoader className="spin" size={16} /> Menyimpan...
                  </>
                ) : editCustomer ? (
                  'Perbarui Data'
                ) : (
                  'Simpan'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODAL */}
      {viewCustomer && (
        <div style={S.overlay}>
          <div className="modal-anim" style={{ ...S.modal, padding: 0, overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ background: 'linear-gradient(135deg,#053B2F,#0A5C43)', padding: '32px 30px', textAlign: 'center', position: 'relative' }}>
              <button
                onClick={() => setViewCustomer(null)}
                style={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  border: 'none',
                  background: 'rgba(255,255,255,.15)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <FiX size={16} />
              </button>
              <Avatar name={viewCustomer.name} avatar={viewCustomer.avatar} size={72} />
              <h2 style={{ margin: '12px 0 4px', fontSize: 22, fontWeight: 800, color: '#fff' }}>{viewCustomer.name}</h2>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '4px 14px',
                  borderRadius: 20,
                  background: 'rgba(255,255,255,.15)',
                  color: '#fff',
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                {getMemberConfig(viewCustomer.member).icon} {viewCustomer.member || 'New'}
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid #F1F5F9' }}>
              {[
                { label: 'Total Order', value: viewCustomer.orders || 0, icon: <FiPackage size={16} />, color: '#3B82F6' },
                { label: 'Total Belanja', value: fmt(viewCustomer.total_spent || viewCustomer.spent || 0), icon: <FiDollarSign size={16} />, color: '#10B981' },
              ].map((s, i) => (
                <div key={i} style={{ padding: '20px 24px', borderRight: i === 0 ? '1px solid #F1F5F9' : 'none', textAlign: 'center' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px', color: s.color }}>{s.icon}</div>
                  <div style={{ fontWeight: 800, fontSize: 18, color: '#0F172A', fontVariantNumeric: 'tabular-nums' }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600, marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Detail Info */}
            <div style={{ padding: '20px 30px 28px' }}>
              {[
                { icon: <FiMail size={15} />, label: 'Email', value: viewCustomer.email },
                { icon: <FiPhone size={15} />, label: 'Telepon', value: viewCustomer.phone },
                { icon: <FiMapPin size={15} />, label: 'Alamat', value: viewCustomer.address },
              ].map(({ icon, label, value }, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderBottom: i < 2 ? '1px solid #F8FAFC' : 'none' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', flexShrink: 0 }}>{icon}</div>
                  <div>
                    <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600 }}>{label}</div>
                    <div style={{ fontSize: 14, color: '#0F172A', fontWeight: 600, marginTop: 2 }}>{value || <span style={{ color: '#CBD5E1' }}>Tidak diisi</span>}</div>
                  </div>
                </div>
              ))}

              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <button
                  onClick={() => {
                    setViewCustomer(null);
                    openEdit(viewCustomer);
                  }}
                  style={{
                    flex: 1,
                    height: 44,
                    borderRadius: 12,
                    border: '1.5px solid #E5E7EB',
                    background: '#fff',
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: 13,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    color: '#475569',
                    fontFamily: "'Plus Jakarta Sans',sans-serif",
                  }}
                >
                  <FiEdit3 size={14} /> Edit
                </button>
                <button
                  onClick={() => setViewCustomer(null)}
                  style={{
                    flex: 1,
                    height: 44,
                    borderRadius: 12,
                    border: 'none',
                    background: 'linear-gradient(135deg,#053B2F,#0F5C47)',
                    color: '#fff',
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: 13,
                    fontFamily: "'Plus Jakarta Sans',sans-serif",
                  }}
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteCustomer && (
        <div style={S.overlay}>
          <div className="modal-anim" style={{ ...S.modal, textAlign: 'center' }}>
            <div style={{ width: 72, height: 72, borderRadius: 20, background: '#FEF2F2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <FiTrash2 size={30} />
            </div>
            <h2 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 800, color: '#0F172A' }}>Hapus Pelanggan?</h2>
            <p style={{ color: '#64748B', fontSize: 14, lineHeight: 1.7, margin: '0 0 24px' }}>
              Data <strong style={{ color: '#0F172A' }}>{deleteCustomer.name}</strong> akan dihapus secara permanen dan tidak dapat dikembalikan.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setDeleteCustomer(null)}
                style={{
                  flex: 1,
                  height: 48,
                  borderRadius: 12,
                  border: '1.5px solid #E5E7EB',
                  background: '#fff',
                  cursor: 'pointer',
                  fontWeight: 700,
                  color: '#475569',
                  fontFamily: "'Plus Jakarta Sans',sans-serif",
                }}
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                style={{
                  flex: 1,
                  height: 48,
                  borderRadius: 12,
                  border: 'none',
                  background: 'linear-gradient(135deg,#DC2626,#EF4444)',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontFamily: "'Plus Jakarta Sans',sans-serif",
                }}
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const S = {
  page: {
    padding: '32px 36px',
    background: '#F8FAFC',
    minHeight: '100vh',
    fontFamily: "'Plus Jakarta Sans',sans-serif",
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 28,
  },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    background: '#ECFDF5',
    color: '#053B2F',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    margin: 0,
    fontSize: 30,
    fontWeight: 900,
    color: '#0F172A',
    lineHeight: 1.1,
  },
  sub: {
    margin: '6px 0 0',
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: 500,
  },
  addBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '12px 22px',
    borderRadius: 14,
    border: 'none',
    background: 'linear-gradient(135deg,#053B2F,#0F5C47)',
    color: '#fff',
    fontWeight: 700,
    fontSize: 14,
    cursor: 'pointer',
    boxShadow: '0 6px 20px rgba(5,59,47,0.25)',
    fontFamily: "'Plus Jakarta Sans',sans-serif",
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4,1fr)',
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    borderRadius: 18,
    padding: '20px 22px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
  },
  toolbar: {
    display: 'flex',
    gap: 12,
    marginBottom: 20,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  searchWrap: {
    flex: 1,
    minWidth: 200,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    background: '#fff',
    borderRadius: 12,
    padding: '0 16px',
    height: 46,
    border: '1.5px solid #E2E8F0',
  },
  searchInput: {
    flex: 1,
    border: 'none',
    outline: 'none',
    fontSize: 14,
    fontWeight: 500,
    background: 'transparent',
    fontFamily: "'Plus Jakarta Sans',sans-serif",
    color: '#0F172A',
  },
  tableWrap: {
    background: '#fff',
    borderRadius: 18,
    border: '1px solid #E2E8F0',
    overflow: 'hidden',
    boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    padding: '14px 18px',
    textAlign: 'left',
    fontSize: 11,
    fontWeight: 800,
    color: '#94A3B8',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    borderBottom: '1px solid #F1F5F9',
  },
  td: {
    padding: '14px 18px',
    fontSize: 14,
    color: '#475569',
    verticalAlign: 'middle',
  },
  centerBox: {
    padding: 60,
    textAlign: 'center',
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    background: '#F1F5F9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px',
  },
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(15,23,42,.55)',
    backdropFilter: 'blur(6px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: 24,
  },
  modal: {
    background: '#fff',
    borderRadius: 24,
    padding: 30,
    width: '100%',
    maxWidth: 440,
    boxShadow: '0 30px 60px rgba(0,0,0,.2)',
  },
};

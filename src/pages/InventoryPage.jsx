// src/pages/InventoryPage.jsx
import { useState, useEffect } from 'react';
import api from '../utils/api';

import { FiSearch, FiPlus, FiEdit3, FiTrash2, FiAlertTriangle, FiCheckCircle, FiPackage, FiRefreshCw, FiMinusCircle, FiX } from 'react-icons/fi';

const fmt = (n) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(n);

export default function InventoryPage() {
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const [restockItem, setRestockItem] = useState(null);
  const [restockQty, setRestockQty] = useState('');

  const [reduceItem, setReduceItem] = useState(null);
  const [reduceQty, setReduceQty] = useState('');

  const [deleteItem, setDeleteItem] = useState(null);

  const [toast, setToast] = useState(null);

  const [form, setForm] = useState({
    name: '',
    unit: 'kg',
    stock: 0,
    min_stock: 0,
    cost_per_unit: 0,
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });

    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const loadData = () => {
    setLoading(true);

    api
      .get('/ingredients?per_page=100')
      .then((r) => {
        setIngredients(r.data.data || r.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = ingredients.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()));

  const lowStock = ingredients.filter((i) => parseFloat(i.stock) <= parseFloat(i.min_stock));

  const handleSave = async () => {
    try {
      if (editItem) {
        await api.put(`/ingredients/${editItem.id}`, form);
      } else {
        await api.post('/ingredients', form);
      }

      setShowModal(false);
      setEditItem(null);

      showToast(editItem ? 'Bahan berhasil diperbarui' : 'Bahan berhasil ditambahkan');

      loadData();
    } catch (e) {
      showToast(e.response?.data?.message || 'Gagal menyimpan', 'error');
    }
  };

  const handleRestock = async () => {
    try {
      await api.post(`/ingredients/${restockItem.id}/restock`, {
        qty: parseFloat(restockQty),
      });

      setRestockItem(null);
      setRestockQty('');

      showToast('Stok berhasil ditambahkan');

      loadData();
    } catch (e) {
      showToast(e.response?.data?.message || 'Gagal restock', 'error');
    }
  };

  const handleReduceStock = async () => {
    try {
      const currentStock = parseFloat(reduceItem.stock);
      const qty = parseFloat(reduceQty);

      if (qty > currentStock) {
        showToast('Stok tidak mencukupi', 'error');
        return;
      }

      const newStock = currentStock - qty;

      await api.put(`/ingredients/${reduceItem.id}`, {
        ...reduceItem,
        stock: newStock,
      });

      showToast('Stok berhasil dikurangi');

      setReduceItem(null);
      setReduceQty('');

      loadData();
    } catch (e) {
      showToast('Gagal mengurangi stok', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/ingredients/${deleteItem.id}`);

      showToast('Bahan berhasil dihapus');

      setDeleteItem(null);

      loadData();
    } catch (e) {
      showToast('Gagal menghapus bahan', 'error');
    }
  };

  const openAdd = () => {
    setForm({
      name: '',
      unit: 'kg',
      stock: 0,
      min_stock: 0,
      cost_per_unit: 0,
    });

    setEditItem(null);
    setShowModal(true);
  };

  const openEdit = (item) => {
    setForm({
      name: item.name,
      unit: item.unit,
      stock: item.stock,
      min_stock: item.min_stock,
      cost_per_unit: item.cost_per_unit,
    });

    setEditItem(item);
    setShowModal(true);
  };

  const getStockStatus = (item) => {
    const ratio = parseFloat(item.stock) / parseFloat(item.min_stock || 1);

    if (ratio <= 1)
      return {
        label: 'Kritis',
        color: '#DC2626',
        bg: '#FEF2F2',
      };

    if (ratio <= 1.5)
      return {
        label: 'Rendah',
        color: '#D97706',
        bg: '#FFFBEB',
      };

    return {
      label: 'Aman',
      color: '#166534',
      bg: '#F0FDF4',
    };
  };

  return (
    <div
      style={{
        padding: '24px',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        background: '#F8FAF7',
        minHeight: '100vh',
      }}
    >
      {/* TOAST */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: 24,
            right: 24,
            zIndex: 9999,
            minWidth: 320,
            background: toast.type === 'error' ? 'linear-gradient(135deg,#DC2626,#EF4444)' : 'linear-gradient(135deg,#16A34A,#22C55E)',
            color: '#fff',
            padding: '16px 20px',
            borderRadius: 18,
            boxShadow: '0 15px 35px rgba(0,0,0,.2)',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            animation: 'toastIn .35s ease',
          }}
        >
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              background: 'rgba(255,255,255,.18)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {toast.type === 'error' ? <FiAlertTriangle size={20} /> : <FiCheckCircle size={20} />}
          </div>

          <div style={{ flex: 1 }}>
            <div
              style={{
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              {toast.type === 'error' ? 'Terjadi Kesalahan' : 'Berhasil'}
            </div>

            <div
              style={{
                fontSize: 13,
                opacity: 0.95,
              }}
            >
              {toast.message}
            </div>
          </div>

          <button
            onClick={() => setToast(null)}
            style={{
              border: 0,
              background: 'transparent',
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            <FiX size={18} />
          </button>
        </div>
      )}

      {/* HEADER */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 24,
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: 28,
              fontWeight: 800,
              color: '#1A3C2B',
            }}
          >
            Inventori Bahan
          </h1>

          <p
            style={{
              margin: '6px 0 0',
              color: '#64748B',
              fontSize: 14,
            }}
          >
            Kelola stok bahan baku dengan mudah
          </p>
        </div>

        <button
          onClick={openAdd}
          style={{
            padding: '12px 20px',
            background: 'linear-gradient(135deg,#3DAF6A,#1A7A42)',
            color: '#fff',
            border: 'none',
            borderRadius: 14,
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            boxShadow: '0 10px 20px rgba(61,175,106,.25)',
          }}
        >
          <FiPlus size={18} />
          Tambah Bahan
        </button>
      </div>

      {/* ALERT */}
      {lowStock.length > 0 && (
        <div
          style={{
            background: '#FFFBEB',
            border: '1.5px solid #FCD34D',
            borderRadius: 16,
            padding: '16px 18px',
            marginBottom: 22,
            display: 'flex',
            alignItems: 'center',
            gap: 14,
          }}
        >
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: 14,
              background: '#FEF3C7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#D97706',
            }}
          >
            <FiAlertTriangle size={22} />
          </div>

          <div>
            <div
              style={{
                fontWeight: 700,
                color: '#92400E',
                fontSize: 14,
              }}
            >
              {lowStock.length} bahan stok rendah / kritis
            </div>

            <div
              style={{
                fontSize: 13,
                color: '#A16207',
                marginTop: 4,
              }}
            >
              {lowStock.map((i) => i.name).join(', ')}
            </div>
          </div>
        </div>
      )}

      {/* SEARCH */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          background: '#fff',
          border: '1.5px solid #E2E8E0',
          borderRadius: 14,
          padding: '0 14px',
          marginBottom: 18,
          height: 52,
        }}
      >
        <FiSearch color="#94A3B8" size={18} />

        <input
          placeholder="Cari bahan..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '100%',
            border: 'none',
            outline: 'none',
            marginLeft: 10,
            fontSize: 14,
            background: 'transparent',
          }}
        />
      </div>

      {/* TABLE */}
      <div
        style={{
          background: '#fff',
          borderRadius: 18,
          border: '1px solid #E8F0E6',
          overflow: 'hidden',
          boxShadow: '0 10px 30px rgba(0,0,0,.03)',
        }}
      >
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
          }}
        >
          <thead>
            <tr
              style={{
                background: '#F8FAF7',
              }}
            >
              {['Nama Bahan', 'Satuan', 'Stok', 'Min. Stok', 'Harga', 'Status', 'Aksi'].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: '14px 16px',
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
            {loading ? (
              <tr>
                <td
                  colSpan={7}
                  style={{
                    textAlign: 'center',
                    padding: 50,
                    color: '#94A3B8',
                  }}
                >
                  Memuat data...
                </td>
              </tr>
            ) : (
              filtered.map((item) => {
                const status = getStockStatus(item);

                const pct = Math.min(100, (parseFloat(item.stock) / Math.max(parseFloat(item.min_stock) * 2, 1)) * 100);

                return (
                  <tr
                    key={item.id}
                    style={{
                      borderTop: '1px solid #F1F5F9',
                    }}
                  >
                    <td
                      style={{
                        padding: '14px 16px',
                        fontWeight: 700,
                        color: '#1A3C2B',
                      }}
                    >
                      {item.name}
                    </td>

                    <td
                      style={{
                        padding: '14px 16px',
                        color: '#64748B',
                        fontSize: 13,
                      }}
                    >
                      {item.unit}
                    </td>

                    <td
                      style={{
                        padding: '14px 16px',
                      }}
                    >
                      <div
                        style={{
                          fontWeight: 700,
                          marginBottom: 6,
                        }}
                      >
                        {parseFloat(item.stock).toFixed(2)} {item.unit}
                      </div>

                      <div
                        style={{
                          width: 90,
                          height: 5,
                          borderRadius: 999,
                          background: '#E5E7EB',
                        }}
                      >
                        <div
                          style={{
                            width: `${pct}%`,
                            height: '100%',
                            borderRadius: 999,
                            background: pct > 50 ? '#22C55E' : pct > 25 ? '#F59E0B' : '#DC2626',
                          }}
                        />
                      </div>
                    </td>

                    <td
                      style={{
                        padding: '14px 16px',
                        color: '#64748B',
                        fontSize: 13,
                      }}
                    >
                      {parseFloat(item.min_stock).toFixed(2)} {item.unit}
                    </td>

                    <td
                      style={{
                        padding: '14px 16px',
                        fontWeight: 700,
                        color: '#1A3C2B',
                      }}
                    >
                      {fmt(item.cost_per_unit)}
                    </td>

                    <td
                      style={{
                        padding: '14px 16px',
                      }}
                    >
                      <span
                        style={{
                          background: status.bg,
                          color: status.color,
                          borderRadius: 999,
                          padding: '5px 12px',
                          fontSize: 12,
                          fontWeight: 700,
                        }}
                      >
                        {status.label}
                      </span>
                    </td>

                    <td
                      style={{
                        padding: '14px 16px',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          gap: 8,
                        }}
                      >
                        {/* RESTOCK */}
                        <button
                          onClick={() => setRestockItem(item)}
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 10,
                            border: 'none',
                            background: '#ECFDF3',
                            color: '#15803D',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                          }}
                        >
                          <FiRefreshCw size={16} />
                        </button>

                        {/* REDUCE */}
                        <button
                          onClick={() => setReduceItem(item)}
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 10,
                            border: 'none',
                            background: '#FFF7ED',
                            color: '#EA580C',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                          }}
                        >
                          <FiMinusCircle size={16} />
                        </button>

                        {/* EDIT */}
                        <button
                          onClick={() => openEdit(item)}
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 10,
                            border: 'none',
                            background: '#EFF6FF',
                            color: '#2563EB',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                          }}
                        >
                          <FiEdit3 size={16} />
                        </button>

                        {/* DELETE */}
                        <button
                          onClick={() => setDeleteItem(item)}
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 10,
                            border: 'none',
                            background: '#FEF2F2',
                            color: '#DC2626',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                          }}
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL TAMBAH / EDIT */}
      {showModal && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <h2 style={titleStyle}>{editItem ? 'Edit Bahan' : 'Tambah Bahan'}</h2>

            {[
              ['Nama Bahan', 'name'],
              ['Satuan', 'unit'],
              ['Stok', 'stock'],
              ['Min. Stok', 'min_stock'],
              ['Harga', 'cost_per_unit'],
            ].map(([label, key]) => (
              <div key={key} style={{ marginBottom: 16 }}>
                <label style={labelStyle}>{label}</label>

                <input
                  value={form[key]}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      [key]: e.target.value,
                    }))
                  }
                  style={inputStyle}
                />
              </div>
            ))}

            <div style={actionStyle}>
              <button onClick={() => setShowModal(false)} style={secondaryBtn}>
                Batal
              </button>

              <button onClick={handleSave} style={primaryBtn}>
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RESTOCK MODAL */}
      {restockItem && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <h2 style={titleStyle}>Restock Bahan</h2>

            <input type="number" placeholder="Jumlah restock" value={restockQty} onChange={(e) => setRestockQty(e.target.value)} style={inputStyle} />

            <div style={actionStyle}>
              <button onClick={() => setRestockItem(null)} style={secondaryBtn}>
                Batal
              </button>

              <button onClick={handleRestock} style={primaryBtn}>
                Restock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REDUCE MODAL */}
      {reduceItem && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <h2 style={titleStyle}>Kurangi Stok</h2>

            <input type="number" placeholder="Jumlah pengurangan" value={reduceQty} onChange={(e) => setReduceQty(e.target.value)} style={inputStyle} />

            <div style={actionStyle}>
              <button onClick={() => setReduceItem(null)} style={secondaryBtn}>
                Batal
              </button>

              <button
                onClick={handleReduceStock}
                style={{
                  ...primaryBtn,
                  background: 'linear-gradient(135deg,#EA580C,#F97316)',
                }}
              >
                Kurangi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteItem && (
        <div style={overlayStyle}>
          <div
            style={{
              ...modalStyle,
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: 70,
                height: 70,
                borderRadius: 20,
                background: '#FEF2F2',
                color: '#DC2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 18px',
              }}
            >
              <FiTrash2 size={30} />
            </div>

            <h2 style={titleStyle}>Hapus Bahan?</h2>

            <p
              style={{
                color: '#64748B',
                fontSize: 14,
                lineHeight: 1.6,
              }}
            >
              Data <strong>{deleteItem.name}</strong> akan dihapus permanen.
            </p>

            <div style={actionStyle}>
              <button onClick={() => setDeleteItem(null)} style={secondaryBtn}>
                Batal
              </button>

              <button
                onClick={handleDelete}
                style={{
                  ...primaryBtn,
                  background: 'linear-gradient(135deg,#DC2626,#EF4444)',
                }}
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STYLE */}
      <style>
        {`
        @keyframes toastIn {
          from {
            opacity:0;
            transform:translateY(-20px) translateX(20px);
          }
          to {
            opacity:1;
            transform:translateY(0) translateX(0);
          }
        }

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

const overlayStyle = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,.45)',
  backdropFilter: 'blur(5px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
};

const modalStyle = {
  background: '#fff',
  borderRadius: 24,
  padding: 30,
  width: 420,
  boxShadow: '0 25px 50px rgba(0,0,0,.2)',
};

const titleStyle = {
  margin: '0 0 20px',
  color: '#1A3C2B',
  fontWeight: 800,
};

const labelStyle = {
  display: 'block',
  fontSize: 13,
  fontWeight: 700,
  marginBottom: 7,
  color: '#374151',
};

const inputStyle = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: 12,
  border: '1.5px solid #E5E7EB',
  outline: 'none',
  fontSize: 14,
  boxSizing: 'border-box',
};

const actionStyle = {
  display: 'flex',
  gap: 12,
  marginTop: 24,
};

const secondaryBtn = {
  flex: 1,
  height: 48,
  borderRadius: 12,
  border: '1px solid #E5E7EB',
  background: '#fff',
  cursor: 'pointer',
  fontWeight: 700,
};

const primaryBtn = {
  flex: 1,
  height: 48,
  borderRadius: 12,
  border: 'none',
  background: 'linear-gradient(135deg,#3DAF6A,#1A7A42)',
  color: '#fff',
  cursor: 'pointer',
  fontWeight: 700,
};

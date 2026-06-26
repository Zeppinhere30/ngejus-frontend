// src/pages/ProductsPage.jsx
import { useState, useEffect } from 'react';
import api from '../utils/api';
import { FiSearch, FiPlus, FiEdit3, FiTrash2, FiBox, FiTag, FiStar, FiGrid, FiTrendingUp, FiFilter, FiEye, FiHeart, FiLoader, FiX, FiCheck, FiAlertCircle, FiUploadCloud } from 'react-icons/fi';

const fmt = (n) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(n || 0);

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState(null);
  const [detailModal, setDetailModal] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);

  const [formModal, setFormModal] = useState({
    show: false,
    edit: false,
    data: null,
  });

  // State form diubah untuk menampung file fisik
  const [form, setForm] = useState({
    name: '',
    price: '',
    description: '',
    image_url: '', // Untuk preview gambar lama saat mode Edit
    image_file: null, // Untuk menampung file upload baru
  });

  const [previewImage, setPreviewImage] = useState(null); // Preview gambar sebelum diupload

  useEffect(() => {
    loadProducts();
  }, []);

  const notify = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/products');
      setProducts(res.data.data || res.data);
    } catch (err) {
      console.log(err);
      notify('Gagal memuat produk', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filtered = products.filter((product) => product.name?.toLowerCase().includes(search.toLowerCase()));
  const totalSold = products.reduce((a, b) => a + (b.sold || 0), 0);

  const openAddModal = () => {
    setForm({
      name: '',
      price: '',
      description: '',
      image_url: '',
      image_file: null,
    });
    setPreviewImage(null);
    setFormModal({ show: true, edit: false, data: null });
  };

  const openEditModal = (product) => {
    setForm({
      name: product.name || '',
      price: product.price || '',
      description: product.description || '',
      image_url: product.image_url || '',
      image_file: null,
    });
    setPreviewImage(product.image_url ? `${import.meta.env.VITE_STORAGE_URL}/${product.image_url}` : null);
    setFormModal({ show: true, edit: true, data: product });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({ ...form, image_file: file });
      // Buat local URL untuk preview gambar yang baru dipilih
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    try {
      if (!form.name || !form.price) {
        notify('Lengkapi nama dan harga produk', 'error');
        return;
      }

      // Gunakan FormData untuk mengirim File
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('price', form.price);
      formData.append('description', form.description);

      // Hanya append file jika ada gambar baru yang dipilih
      if (form.image_file) {
        formData.append('image', form.image_file); // Pastikan nama key 'image' sesuai dengan backend
      }

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };

      if (formModal.edit) {
        // Trik khusus: Banyak backend (seperti Laravel) bermasalah membaca file multipart/form-data lewat method PUT.
        // Solusinya adalah mengirim via POST tapi dengan flag _method='PUT'
        formData.append('_method', 'PUT');
        await api.post(`/products/${formModal.data.id}`, formData, config);
        notify('Produk berhasil diperbarui');
      } else {
        if (!form.image_file) {
          notify('Silakan pilih gambar produk', 'error');
          return;
        }
        await api.post('/products', formData, config);
        notify('Produk berhasil ditambahkan');
      }

      setFormModal({ show: false, edit: false, data: null });
      loadProducts();
    } catch (err) {
      console.log(err);
      notify('Gagal menyimpan produk', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/products/${deleteModal.id}`);
      notify('Produk berhasil dihapus');
      setDeleteModal(null);
      loadProducts();
    } catch (err) {
      console.log(err);
      notify('Gagal menghapus produk', 'error');
    }
  };

  return (
    <div style={{ padding: 24, background: '#F8FAFC', minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* TOAST */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: 24,
            right: 24,
            background: toast.type === 'error' ? '#DC2626' : '#16A34A',
            color: '#fff',
            padding: '14px 18px',
            borderRadius: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            zIndex: 9999,
            boxShadow: '0 10px 30px rgba(0,0,0,.15)',
          }}
        >
          {toast.type === 'error' ? <FiAlertCircle /> : <FiCheck />} {toast.message}
        </div>
      )}

      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: '#0F172A' }}>Produk Menu</h1>
          <p style={{ color: '#64748B', marginTop: 6 }}>Kelola produk cafe</p>
        </div>
        <button
          onClick={openAddModal}
          style={{ height: 48, padding: '0 20px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg,#16A34A,#22C55E)', color: '#fff', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
        >
          <FiPlus /> Tambah Produk
        </button>
      </div>

      {/* SUMMARY */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 20 }}>
        {[
          { title: 'Produk', value: products.length, icon: <FiBox />, color: '#2563EB', bg: '#EFF6FF' },
          { title: 'Terjual', value: totalSold, icon: <FiTrendingUp />, color: '#16A34A', bg: '#ECFDF5' },
          { title: 'Kategori', value: '6', icon: <FiGrid />, color: '#EA580C', bg: '#FFF7ED' },
          { title: 'Best Seller', value: products[0]?.name || '-', icon: <FiStar />, color: '#CA8A04', bg: '#FEFCE8' },
        ].map((card) => (
          <div key={card.title} style={{ background: '#fff', borderRadius: 18, padding: 18, border: '1px solid #E2E8F0' }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: card.bg, color: card.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>{card.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#0F172A' }}>{card.value}</div>
            <div style={{ marginTop: 4, color: '#64748B', fontSize: 13 }}>{card.title}</div>
          </div>
        ))}
      </div>

      {/* SEARCH */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <div style={{ flex: 1, background: '#fff', height: 50, borderRadius: 14, border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', padding: '0 16px' }}>
          <FiSearch color="#94A3B8" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari produk..." style={{ border: 'none', outline: 'none', marginLeft: 12, width: '100%', background: 'transparent' }} />
        </div>
        <button style={{ width: 50, borderRadius: 14, border: '1px solid #E2E8F0', background: '#fff', cursor: 'pointer' }}>
          <FiFilter />
        </button>
      </div>

      {/* LOADING / GRID */}
      {loading ? (
        <div style={{ background: '#fff', borderRadius: 24, padding: 80, textAlign: 'center' }}>
          <FiLoader size={40} color="#16A34A" className="spin" />
          <p style={{ marginTop: 20, color: '#64748B' }}>Memuat produk...</p>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 18 }}>
            {filtered.map((product) => (
              <div key={product.id} className="product-card" style={{ background: '#fff', borderRadius: 22, overflow: 'hidden', border: '1px solid #E2E8F0' }}>
                <div style={{ height: 170, overflow: 'hidden', position: 'relative' }}>
                  <img src={`${import.meta.env.VITE_STORAGE_URL}/${product.image_url}`} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button
                    style={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      width: 36,
                      height: 36,
                      borderRadius: 12,
                      border: 'none',
                      background: 'rgba(255,255,255,.9)',
                      color: '#EF4444',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <FiHeart size={15} />
                  </button>
                </div>
                <div style={{ padding: 18 }}>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#0F172A' }}>{product.name}</h3>
                  <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 6, color: '#64748B', fontSize: 12 }}>
                    <FiTag size={12} /> {product.category?.name || 'Kategori'}
                  </div>
                  <div style={{ marginTop: 12, fontSize: 24, fontWeight: 800, color: '#16A34A' }}>{fmt(product.price)}</div>
                  <p style={{ marginTop: 10, color: '#64748B', fontSize: 12, lineHeight: 1.6, minHeight: 40 }}>{product.description.length > 60 ? product.description.substring(0, 60) + '...' : product.description}</p>
                  <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                    <button
                      onClick={() => setDetailModal(product)}
                      style={{ flex: 1, height: 42, borderRadius: 12, border: 'none', background: '#F8FAFC', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontWeight: 700 }}
                    >
                      <FiEye size={15} />
                    </button>
                    <button onClick={() => openEditModal(product)} style={{ width: 42, borderRadius: 12, border: 'none', background: '#EFF6FF', color: '#2563EB', cursor: 'pointer' }}>
                      <FiEdit3 />
                    </button>
                    <button onClick={() => setDeleteModal(product)} style={{ width: 42, borderRadius: 12, border: 'none', background: '#FEF2F2', color: '#DC2626', cursor: 'pointer' }}>
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div style={{ marginTop: 40, background: '#fff', borderRadius: 24, padding: 60, textAlign: 'center' }}>
              <FiBox size={40} color="#94A3B8" />
              <h3 style={{ marginTop: 20, color: '#0F172A' }}>Produk tidak ditemukan</h3>
            </div>
          )}
        </>
      )}

      {/* DETAIL MODAL */}
      {detailModal && (
        <div style={overlay}>
          <div style={modal}>
            <img src={`${import.meta.env.VITE_STORAGE_URL}/${detailModal.image_url}`} alt={detailModal.name} style={{ width: '100%', height: 220, objectFit: 'cover', borderRadius: 16 }} />
            <h2 style={{ marginTop: 18, color: '#0F172A' }}>{detailModal.name}</h2>
            <p style={{ color: '#64748B', lineHeight: 1.6 }}>{detailModal.description}</p>
            <div style={{ marginTop: 18, fontSize: 28, fontWeight: 800, color: '#16A34A' }}>{fmt(detailModal.price)}</div>
            <button onClick={() => setDetailModal(null)} style={primaryBtn}>
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteModal && (
        <div style={overlay}>
          <div style={modal}>
            <div style={{ width: 70, height: 70, borderRadius: 20, background: '#FEF2F2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <FiTrash2 size={28} />
            </div>
            <h2 style={{ textAlign: 'center', color: '#0F172A' }}>Hapus Produk?</h2>
            <p style={{ textAlign: 'center', color: '#64748B', lineHeight: 1.6 }}>Produk akan dihapus permanen.</p>
            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button onClick={() => setDeleteModal(null)} style={secondaryBtn}>
                Batal
              </button>
              <button onClick={handleDelete} style={{ ...primaryBtn, marginTop: 0, flex: 1, background: '#DC2626' }}>
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FORM MODAL (ADD / EDIT) */}
      {formModal.show && (
        <div style={overlay}>
          <div style={{ ...modal, width: 500 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ margin: 0, color: '#0F172A' }}>{formModal.edit ? 'Edit Produk' : 'Tambah Produk'}</h2>
              <button onClick={() => setFormModal({ show: false, edit: false, data: null })} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
                <FiX size={20} />
              </button>
            </div>

            {/* Gambar Upload Area */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Gambar Produk</label>
              <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                {previewImage ? (
                  <img src={previewImage} alt="Preview" style={{ width: 100, height: 100, borderRadius: 12, objectFit: 'cover', border: '1px solid #E2E8F0' }} />
                ) : (
                  <div style={{ width: 100, height: 100, borderRadius: 12, background: '#F1F5F9', border: '1px dashed #CBD5E1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}>
                    <FiUploadCloud size={24} />
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'block', width: '100%', padding: '10px 0', fontSize: 13, color: '#64748B' }} />
                  <p style={{ margin: 0, fontSize: 11, color: '#94A3B8' }}>Format: JPG, PNG. Maksimal 2MB.</p>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Nama Produk</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={inputStyle} placeholder="Cth: Ayam Geprek" />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Harga (Rp)</label>
              <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} style={inputStyle} placeholder="Cth: 25000" />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Deskripsi</label>
              <textarea
                rows="3"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                style={{ ...inputStyle, height: 'auto', paddingTop: 12, resize: 'none' }}
                placeholder="Tuliskan deksripsi produk..."
              />
            </div>

            <button onClick={handleSave} style={primaryBtn}>
              Simpan Produk
            </button>
          </div>
        </div>
      )}

      {/* STYLE */}
      <style>{`
        .product-card { transition: .25s; }
        .product-card:hover { transform: translateY(-4px); box-shadow: 0 20px 40px rgba(0,0,0,.06); }
        .product-card img { transition: .4s; }
        .product-card:hover img { transform: scale(1.05); }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

// Reusable Styles
const overlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 };
const modal = { width: 420, background: '#fff', borderRadius: 24, padding: 24, boxShadow: '0 30px 60px rgba(0,0,0,.15)' };
const primaryBtn = { width: '100%', height: 48, borderRadius: 14, border: 'none', background: 'linear-gradient(135deg,#16A34A,#22C55E)', color: '#fff', fontWeight: 700, cursor: 'pointer', marginTop: 18 };
const secondaryBtn = { flex: 1, height: 48, borderRadius: 14, border: '1px solid #E2E8F0', background: '#fff', color: '#334155', fontWeight: 700, cursor: 'pointer' };
const labelStyle = { display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 700, color: '#334155' };
const inputStyle = { width: '100%', height: 48, borderRadius: 12, border: '1px solid #E2E8F0', padding: '0 14px', outline: 'none', fontFamily: 'inherit' };

// src/pages/POSPage.jsx
import { useState, useEffect } from 'react';
import api from '../utils/api';
import { FiSearch, FiPlus, FiMinus, FiTrash2, FiShoppingBag, FiDollarSign, FiCreditCard, FiCheck, FiAlertCircle, FiLoader, FiBox, FiSmartphone, FiX } from 'react-icons/fi';

const fmt = (n) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(n || 0);

export default function POSPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [cart, setCart] = useState([]);

  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [amountPaid, setAmountPaid] = useState('');
  const [discount, setDiscount] = useState(0);
  const [note, setNote] = useState('');

  const [toast, setToast] = useState(null);
  const [showQRIS, setShowQRIS] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receipt, setReceipt] = useState(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/products');
      setProducts(res.data.data || res.data);
    } catch (e) {
      showToast('Gagal memuat produk', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  };

  const filteredProducts = products.filter((p) => p.name?.toLowerCase().includes(search.toLowerCase()));

  // =========================================================
  // CART LOGIC
  // =========================================================

  const addToCart = (product) => {
    const exist = cart.find((i) => i.product_id === product.id);
    if (exist) {
      setCart((prev) => prev.map((i) => (i.product_id === product.id ? { ...i, qty: i.qty + 1 } : i)));
    } else {
      setCart((prev) => [
        ...prev,
        {
          product_id: product.id,
          name: product.name,
          price: product.price,
          image_url: product.image_url,
          qty: 1,
        },
      ]);
    }
    showToast(`${product.name} ditambahkan`);
  };

  const increaseQty = (id) => setCart((prev) => prev.map((i) => (i.product_id === id ? { ...i, qty: i.qty + 1 } : i)));
  const decreaseQty = (id) => {
    const item = cart.find((i) => i.product_id === id);
    if (item.qty <= 1) {
      removeItem(id);
      return;
    }
    setCart((prev) => prev.map((i) => (i.product_id === id ? { ...i, qty: i.qty - 1 } : i)));
  };
  const removeItem = (id) => {
    setCart((prev) => prev.filter((i) => i.product_id !== id));
    showToast('Produk dihapus', 'error');
  };

  // =========================================================
  // CALCULATIONS & CHECKOUT
  // =========================================================

  const subtotal = cart.reduce((a, b) => a + b.price * b.qty, 0);
  const total = subtotal - discount;
  const change = (parseFloat(amountPaid) || 0) - total;

  const processPayment = async () => {
    try {
      const order = await api.post('/orders', {
        items: cart.map((i) => ({ product_id: i.product_id, qty: i.qty })),
        payment_method: paymentMethod,
        discount,
        notes: note,
      });

      const orderId = order.data.data.id;
      await api.post(`/orders/${orderId}/pay`, { amount_paid: parseFloat(amountPaid) || total });

      setReceipt({
        order_id: orderId,
        total,
        payment_method: paymentMethod,
        total_item: cart.length,
        discount,
        time: new Date().toLocaleTimeString('id-ID'),
      });

      setShowReceipt(true);
      setShowQRIS(false);
      setCart([]);
      setAmountPaid('');
      setDiscount(0);
      setNote('');
      showToast('Pembayaran berhasil');
    } catch (e) {
      showToast('Pembayaran gagal', 'error');
    }
  };

  const checkout = async () => {
    if (cart.length === 0) {
      showToast('Keranjang kosong', 'error');
      return;
    }
    if (paymentMethod === 'cash' && parseFloat(amountPaid || 0) < total) {
      showToast('Uang pembayaran kurang', 'error');
      return;
    }
    if (paymentMethod === 'qris') {
      setShowQRIS(true);
      setTimeout(processPayment, 3000);
      return;
    }
    processPayment();
  };

  // =========================================================
  // UI RENDER
  // =========================================================

  return (
    <div style={styles.wrapper}>
      {toast && (
        <div className="toast-slide" style={{ ...styles.toast, background: toast.type === 'error' ? '#EF4444' : '#053B2F', border: `1px solid ${toast.type === 'error' ? '#F87171' : '#10B981'}` }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {toast.type === 'error' ? <FiAlertCircle size={16} /> : <FiCheck size={16} />}
          </div>
          <span style={{ fontSize: 14 }}>{toast.message}</span>
        </div>
      )}

      {/* HEADER SECTION */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Kasir (POS)</h1>
          <p style={styles.sub}>NgeJus Smart Cashier Workspace</p>
        </div>
        <div style={styles.topCard}>
          <div style={styles.topIcon}>
            <FiShoppingBag size={20} />
          </div>
          <div>
            <div style={styles.topValue}>{cart.length}</div>
            <div style={styles.topLabel}>Item Aktif</div>
          </div>
        </div>
      </div>

      {/* KUNCI FIX: PISAHKAN SCROLL KIRI (PRODUK) & KANAN (CART) SECARA ABSOLUT */}
      <div className="pos-layout" style={styles.posLayout}>
        {/* LEFT COLUMN: PRODUCTS AREA (BISA DI-SCROLL) */}
        <div className="custom-scroll" style={styles.leftColumn}>
          <div style={styles.searchBox}>
            <FiSearch size={20} color="#64748B" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari menu favorit pelanggan..." style={styles.searchInput} />
          </div>

          {loading ? (
            <div style={styles.loading}>
              <FiLoader className="spin" size={42} color="#10B981" />
              <div style={{ marginTop: 12, color: '#64748B', fontWeight: 600 }}>Memuat katalog...</div>
            </div>
          ) : (
            <div style={styles.productGrid}>
              {filteredProducts.map((product) => (
                <div key={product.id} className="product-card" style={styles.productCard}>
                  <div style={styles.imageWrap}>
                    <img
                      src={`${import.meta.env.VITE_STORAGE_URL}/${product.image_url}`}
                      alt={product.name}
                      style={styles.image}
                      onError={(e) => {
                        e.target.src = 'https://placehold.co/400x400?text=No+Image';
                      }}
                    />
                  </div>
                  <div style={styles.productBody}>
                    <div>
                      <h3 style={styles.productName}>{product.name}</h3>
                      <div style={styles.productPrice}>{fmt(product.price)}</div>
                    </div>
                    <button className="add-btn" onClick={() => addToCart(product)} style={styles.addBtn}>
                      <FiPlus size={16} /> Tambah
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: FIXED CART AREA (TIDAK IKUT SCROLL UTAMA) */}
        <div style={styles.rightColumn}>
          <div style={styles.cartBox}>
            <div style={styles.cartHeader}>
              <h2 style={styles.cartTitle}>Pesanan</h2>
              <button onClick={() => setCart([])} style={styles.clearBtn} disabled={cart.length === 0}>
                <FiTrash2 size={16} />
              </button>
            </div>

            <div className="custom-scroll" style={styles.cartList}>
              {cart.length === 0 ? (
                <div style={styles.emptyCart}>
                  <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                    <FiBox size={24} color="#94A3B8" />
                  </div>
                  <div>Keranjang Kosong</div>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.product_id} style={styles.cartItem}>
                    <img
                      src={`${item.image_url}`}
                      style={styles.cartImage}
                      onError={(e) => {
                        e.target.src = 'https://placehold.co/100x100?text=Img';
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={styles.cartName}>{item.name}</div>
                      <div style={styles.cartPrice}>{fmt(item.price)}</div>
                      <div style={styles.qtyWrap}>
                        <button onClick={() => decreaseQty(item.product_id)} style={styles.qtyBtn}>
                          <FiMinus size={12} />
                        </button>
                        <div style={styles.qtyText}>{item.qty}</div>
                        <button onClick={() => increaseQty(item.product_id)} style={styles.qtyBtn}>
                          <FiPlus size={12} />
                        </button>
                      </div>
                    </div>
                    <div style={styles.itemTotal}>{fmt(item.price * item.qty)}</div>
                  </div>
                ))
              )}
            </div>

            <div style={styles.cartFooter}>
              <div style={styles.inputGroup}>
                <div style={{ flex: 1, paddingRight: 10 }}>
                  <label style={styles.label}>Diskon</label>
                  <input type="number" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} style={styles.inputSm} placeholder="0" />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={styles.label}>Catatan</label>
                  <input type="text" value={note} onChange={(e) => setNote(e.target.value)} style={styles.inputSm} placeholder="Opsional" />
                </div>
              </div>

              <div style={{ marginTop: 16 }}>
                <div style={styles.paymentGrid}>
                  {[
                    { key: 'cash', title: 'Tunai', icon: <FiDollarSign size={16} /> },
                    { key: 'qris', title: 'QRIS', icon: <FiSmartphone size={16} /> },
                    { key: 'bca', title: 'BCA', icon: <FiCreditCard size={16} /> },
                    { key: 'mandiri', title: 'MDR', icon: <FiCreditCard size={16} /> },
                  ].map((m) => {
                    const active = paymentMethod === m.key;
                    return (
                      <button
                        key={m.key}
                        onClick={() => setPaymentMethod(m.key)}
                        style={{ ...styles.paymentBtn, background: active ? '#ECFDF5' : '#F8FAFC', borderColor: active ? '#10B981' : '#E2E8F0', color: active ? '#053B2F' : '#64748B' }}
                      >
                        {m.icon} <span>{m.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {paymentMethod === 'cash' && (
                <div style={{ marginTop: 16 }}>
                  <input type="number" value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)} style={styles.inputLg} placeholder="Uang Diterima (Rp)" />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 14, fontWeight: 700 }}>
                    <span color="#64748B">Kembali:</span>
                    <span style={{ color: change >= 0 ? '#10B981' : '#EF4444' }}>{fmt(change)}</span>
                  </div>
                </div>
              )}

              <div style={styles.summaryBox}>
                <div style={styles.summaryRow}>
                  <span>Subtotal</span>
                  <span>{fmt(subtotal)}</span>
                </div>
                <div style={styles.summaryRow}>
                  <span>Diskon</span>
                  <span style={{ color: '#EF4444' }}>-{fmt(discount)}</span>
                </div>
                <div style={styles.totalRow}>
                  <span>Total</span>
                  <span>{fmt(total)}</span>
                </div>
                <button className="checkout-btn" onClick={checkout} style={styles.checkoutBtn} disabled={cart.length === 0}>
                  Proses Bayar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QRIS MODAL */}
      {showQRIS && (
        <div style={styles.overlay}>
          <div className="modal-pop" style={styles.modalBox}>
            <button onClick={() => setShowQRIS(false)} style={styles.modalClose}>
              <FiX size={20} />
            </button>
            <div style={{ width: 64, height: 64, borderRadius: 20, background: '#ECFDF5', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <FiSmartphone size={32} />
            </div>
            <h2 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 900 }}>Scan QRIS</h2>
            <div style={{ background: '#fff', border: '2px dashed #E2E8F0', borderRadius: 24, padding: 24, margin: '20px auto', width: 'fit-content' }}>
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=NGEJUS-${total}`} alt="QRIS" style={{ width: 180, height: 180 }} />
            </div>
            <div style={{ fontSize: 32, fontWeight: 900, color: '#053B2F' }}>{fmt(total)}</div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, color: '#10B981', marginTop: 10 }}>
              <FiLoader className="spin" /> Menunggu pembayaran...
            </div>
          </div>
        </div>
      )}

      {/* RECEIPT MODAL */}
      {showReceipt && receipt && (
        <div style={styles.overlay}>
          <div className="modal-pop" style={{ ...styles.modalBox, padding: 0, overflow: 'hidden' }}>
            <div style={{ background: '#053B2F', padding: '32px 24px', color: '#fff' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <FiCheck size={28} color="#10B981" />
              </div>
              <h2 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 900 }}>Pembayaran Sukses!</h2>
            </div>
            <div style={{ padding: '24px' }}>
              <div style={{ fontSize: 32, fontWeight: 900, color: '#0F172A', marginBottom: 20 }}>{fmt(receipt.total)}</div>
              <div style={{ background: '#F8FAFC', borderRadius: 16, padding: 16, border: '1px solid #E2E8F0', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <ReceiptRow label="Order ID" value={`#${receipt.order_id}`} />
                <ReceiptRow label="Waktu" value={receipt.time} />
                <ReceiptRow label="Metode" value={receipt.payment_method.toUpperCase()} />
                <ReceiptRow label="Item" value={`${receipt.total_item} Produk`} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 24 }}>
                <button onClick={() => setShowReceipt(false)} style={{ padding: '14px', borderRadius: 12, border: '1px solid #E2E8F0', background: '#fff', fontWeight: 800, cursor: 'pointer' }}>
                  Tutup
                </button>
                <button
                  onClick={() => {
                    setShowReceipt(false);
                    window.print();
                  }}
                  style={{ padding: '14px', borderRadius: 12, border: 'none', background: '#053B2F', color: '#fff', fontWeight: 800, cursor: 'pointer' }}
                >
                  Cetak
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>
        {`
          * { box-sizing: border-box; }
          .pos-layout { height: calc(100vh - 120px); }
          .product-card:hover { transform: translateY(-3px); box-shadow: 0 10px 20px rgba(0,0,0,0.06); border-color: #CBD5E1 !important; }
          .product-card img { transition: transform 0.4s; }
          .product-card:hover img { transform: scale(1.05); }
          .add-btn { transition: 0.2s; }
          .add-btn:hover { background: #10B981 !important; transform: translateY(-2px); box-shadow: 0 8px 16px rgba(16,185,129,0.2); }
          .checkout-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(5,59,47,0.25); background: #03241D !important; }
          .checkout-btn:disabled { background: #CBD5E1 !important; cursor: not-allowed; }
          .toast-slide { animation: toastAnim 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
          @keyframes toastAnim { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
          .modal-pop { animation: popAnim 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
          @keyframes popAnim { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
          .spin { animation: spin 1s linear infinite; }
          @keyframes spin { to { transform: rotate(360deg); } }
          .custom-scroll::-webkit-scrollbar { width: 5px; }
          .custom-scroll::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 5px; }
          @media(max-width: 1024px) {
            .pos-layout { display: block !important; height: auto; }
            .right-column { width: 100% !important; margin-top: 24px; position: static; }
          }
        `}
      </style>
    </div>
  );
}

function ReceiptRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, borderBottom: '1px dashed #E2E8F0', paddingBottom: 6 }}>
      <span style={{ color: '#64748B' }}>{label}</span>
      <span style={{ fontWeight: 800, color: '#0F172A' }}>{value}</span>
    </div>
  );
}

const styles = {
  wrapper: { background: '#F8FAFC', padding: '24px 32px', height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  toast: { position: 'fixed', top: 24, right: 24, color: '#fff', padding: '12px 16px', borderRadius: 14, display: 'flex', alignItems: 'center', gap: 10, fontWeight: 700, zIndex: 9999, boxShadow: '0 10px 25px rgba(0,0,0,0.15)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexShrink: 0 },
  title: { margin: 0, fontSize: 24, fontWeight: 900, color: '#0F172A' },
  sub: { marginTop: 4, color: '#64748B', fontWeight: 500, fontSize: 14 },
  topCard: { background: '#fff', borderRadius: 14, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 12, border: '1px solid #E2E8F0' },
  topIcon: { width: 36, height: 36, borderRadius: 10, background: '#ECFDF5', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  topValue: { fontSize: 18, fontWeight: 900, color: '#0F172A' },
  topLabel: { fontSize: 11, color: '#64748B', fontWeight: 700 },
  posLayout: { display: 'flex', gap: 24, flex: 1, minHeight: 0 }, // KUNCI UTAMA LAYOUT
  leftColumn: { flex: 1, overflowY: 'auto', paddingRight: 8 },
  rightColumn: { width: 380, flexShrink: 0 }, // UKURAN CART TETAP
  searchBox: { background: '#fff', borderRadius: 14, padding: '0 16px', height: 48, marginBottom: 20, display: 'flex', alignItems: 'center', border: '1px solid #E2E8F0' },
  searchInput: { border: 'none', outline: 'none', background: 'transparent', marginLeft: 10, width: '100%', fontSize: 14, fontWeight: 500 },
  loading: { background: '#fff', borderRadius: 20, padding: 60, textAlign: 'center', border: '1px solid #E2E8F0' },
  productGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 16 },
  productCard: { background: '#fff', borderRadius: 16, overflow: 'hidden', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column' },
  imageWrap: { height: 120, width: '100%', overflow: 'hidden', background: '#F1F5F9' },
  image: { width: '100%', height: '100%', objectFit: 'cover' },
  productBody: { padding: 12, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1 },
  productName: { margin: 0, fontSize: 13, fontWeight: 800, color: '#0F172A', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' },
  productPrice: { fontSize: 14, fontWeight: 900, color: '#10B981', marginTop: 6 },
  addBtn: {
    width: '100%',
    height: 36,
    borderRadius: 10,
    border: 'none',
    background: '#053B2F',
    color: '#fff',
    fontWeight: 800,
    fontSize: 12,
    cursor: 'pointer',
    marginTop: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  cartBox: { background: '#fff', borderRadius: 20, border: '1px solid #E2E8F0', height: '100%', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 40px rgba(0,0,0,0.03)' },
  cartHeader: { padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F1F5F9', flexShrink: 0 },
  cartTitle: { margin: 0, fontSize: 18, fontWeight: 900 },
  clearBtn: { background: 'rgba(239, 68, 68, 0.1)', color: '#DC2626', border: 0, width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
  cartList: { padding: 20, flex: 1, overflowY: 'auto' }, // CART ITEM BISA SCROLL SENDIRI
  emptyCart: { padding: '40px 0', textAlign: 'center', color: '#64748B', fontWeight: 700, fontSize: 13 },
  cartItem: { display: 'flex', gap: 10, marginBottom: 16 },
  cartImage: { width: 50, height: 50, borderRadius: 10, objectFit: 'cover', background: '#F1F5F9' },
  cartName: { fontWeight: 800, color: '#0F172A', fontSize: 12, marginBottom: 2 },
  cartPrice: { color: '#10B981', fontWeight: 800, fontSize: 12 },
  qtyWrap: { display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 },
  qtyBtn: { width: 24, height: 24, borderRadius: 6, border: '1px solid #E2E8F0', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#0F172A' },
  qtyText: { fontWeight: 800, fontSize: 12, width: 16, textAlign: 'center' },
  itemTotal: { fontWeight: 900, color: '#0F172A', fontSize: 13 },
  cartFooter: { padding: 20, borderTop: '1px solid #E2E8F0', background: '#F8FAFC', borderRadius: '0 0 20px 20px', flexShrink: 0 },
  inputGroup: { display: 'flex' },
  label: { fontSize: 11, fontWeight: 800, color: '#475569', display: 'block', marginBottom: 4 },
  inputSm: { width: '100%', height: 36, borderRadius: 8, border: '1px solid #E2E8F0', padding: '0 10px', outline: 'none', fontWeight: 600, fontSize: 12 },
  inputLg: { width: '100%', height: 44, borderRadius: 10, border: '1px solid #10B981', padding: '0 14px', outline: 'none', fontWeight: 800, fontSize: 14, color: '#0F172A' },
  paymentGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 },
  paymentBtn: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '10px 4px', borderRadius: 10, border: '1px solid', cursor: 'pointer', fontSize: 11, fontWeight: 700, transition: '0.2s' },
  summaryBox: { marginTop: 16 },
  summaryRow: { display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13, color: '#64748B', fontWeight: 600 },
  totalRow: { display: 'flex', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTop: '1px dashed #CBD5E1', fontSize: 18, fontWeight: 900, color: '#053B2F' },
  checkoutBtn: { width: '100%', height: 48, borderRadius: 12, border: 'none', background: '#053B2F', color: '#fff', fontWeight: 900, fontSize: 14, marginTop: 16, cursor: 'pointer', transition: '0.2s' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 24 },
  modalBox: { background: '#fff', borderRadius: 28, padding: 32, width: '100%', maxWidth: 360, textAlign: 'center', position: 'relative', boxShadow: '0 25px 50px rgba(0,0,0,0.25)' },
  modalClose: { position: 'absolute', top: 16, right: 16, width: 32, height: 32, borderRadius: 10, border: 'none', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
};

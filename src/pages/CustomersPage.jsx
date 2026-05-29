// src/pages/CustomersPage.jsx

import { useState } from 'react';

import { FiSearch, FiPlus, FiUsers, FiUser, FiPhone, FiMail, FiMapPin, FiShoppingBag, FiTrendingUp, FiStar, FiEye, FiEdit3, FiTrash2, FiFilter, FiCheckCircle, FiX } from 'react-icons/fi';

const customersData = [
  {
    id: 1,
    name: 'Asep Suhaedi',
    email: 'asep@gmail.com',
    phone: '081234567890',
    address: 'Bekasi',
    orders: 24,
    spent: 820000,
    member: 'VIP',
    avatar: 'https://i.pravatar.cc/300?img=12',
  },

  {
    id: 2,
    name: 'Nabila Putri',
    email: 'nabila@gmail.com',
    phone: '081298765432',
    address: 'Jakarta',
    orders: 12,
    spent: 420000,
    member: 'Regular',
    avatar: 'https://i.pravatar.cc/300?img=32',
  },

  {
    id: 3,
    name: 'Rizky Ramadhan',
    email: 'rizky@gmail.com',
    phone: '081111111111',
    address: 'Bandung',
    orders: 31,
    spent: 1200000,
    member: 'VIP',
    avatar: 'https://i.pravatar.cc/300?img=15',
  },

  {
    id: 4,
    name: 'Putri Amelia',
    email: 'putri@gmail.com',
    phone: '082222222222',
    address: 'Bogor',
    orders: 8,
    spent: 210000,
    member: 'New',
    avatar: 'https://i.pravatar.cc/300?img=45',
  },
];

const fmt = (n) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(n);

export default function CustomersPage() {
  const [customers, setCustomers] = useState(customersData);

  const [search, setSearch] = useState('');

  const [toast, setToast] = useState(null);

  const [showModal, setShowModal] = useState(false);

  const [editCustomer, setEditCustomer] = useState(null);

  const [deleteCustomer, setDeleteCustomer] = useState(null);

  const [viewCustomer, setViewCustomer] = useState(null);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });

    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const filtered = customers.filter((customer) => customer.name.toLowerCase().includes(search.toLowerCase()));

  const handleSave = () => {
    if (!form.name || !form.email || !form.phone) {
      showToast('Lengkapi data pelanggan', 'error');
      return;
    }

    if (editCustomer) {
      setCustomers((prev) =>
        prev.map((customer) =>
          customer.id === editCustomer.id
            ? {
                ...customer,
                ...form,
              }
            : customer,
        ),
      );

      showToast('Pelanggan berhasil diperbarui');
    } else {
      const newCustomer = {
        id: Date.now(),
        ...form,
        orders: 0,
        spent: 0,
        member: 'New',
        avatar: 'https://i.pravatar.cc/300',
      };

      setCustomers((prev) => [newCustomer, ...prev]);

      showToast('Pelanggan berhasil ditambahkan');
    }

    setShowModal(false);
    setEditCustomer(null);

    setForm({
      name: '',
      email: '',
      phone: '',
      address: '',
    });
  };

  const handleDelete = () => {
    setCustomers((prev) => prev.filter((customer) => customer.id !== deleteCustomer.id));

    setDeleteCustomer(null);

    showToast('Pelanggan berhasil dihapus');
  };

  const openAdd = () => {
    setEditCustomer(null);

    setForm({
      name: '',
      email: '',
      phone: '',
      address: '',
    });

    setShowModal(true);
  };

  const openEdit = (customer) => {
    setEditCustomer(customer);

    setForm({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
    });

    setShowModal(true);
  };

  return (
    <div
      style={{
        padding: 32,
        background: '#F8FAFC',
        minHeight: '100vh',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
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
            <FiCheckCircle size={20} />
          </div>

          <div style={{ flex: 1 }}>
            <div
              style={{
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              Berhasil
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
          marginBottom: 30,
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: 32,
              fontWeight: 800,
              color: '#0F172A',
            }}
          >
            Pelanggan
          </h1>

          <p
            style={{
              marginTop: 8,
              color: '#64748B',
              fontSize: 14,
            }}
          >
            Kelola data pelanggan dan member
          </p>
        </div>

        <button
          onClick={openAdd}
          style={{
            height: 52,
            padding: '0 22px',
            borderRadius: 14,
            border: 'none',
            background: 'linear-gradient(135deg,#2563EB,#3B82F6)',
            color: '#fff',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            cursor: 'pointer',
            boxShadow: '0 12px 30px rgba(59,130,246,.2)',
          }}
        >
          <FiPlus size={18} />
          Tambah Pelanggan
        </button>
      </div>

      {/* SUMMARY */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4,1fr)',
          gap: 18,
          marginBottom: 28,
        }}
      >
        {[
          {
            title: 'Total Pelanggan',
            value: customers.length,
            icon: <FiUsers size={22} />,
            color: '#2563EB',
            bg: '#EFF6FF',
          },

          {
            title: 'VIP Member',
            value: customers.filter((c) => c.member === 'VIP').length,
            icon: <FiStar size={22} />,
            color: '#CA8A04',
            bg: '#FEFCE8',
          },

          {
            title: 'Total Order',
            value: customers.reduce((a, b) => a + b.orders, 0),
            icon: <FiShoppingBag size={22} />,
            color: '#16A34A',
            bg: '#ECFDF5',
          },

          {
            title: 'Pendapatan',
            value: '2.6JT',
            icon: <FiTrendingUp size={22} />,
            color: '#EA580C',
            bg: '#FFF7ED',
          },
        ].map((card) => (
          <div
            key={card.title}
            style={{
              background: '#fff',
              borderRadius: 22,
              padding: 22,
              border: '1px solid #E2E8F0',
              boxShadow: '0 10px 30px rgba(0,0,0,.03)',
            }}
          >
            <div
              style={{
                width: 54,
                height: 54,
                borderRadius: 16,
                background: card.bg,
                color: card.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 18,
              }}
            >
              {card.icon}
            </div>

            <div
              style={{
                fontSize: 30,
                fontWeight: 800,
                color: '#0F172A',
              }}
            >
              {card.value}
            </div>

            <div
              style={{
                marginTop: 6,
                color: '#64748B',
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              {card.title}
            </div>
          </div>
        ))}
      </div>

      {/* SEARCH */}
      <div
        style={{
          display: 'flex',
          gap: 14,
          marginBottom: 24,
        }}
      >
        <div
          style={{
            flex: 1,
            height: 54,
            background: '#fff',
            border: '1px solid #E2E8F0',
            borderRadius: 16,
            display: 'flex',
            alignItems: 'center',
            padding: '0 18px',
          }}
        >
          <FiSearch color="#94A3B8" size={18} />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari pelanggan..."
            style={{
              border: 'none',
              outline: 'none',
              marginLeft: 12,
              width: '100%',
              fontSize: 14,
              background: 'transparent',
            }}
          />
        </div>

        <button
          style={{
            width: 54,
            borderRadius: 16,
            border: '1px solid #E2E8F0',
            background: '#fff',
            cursor: 'pointer',
          }}
        >
          <FiFilter size={18} />
        </button>
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
              {['Pelanggan', 'Kontak', 'Alamat', 'Order', 'Total Belanja', 'Member', 'Aksi'].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: '16px 18px',
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
            {filtered.map((customer) => (
              <tr
                key={customer.id}
                style={{
                  borderTop: '1px solid #F1F5F9',
                }}
              >
                {/* CUSTOMER */}
                <td
                  style={{
                    padding: '18px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                    }}
                  >
                    <img
                      src={customer.avatar}
                      alt={customer.name}
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: '50%',
                        objectFit: 'cover',
                      }}
                    />

                    <div>
                      <div
                        style={{
                          fontWeight: 700,
                          color: '#0F172A',
                        }}
                      >
                        {customer.name}
                      </div>

                      <div
                        style={{
                          color: '#64748B',
                          fontSize: 13,
                          marginTop: 4,
                        }}
                      >
                        ID: #{customer.id}
                      </div>
                    </div>
                  </div>
                </td>

                {/* CONTACT */}
                <td
                  style={{
                    padding: '18px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 7,
                        fontSize: 13,
                        color: '#475569',
                      }}
                    >
                      <FiMail size={13} />
                      {customer.email}
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 7,
                        fontSize: 13,
                        color: '#475569',
                      }}
                    >
                      <FiPhone size={13} />
                      {customer.phone}
                    </div>
                  </div>
                </td>

                {/* ADDRESS */}
                <td
                  style={{
                    padding: '18px',
                    fontSize: 13,
                    color: '#475569',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <FiMapPin size={14} />
                    {customer.address}
                  </div>
                </td>

                {/* ORDERS */}
                <td
                  style={{
                    padding: '18px',
                    fontWeight: 700,
                    color: '#0F172A',
                  }}
                >
                  {customer.orders}
                </td>

                {/* SPENT */}
                <td
                  style={{
                    padding: '18px',
                    fontWeight: 700,
                    color: '#16A34A',
                  }}
                >
                  {fmt(customer.spent)}
                </td>

                {/* MEMBER */}
                <td
                  style={{
                    padding: '18px',
                  }}
                >
                  <span
                    style={{
                      background: customer.member === 'VIP' ? '#FEF3C7' : customer.member === 'Regular' ? '#DBEAFE' : '#ECFDF5',

                      color: customer.member === 'VIP' ? '#B45309' : customer.member === 'Regular' ? '#1D4ED8' : '#15803D',

                      padding: '6px 12px',
                      borderRadius: 999,
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    {customer.member}
                  </span>
                </td>

                {/* ACTION */}
                <td
                  style={{
                    padding: '18px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      gap: 8,
                    }}
                  >
                    {/* VIEW */}
                    <button onClick={() => setViewCustomer(customer)} style={actionBtn('#EFF6FF', '#2563EB')}>
                      <FiEye size={15} />
                    </button>

                    {/* EDIT */}
                    <button onClick={() => openEdit(customer)} style={actionBtn('#F8FAFC', '#475569')}>
                      <FiEdit3 size={15} />
                    </button>

                    {/* DELETE */}
                    <button onClick={() => setDeleteCustomer(customer)} style={actionBtn('#FEF2F2', '#DC2626')}>
                      <FiTrash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ADD / EDIT MODAL */}
      {showModal && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <h2 style={titleStyle}>{editCustomer ? 'Edit Pelanggan' : 'Tambah Pelanggan'}</h2>

            {[
              ['Nama', 'name'],
              ['Email', 'email'],
              ['No. Telepon', 'phone'],
              ['Alamat', 'address'],
            ].map(([label, key]) => (
              <div
                key={key}
                style={{
                  marginBottom: 16,
                }}
              >
                <label style={labelStyle}>{label}</label>

                <input
                  value={form[key]}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
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

      {/* VIEW MODAL */}
      {viewCustomer && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <div
              style={{
                textAlign: 'center',
              }}
            >
              <img
                src={viewCustomer.avatar}
                alt={viewCustomer.name}
                style={{
                  width: 90,
                  height: 90,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  marginBottom: 16,
                }}
              />

              <h2 style={titleStyle}>{viewCustomer.name}</h2>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                  marginTop: 20,
                  textAlign: 'left',
                }}
              >
                {[
                  [<FiMail />, viewCustomer.email],
                  [<FiPhone />, viewCustomer.phone],
                  [<FiMapPin />, viewCustomer.address],
                  [<FiShoppingBag />, `${viewCustomer.orders} order`],
                ].map((item, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      color: '#475569',
                    }}
                  >
                    {item[0]}
                    {item[1]}
                  </div>
                ))}
              </div>

              <button
                onClick={() => setViewCustomer(null)}
                style={{
                  ...primaryBtn,
                  width: '100%',
                  marginTop: 24,
                }}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteCustomer && (
        <div style={overlayStyle}>
          <div
            style={{
              ...modalStyle,
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: 72,
                height: 72,
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

            <h2 style={titleStyle}>Hapus Pelanggan?</h2>

            <p
              style={{
                color: '#64748B',
                fontSize: 14,
                lineHeight: 1.6,
              }}
            >
              Data pelanggan <strong>{deleteCustomer.name}</strong> akan dihapus permanen.
            </p>

            <div style={actionStyle}>
              <button onClick={() => setDeleteCustomer(null)} style={secondaryBtn}>
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
  color: '#0F172A',
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
  background: 'linear-gradient(135deg,#2563EB,#3B82F6)',
  color: '#fff',
  cursor: 'pointer',
  fontWeight: 700,
};

const actionBtn = (bg, color) => ({
  width: 38,
  height: 38,
  borderRadius: 12,
  border: 'none',
  background: bg,
  color,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
});

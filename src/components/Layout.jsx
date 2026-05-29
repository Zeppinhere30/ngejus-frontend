// src/components/Layout.jsx
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useState } from 'react';
import { FiGrid, FiShoppingBag, FiClipboard, FiBox, FiTag, FiUsers, FiBarChart2, FiLogOut, FiMenu, FiChevronsLeft } from 'react-icons/fi';
import { PiOrangeFill } from 'react-icons/pi';

const navItems = [
  { to: '/', label: 'Dashboard', icon: <FiGrid size={20} />, roles: ['admin', 'cashier'] },
  { to: '/pos', label: 'Kasir (POS)', icon: <FiShoppingBag size={20} />, roles: ['admin', 'cashier'] },
  { to: '/orders', label: 'Pesanan', icon: <FiClipboard size={20} />, roles: ['admin', 'cashier'] },
  { to: '/inventory', label: 'Inventori', icon: <FiBox size={20} />, roles: ['admin', 'cashier'] },
  { to: '/products', label: 'Produk', icon: <FiTag size={20} />, roles: ['admin'] },
  { to: '/customers', label: 'Pelanggan', icon: <FiUsers size={20} />, roles: ['admin', 'cashier'] },
  { to: '/reports', label: 'Laporan', icon: <FiBarChart2 size={20} />, roles: ['admin'] },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapse, setCollapse] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#F4F7FE', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* ========================================
        SIDEBAR: DARK FROSTED GLASS EFFECT 
        ========================================
      */}
      <aside
        style={{
          width: collapse ? 90 : 280,
          margin: '16px 0 16px 16px' /* Efek Floating Sidebar */,
          borderRadius: 24,
          transition: 'all 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
          background: 'rgba(3, 27, 22, 0.95)' /* Hijau sangat gelap, nyaris hitam */,
          backdropFilter: 'blur(20px)',
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
          position: 'relative',
          overflow: 'hidden',
          zIndex: 50,
        }}
      >
        {/* Efek Cahaya Halus di atas Sidebar */}
        <div style={{ position: 'absolute', top: 0, left: '20%', width: '60%', height: 1, background: 'linear-gradient(90deg, transparent, rgba(52, 211, 153, 0.5), transparent)' }} />

        {/* HEADER LOGO */}
        <div style={{ height: 100, display: 'flex', alignItems: 'center', justifyContent: collapse ? 'center' : 'space-between', padding: collapse ? 0 : '0 24px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          {!collapse && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div
                className="logoWrap"
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 16,
                  background: 'linear-gradient(135deg,#34D399,#10B981)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.4), 0 8px 20px rgba(16,185,129,0.25)',
                }}
              >
                <div style={{ position: 'absolute', width: 20, height: 20, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', filter: 'blur(8px)' }} />
                <PiOrangeFill size={26} color="#fff" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }} />
              </div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 900, lineHeight: 1, letterSpacing: '-0.5px' }}>NgeJus</div>
                <div style={{ color: '#6EE7B7', fontSize: 11, marginTop: 4, fontWeight: 800, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Workspace</div>
              </div>
            </div>
          )}

          {/* Tombol Collapse */}
          <button
            onClick={() => setCollapse(!collapse)}
            className="menuBtn"
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.06)',
              background: 'rgba(255,255,255,0.03)',
              color: '#94A3B8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            {collapse ? <FiMenu size={18} /> : <FiChevronsLeft size={18} />}
          </button>
        </div>

        {/* NAVIGATION LIST */}
        <div className="no-scrollbar" style={{ flex: 1, padding: '24px 16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {navItems
            .filter((n) => n.roles.includes(user?.role || 'admin'))
            .map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  height: 54,
                  padding: collapse ? '0' : '0 16px',
                  justifyContent: collapse ? 'center' : 'flex-start',
                  borderRadius: 14,
                  textDecoration: 'none',
                  color: isActive ? '#fff' : '#94A3B8',
                  background: isActive ? 'linear-gradient(90deg, rgba(16,185,129,0.15) 0%, transparent 100%)' : 'transparent',
                  fontWeight: isActive ? 700 : 600,
                  position: 'relative',
                  transition: 'all 0.3s ease',
                  overflow: 'hidden',
                })}
                className="navItem"
              >
                {({ isActive }) => (
                  <>
                    {/* Efek Neon Border di Kiri saat Aktif */}
                    {isActive && <div style={{ position: 'absolute', left: 0, top: '15%', height: '70%', width: 4, background: '#10B981', borderRadius: '0 4px 4px 0', boxShadow: '0 0 10px rgba(16,185,129,0.6)' }} />}

                    <div style={{ color: isActive ? '#10B981' : 'inherit', transition: 'color 0.3s' }}>{item.icon}</div>

                    {!collapse && (
                      <span style={{ fontSize: 15, transition: 'transform 0.3s' }} className="navLabel">
                        {item.label}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
        </div>

        {/* USER PROFILE */}
        <div style={{ padding: 20, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              background: 'linear-gradient(135deg,#34D399,#10B981)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 900,
              fontSize: 16,
              boxShadow: '0 5px 15px rgba(16,185,129,0.2)',
              flexShrink: 0,
            }}
          >
            {user?.name?.[0]?.toUpperCase() || 'A'}
          </div>

          {!collapse && (
            <>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name || 'Admin NgeJus'}</div>
                <div style={{ color: '#64748B', fontSize: 11, marginTop: 4, fontWeight: 700, letterSpacing: '0.5px' }}>{user?.role?.toUpperCase() || 'ADMIN'}</div>
              </div>

              <button
                onClick={handleLogout}
                className="logoutBtn"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  border: '1px solid rgba(239,68,68,0.1)',
                  background: 'rgba(239,68,68,0.05)',
                  color: '#FCA5A5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <FiLogOut size={16} />
              </button>
            </>
          )}
        </div>

        {/* ========================================
            CSS ANIMASI HOVER
            ======================================== */}
        <style>
          {`
            .navItem:hover {
              color: #fff !important;
              background: rgba(255,255,255,0.03) !important;
            }
            .navItem:hover .navLabel {
              transform: translateX(4px);
            }
            .menuBtn:hover {
              background: rgba(255,255,255,0.08) !important;
              color: #fff !important;
            }
            .logoutBtn:hover {
              background: #DC2626 !important;
              color: #fff !important;
              border-color: #DC2626 !important;
              box-shadow: 0 4px 12px rgba(220,38,38,0.3);
            }
            .logoWrap:hover {
              transform: rotate(-5deg) scale(1.05);
            }
            /* Hilangkan scrollbar jelek */
            .no-scrollbar::-webkit-scrollbar {
              display: none;
            }
            .no-scrollbar {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
          `}
        </style>
      </aside>

      {/* KONTEN UTAMA */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        <div style={{ background: '#fff', minHeight: '100%', borderRadius: 24, boxShadow: '0 10px 40px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}

// src/pages/LoginPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

import { FiMail, FiLock, FiArrowRight, FiShield, FiDatabase, FiTrendingUp, FiLoader, FiAlertCircle } from 'react-icons/fi';
import { PiOrangeFill } from 'react-icons/pi';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch {
      setError('Email atau password salah');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        overflowX: 'hidden',
        overflowY: 'auto',
        background: '#020617',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        position: 'relative',
        margin: 0,
        padding: 0,
      }}
    >
      {/* ================================================= */}
      {/* BACKGROUND & EFFECTS (HARDWARE ACCELERATED) */}
      {/* ================================================= */}
      <div
        className="animatedGradient"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          background: 'linear-gradient(135deg, #021712, #053B2F, #064E3B, #022C22)',
          backgroundSize: '400% 400%',
          willChange: 'background-position',
        }}
      />

      {/* GLOW ORBS */}
      <div className="orb orb1" />
      <div className="orb orb2" />
      <div className="orb orb3" />

      {/* ================================================= */}
      {/* KONTEN UTAMA (PERFECT CENTERED FLEXBOX) */}
      {/* ================================================= */}
      <div
        style={{
          display: 'flex',
          width: '100%',
          minHeight: '100vh',
          position: 'relative',
          zIndex: 2,
          flexWrap: 'wrap',
          alignItems: 'center' /* Rahasia agar otomatis di tengah layar */,
          justifyContent: 'center',
        }}
      >
        {/* BAGIAN KIRI */}
        <div
          className="leftSection"
          style={{
            flex: '1 1 450px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '40px 8%',
            boxSizing: 'border-box',
            maxWidth: '800px',
          }}
        >
          {/* BADGE ANIMASI SMOOTH */}
          <div
            className="glassFloat"
            style={{
              width: 'fit-content',
              padding: '12px 20px',
              borderRadius: 999,
              background: 'rgba(255,255,255,.06)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,.08)',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginBottom: 32,
              boxShadow: '0 10px 30px rgba(0,0,0,.15)',
              willChange: 'transform' /* Mencegah getar */,
            }}
          >
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#34D399,#10B981)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(16,185,129,.3)' }}>
              <PiOrangeFill size={18} color="#fff" />
            </div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>NgeJus Premium</div>
          </div>

          {/* HERO TEXT DIMENSI PAS */}
          <h1
            className="titleHero"
            style={{
              margin: 0,
              fontSize: 'clamp(56px, 6vw, 76px)' /* Ukuran dinamis sesuai layar */,
              lineHeight: 1,
              fontWeight: 900,
              letterSpacing: '-3px',
              color: '#fff',
              textShadow: '0 12px 30px rgba(0,0,0,.25)',
            }}
          >
            Fresh.
            <br />
            Smart.
            <br />
            Modern.
          </h1>

          <p style={{ marginTop: 24, maxWidth: 580, color: 'rgba(255,255,255,.75)', fontSize: 18, lineHeight: 1.7, fontWeight: 400 }}>
            Sistem kasir dan inventori modern untuk bisnis juice dan salad dengan performa cepat dan tampilan premium.
          </p>

          {/* FITUR */}
          <div style={{ marginTop: 36, display: 'flex', flexDirection: 'column', gap: 20 }}>
            {[
              { icon: <FiShield />, text: 'Keamanan data enterprise' },
              { icon: <FiDatabase />, text: 'Sinkronisasi inventori real-time' },
              { icon: <FiTrendingUp />, text: 'Analitik penjualan otomatis' },
            ].map((item) => (
              <div key={item.text} className="featureItem" style={{ display: 'flex', alignItems: 'center', gap: 16, willChange: 'transform' }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    background: 'rgba(255,255,255,.06)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#6EE7B7',
                    fontSize: 20,
                    boxShadow: '0 10px 25px rgba(0,0,0,.12)',
                  }}
                >
                  {item.icon}
                </div>
                <div style={{ color: 'rgba(255,255,255,.92)', fontSize: 16, fontWeight: 600 }}>{item.text}</div>
              </div>
            ))}
          </div>
        </div>

        {/* BAGIAN KANAN (FORM) */}
        <div
          className="rightSection"
          style={{
            flex: '1 1 450px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px',
            boxSizing: 'border-box',
          }}
        >
          {/* KOTAK LOGIN */}
          <div
            className="glassCard"
            style={{
              width: '100%',
              maxWidth: 440 /* Dikecilkan sedikit agar tidak mentok */,
              borderRadius: 32,
              background: 'rgba(255,255,255,.07)',
              backdropFilter: 'blur(30px)',
              border: '1px solid rgba(255,255,255,.09)',
              padding: '40px 36px',
              boxSizing: 'border-box',
              boxShadow: '0 30px 70px rgba(0,0,0,.35), inset 0 1px 1px rgba(255,255,255,.1)',
            }}
          >
            {/* LOGO DI DALAM KOTAK */}
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: 20,
                background: 'linear-gradient(135deg,#34D399,#059669)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 28,
                boxShadow: '0 15px 35px rgba(16,185,129,.35)',
              }}
            >
              <PiOrangeFill size={36} color="#fff" />
            </div>

            <h2 style={{ margin: 0, fontSize: 40, lineHeight: 1.1, fontWeight: 900, letterSpacing: '-1.5px', color: '#fff' }}>
              Welcome
              <br />
              Back
            </h2>
            <p style={{ marginTop: 12, color: 'rgba(255,255,255,.65)', fontSize: 14, lineHeight: 1.6 }}>Login untuk masuk ke dashboard manajemen NgeJus modern system.</p>

            {error && (
              <div
                style={{
                  marginTop: 20,
                  background: 'rgba(239,68,68,.12)',
                  border: '1px solid rgba(239,68,68,.18)',
                  borderRadius: 14,
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  color: '#FCA5A5',
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                <FiAlertCircle style={{ flexShrink: 0 }} /> {error}
              </div>
            )}

            {/* FORM LOGIN */}
            <form onSubmit={handleLogin} style={{ marginTop: 28 }}>
              <div style={{ marginBottom: 20 }}>
                <div style={labelStyle}>Email Address</div>
                <div className="inputGlass" style={inputWrap}>
                  <FiMail size={18} color="#A7F3D0" style={{ flexShrink: 0 }} />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@ngejus.id" required style={inputStyle} />
                </div>
              </div>

              <div style={{ marginBottom: 28 }}>
                <div style={labelStyle}>Password</div>
                <div className="inputGlass" style={inputWrap}>
                  <FiLock size={18} color="#A7F3D0" style={{ flexShrink: 0 }} />
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required style={inputStyle} />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="loginBtn"
                style={{
                  width: '100%',
                  height: 56,
                  borderRadius: 16,
                  border: 'none',
                  background: 'linear-gradient(135deg,#10B981,#059669)',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: 16,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 12,
                  boxShadow: '0 12px 30px rgba(16,185,129,.3)',
                  willChange: 'transform',
                }}
              >
                {loading ? (
                  <>
                    <FiLoader className="spin" /> Loading...
                  </>
                ) : (
                  <>
                    <FiArrowRight /> Masuk ke Dashboard
                  </>
                )}
              </button>
            </form>

            <div style={{ marginTop: 24, textAlign: 'center', color: 'rgba(255,255,255,.45)', fontSize: 13 }}>
              Demo: <span style={{ color: 'rgba(255,255,255,.7)' }}>admin@ngejus.id</span> / <span style={{ color: 'rgba(255,255,255,.7)' }}>password</span>
            </div>
          </div>
        </div>
      </div>

      {/* ================================================= */}
      {/* CSS ANIMASI GPU ACCELERATED (ANTI-GETAR) */}
      {/* ================================================= */}
      <style>
        {`
          /* Animasi Background Smooth */
          .animatedGradient { animation: gradientMove 15s ease infinite; }
          @keyframes gradientMove {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }

          /* Cahaya / Orbs */
          .orb { position: absolute; border-radius: 50%; filter: blur(80px); z-index: 1; will-change: transform; }
          .orb1 { width: 500px; height: 500px; background: rgba(16,185,129,.15); top: -200px; left: -150px; animation: orbMove1 20s ease-in-out infinite alternate; }
          .orb2 { width: 400px; height: 400px; background: rgba(52,211,153,.12); bottom: -100px; right: -100px; animation: orbMove2 18s ease-in-out infinite alternate; }
          .orb3 { width: 250px; height: 250px; background: rgba(16,185,129,.08); top: 30%; left: 45%; animation: orbMove3 15s ease-in-out infinite alternate; }

          /* Menggunakan translate3d untuk memaksa GPU merender animasi (Anti-Getar) */
          @keyframes orbMove1 { 0% { transform: translate3d(0,0,0); } 100% { transform: translate3d(40px,30px,0); } }
          @keyframes orbMove2 { 0% { transform: translate3d(0,0,0); } 100% { transform: translate3d(-30px,-20px,0); } }
          @keyframes orbMove3 { 0% { transform: translate3d(0,0,0); } 100% { transform: translate3d(20px,-30px,0); } }

          /* Animasi Hover Card & Button */
          .glassCard { transition: transform .3s ease, box-shadow .3s ease; }
          .glassCard:hover { transform: translate3d(0, -3px, 0); box-shadow: 0 35px 75px rgba(0,0,0,.4), inset 0 1px 1px rgba(255,255,255,.1); }
          
          .inputGlass { transition: border-color .2s, box-shadow .2s; }
          .inputGlass:focus-within { border-color: rgba(52,211,153,.5) !important; box-shadow: 0 0 0 4px rgba(16,185,129,.15) !important; }
          
          .loginBtn { transition: transform .2s ease, box-shadow .2s ease; }
          .loginBtn:hover:not(:disabled) { transform: translate3d(0, -2px, 0); box-shadow: 0 16px 35px rgba(16,185,129,.4) !important; }
          
          .featureItem { transition: transform .3s ease; }
          .featureItem:hover { transform: translate3d(8px, 0, 0); }

          /* ANIMASI FLOAT BADGE (FIX ANTI-GETAR) */
          .glassFloat { animation: glassFloat 4s ease-in-out infinite; }
          @keyframes glassFloat {
            0%, 100% { transform: translate3d(0, 0, 0); }
            50% { transform: translate3d(0, -8px, 0); } /* translate3d adalah kunci anti-getar */
          }

          .spin { animation: spin 1s linear infinite; }
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

          /* Fix Autofill Browser Background Kuning/Putih */
          input:focus { outline: none; }
          input:-webkit-autofill, input:-webkit-autofill:hover, input:-webkit-autofill:focus {
            -webkit-text-fill-color: white !important;
            transition: background-color 9999s ease-in-out 0s;
          }

          /* Responsive Mobile & Tablet */
          @media (max-width: 900px) {
            .leftSection { display: none !important; }
            .rightSection { padding: 24px !important; }
            .glassCard { padding: 32px 24px !important; }
          }
        `}
      </style>
    </div>
  );
}

const labelStyle = {
  color: 'rgba(255,255,255,.85)',
  marginBottom: 8,
  fontWeight: 700,
  fontSize: 13,
  letterSpacing: '0.3px',
};

const inputWrap = {
  height: 52,
  borderRadius: 14,
  background: 'rgba(255,255,255,.05)',
  border: '1px solid rgba(255,255,255,.08)',
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '0 16px',
  backdropFilter: 'blur(15px)',
  boxSizing: 'border-box',
};

const inputStyle = {
  width: '100%',
  border: 'none',
  outline: 'none',
  background: 'transparent',
  color: '#fff',
  fontSize: 14,
  fontWeight: 500,
};

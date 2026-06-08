'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const GOOGLE_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbxqypnfiegVaYMK6sTYq8GBpnsoIQyDmLEh2H6k3KQXKsVG9zivQHGaNPiY1l3Cag5J4g/exec';

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function toggleForm() {
    setIsLogin(!isLogin);
    setForm({ name: '', email: '', password: '' });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    const actionType = isLogin ? 'login' : 'register';
    const payload = { action: actionType, name: form.name, email: form.email, password: form.password };

    try {
      const res = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Network error');
      const data = await res.json();

      if (data.status === 'success') {
        if (!isLogin) {
          alert('✨ ลงทะเบียนสำเร็จแล้ว! กรุณาเข้าสู่ระบบด้วยบัญชีของคุณ');
          setIsLogin(true);
        } else {
          localStorage.setItem('futurepath_user_name', data.name);
          localStorage.setItem('futurepath_user_email', form.email);
          router.push('/home');
        }
      } else {
        alert('🛑 ล้มเหลว: ' + data.message);
      }
    } catch {
      alert('❌ เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#120c0a', color: '#fff', fontFamily: "'Kanit', sans-serif" }}>
      {/* Image Background & Corner Gradients */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ 
          position: 'absolute', inset: 0, 
          backgroundImage: "url('/img/bg-room.jpg')", 
          backgroundSize: 'cover', 
          backgroundPosition: 'center',
          opacity: 0.8
        }} />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(18, 12, 10, 0.65)' }} />

        <div style={{ position: 'absolute', top: '-20%', left: '-15%', width: '60vw', height: '60vw', background: 'radial-gradient(circle, rgba(255,122,0,0.35) 0%, transparent 70%)', filter: 'blur(80px)', mixBlendMode: 'screen' }} />
        <div style={{ position: 'absolute', bottom: '-20%', right: '-15%', width: '70vw', height: '70vw', background: 'radial-gradient(circle, rgba(255,75,0,0.3) 0%, transparent 70%)', filter: 'blur(100px)', mixBlendMode: 'screen' }} />
      </div>

      <main
        className="flex justify-center items-center px-5 relative z-10"
        style={{ minHeight: '100vh' }}
      >
        <div
          className="fade-in-scale w-full"
          style={{
            width: '100%', maxWidth: '420px',
            padding: '40px 32px', borderRadius: '40px',
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.2), 0 24px 64px rgba(0, 0, 0, 0.4)',
          }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#ffb347', opacity: 0.85, marginBottom: '10px' }}>FUTUREPATH AI</p>
            <h1
              style={{
                fontSize: '1.8rem', fontWeight: 900,
                background: 'linear-gradient(135deg, #fff 0%, #ff7a00 55%, #fff 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {isLogin ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
            </h1>
            <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.6)', marginTop: '8px', fontWeight: 400 }}>
              {isLogin ? 'ยินดีต้อนรับกลับมา!' : 'สร้างบัญชีใหม่ฟรี'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {!isLogin && (
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: '8px', letterSpacing: '0.04em' }}>
                  <i className="fa-solid fa-user mr-2" style={{ color: '#ffb347' }} />
                  ชื่อ-นามสกุล
                </label>
                <input
                  className="fp-input"
                  name="name"
                  type="text"
                  placeholder="กรอกชื่อของคุณ"
                  value={form.name}
                  onChange={handleChange}
                  style={{ borderColor: 'rgba(255,255,255,0.15)' }}
                />
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: '8px', letterSpacing: '0.04em' }}>
                <i className="fa-solid fa-envelope mr-2" style={{ color: '#ffb347' }} />
                อีเมล
              </label>
              <input
                className="fp-input"
                name="email"
                type="email"
                placeholder="example@email.com"
                value={form.email}
                onChange={handleChange}
                required
                style={{ borderColor: 'rgba(255,255,255,0.15)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: '8px', letterSpacing: '0.04em' }}>
                <i className="fa-solid fa-lock mr-2" style={{ color: '#ffb347' }} />
                รหัสผ่าน
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  className="fp-input"
                  name="password"
                  type={showPwd ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  required
                  style={{ paddingRight: '48px', borderColor: 'rgba(255,255,255,0.15)' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  style={{
                    position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', padding: '4px',
                  }}
                >
                  <i className={`fa-solid ${showPwd ? 'fa-eye-slash' : 'fa-eye'}`} />
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="hover-glow-btn"
              style={{ 
                width: '100%', marginTop: '6px', fontSize: '1.05rem', padding: '15px', borderRadius: '30px',
                background: 'linear-gradient(135deg, #ff7a00, #ff4b00)', color: '#fff', border: 'none',
                fontWeight: 700, boxShadow: '0 8px 32px rgba(255,107,0,0.4)', display: 'inline-flex', justifyContent: 'center', alignItems: 'center', gap: '8px', cursor: 'pointer'
              }}
            >
              {loading ? (
                <><i className="fas fa-spinner fa-spin" /> กำลังตรวจสอบ...</>
              ) : isLogin ? (
                <><i className="fa-solid fa-right-to-bracket" /> เข้าสู่ระบบ</>
              ) : (
                <><i className="fa-solid fa-user-plus" /> สร้างบัญชีใหม่</>
              )}
            </button>
          </form>

          {/* Toggle */}
          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <span style={{ fontSize: '0.87rem', color: 'rgba(255,255,255,0.6)', fontWeight: 400 }}>
              {isLogin ? 'ยังไม่มีบัญชีใช่ไหม? ' : 'มีบัญชีอยู่แล้ว? '}
            </span>
            <button
              onClick={toggleForm}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#ffb347', fontWeight: 700, fontSize: '0.87rem',
                fontFamily: 'Kanit, sans-serif', textDecoration: 'underline', textUnderlineOffset: '3px',
              }}
            >
              {isLogin ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

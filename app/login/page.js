'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import GlassNav from '@/components/GlassNav';

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
    <div className="relative" style={{ minHeight: '100vh', paddingTop: '64px' }}>
      <div className="blob blob-1" /><div className="blob blob-2" />
      <GlassNav />

      <main
        className="flex justify-center items-center px-5 relative z-10"
        style={{ minHeight: 'calc(100vh - 64px)' }}
      >
        <div
          className="fade-in-scale w-full"
          style={{
            maxWidth: '440px',
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(28px)',
            border: '1px solid var(--glass-border)',
            borderRadius: 'var(--r-xl)',
            padding: '52px 44px',
            boxShadow: '0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
          }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <p className="section-eyebrow" style={{ marginBottom: '10px' }}>FUTUREPATH AI</p>
            <h1
              style={{
                fontSize: '2rem',
                fontWeight: 800,
                letterSpacing: '0.06em',
                background: 'linear-gradient(135deg, #fff 30%, var(--accent-color) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {isLogin ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
            </h1>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '8px', fontWeight: 400 }}>
              {isLogin ? 'ยินดีต้อนรับกลับมา!' : 'สร้างบัญชีใหม่ฟรี'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {!isLogin && (
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-sub)', marginBottom: '8px', letterSpacing: '0.04em' }}>
                  <i className="fa-solid fa-user mr-2" style={{ color: 'var(--accent-color)' }} />
                  ชื่อ-นามสกุล
                </label>
                <input
                  className="fp-input"
                  name="name"
                  type="text"
                  placeholder="กรอกชื่อของคุณ"
                  value={form.name}
                  onChange={handleChange}
                />
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-sub)', marginBottom: '8px', letterSpacing: '0.04em' }}>
                <i className="fa-solid fa-envelope mr-2" style={{ color: 'var(--accent-color)' }} />
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
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-sub)', marginBottom: '8px', letterSpacing: '0.04em' }}>
                <i className="fa-solid fa-lock mr-2" style={{ color: 'var(--accent-color)' }} />
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
                  style={{ paddingRight: '48px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  style={{
                    position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text-muted)', fontSize: '0.9rem', padding: '4px',
                  }}
                >
                  <i className={`fa-solid ${showPwd ? 'fa-eye-slash' : 'fa-eye'}`} />
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', marginTop: '6px', fontSize: '1.05rem', padding: '15px' }}
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
            <span style={{ fontSize: '0.87rem', color: 'var(--text-muted)', fontWeight: 400 }}>
              {isLogin ? 'ยังไม่มีบัญชีใช่ไหม? ' : 'มีบัญชีอยู่แล้ว? '}
            </span>
            <button
              onClick={toggleForm}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--accent-color)', fontWeight: 700, fontSize: '0.87rem',
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

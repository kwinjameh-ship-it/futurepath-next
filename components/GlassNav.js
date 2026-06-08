'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const navLinks = [
  { href: '/home',       label: 'หน้าหลัก',                       icon: 'fa-house' },
  { href: '/assessment', label: 'วิเคราะห์ศักยภาพ',                icon: 'fa-brain' },
  { href: '/chat',       label: 'AI ChatBot',                      icon: 'fa-comments' },
  { href: '/interview',  label: 'จำลองสัมภาษณ์เสียง',              icon: 'fa-microphone' },
  { href: '/simulation', label: 'ทดลองงานในฝัน',                   icon: 'fa-briefcase' },
  { href: '/feedback',   label: 'ประเมินความพึงพอใจ',               icon: 'fa-star' },
];

export default function GlassNav() {
  const [open, setOpen] = useState(false);

  // ล็อก scroll ตอนเมนูเปิด
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // ปิดเมื่อกด Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <>
      {/* ── Fixed Top Navbar ── */}
      <header
        className="fixed top-0 left-0 right-0 z-[950] flex items-center justify-between"
        style={{
          height: '64px',
          padding: '0 24px',
          background: 'rgba(10, 8, 30, 0.85)',
          backdropFilter: 'blur(24px) saturate(160%)',
          WebkitBackdropFilter: 'blur(24px) saturate(160%)',
          borderBottom: '1px solid var(--glass-border)',
          boxShadow: '0 2px 24px rgba(0,0,0,0.45)',
        }}
      >
        {/* Logo */}
        <Link href="/home" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <img
            src="/img/logo1.png"
            alt="FuturePath AI"
            style={{ width: '36px', height: '36px', objectFit: 'contain', borderRadius: '8px' }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <span style={{
            fontFamily: "'Kanit', sans-serif",
            fontWeight: 900, fontSize: '1.1rem', letterSpacing: '0.15em',
            color: 'var(--accent-color)', textShadow: '0 0 14px rgba(0,242,254,0.45)',
          }}>
            FUTUREPATH AI
          </span>
        </Link>

        {/* Hamburger */}
        <button
          onClick={() => setOpen(!open)}
          aria-label="Toggle Menu"
          style={{
            width: '44px', height: '44px', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            border: `1px solid ${open ? 'var(--accent-color)' : 'var(--glass-border)'}`,
            background: open ? 'rgba(0,242,254,0.10)' : 'var(--glass-bg)',
            transition: 'all 0.3s ease', flexShrink: 0,
            zIndex: 960,
            position: 'relative',
          }}
        >
          <i
            className={open ? 'fa-solid fa-xmark' : 'fa-solid fa-bars'}
            style={{
              fontSize: '1.25rem',
              color: open ? 'var(--accent-color)' : '#ffffff',
              transition: 'color 0.2s ease',
            }}
          />
        </button>
      </header>

      {/* ── Blurred backdrop (คลิกปิดเมนูได้) ── */}
      <div
        className={`glass-menu-backdrop ${open ? 'active' : ''}`}
        onClick={() => setOpen(false)}
      />

      {/* ── Centered Menu ── */}
      <nav className={`glass-menu ${open ? 'active' : ''}`}>
        <div className="glass-menu-inner">

          {/* Brand */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <img
              src="/img/logo1.png"
              alt="Logo"
              style={{ width: '52px', height: '52px', objectFit: 'contain', borderRadius: '12px', margin: '0 auto 10px' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <div style={{
              fontFamily: "'Kanit', sans-serif", fontWeight: 900,
              fontSize: '0.95rem', letterSpacing: '0.18em', color: 'var(--accent-color)',
              textShadow: '0 0 20px rgba(0,242,254,0.45)',
            }}>
              FUTUREPATH AI
            </div>
            <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(0,242,254,0.3), transparent)', marginTop: '18px' }} />
          </div>

          {/* Nav Links */}
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column' }}>
            {navLinks.map((link, i) => (
              <li
                key={link.href}
                className="nav-item"
                style={{ transitionDelay: open ? `${(i + 1) * 0.06}s` : '0s' }}
              >
                <Link
                  href={link.href}
                  className="nav-link"
                  onClick={() => setOpen(false)}
                >
                  <i className={`fa-solid ${link.icon}`} style={{ color: 'var(--accent-color)', fontSize: '0.95rem', width: '20px', textAlign: 'center', flexShrink: 0 }} />
                  <span>{link.label}</span>
                </Link>
              </li>
            ))}
          </ul>

          {/* Footer */}
          <div style={{ marginTop: '20px', paddingTop: '16px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
              © 2025 FuturePath AI
            </span>
          </div>
        </div>
      </nav>
    </>
  );
}

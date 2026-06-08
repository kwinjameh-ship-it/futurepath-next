'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';

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
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
      {/* ── Fixed Top Navbar ───────────────────────────── */}
      <header
        className="fixed top-0 left-0 right-0 z-[950] flex items-center justify-between"
        style={{
          height: '64px',
          padding: '0 24px',
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(30px) saturate(180%)',
          WebkitBackdropFilter: 'blur(30px) saturate(180%)',
          borderBottom: '1px solid var(--glass-border)',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
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
            color: 'var(--accent-color)', textShadow: '0 0 14px var(--accent-glow)',
          }}>
            FUTUREPATH AI
          </span>
        </Link>

        {/* Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {mounted && (
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              aria-label="Toggle Theme"
              style={{
                width: '40px', height: '40px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                border: '1px solid var(--glass-border)',
                background: 'var(--glass-bg)',
                color: 'var(--text-main)',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent-color)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--glass-border)'; }}
            >
              <i className={theme === 'light' ? 'fa-solid fa-moon' : 'fa-solid fa-sun'} style={{ fontSize: '1.1rem', color: theme === 'light' ? '#6b7280' : '#fbbf24' }} />
            </button>
          )}

          {/* Hamburger */}
          <button
            onClick={() => setOpen(!open)}
            aria-label="Toggle Menu"
            style={{
              width: '44px', height: '44px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              border: `1px solid ${open ? 'var(--accent-color)' : 'var(--glass-border)'}`,
              background: open ? 'var(--accent-dim)' : 'var(--glass-bg)',
              transition: 'all 0.3s ease', flexShrink: 0,
              zIndex: 960,
              position: 'relative',
            }}
          >
            <i
              className={open ? 'fa-solid fa-xmark' : 'fa-solid fa-bars'}
              style={{
                fontSize: '1.25rem',
                color: open ? 'var(--accent-color)' : 'var(--text-main)',
                transition: 'color 0.2s ease',
              }}
            />
          </button>
        </div>
      </header>

      {/* ── Full-Screen Overlay Menu ── */}
      <nav className={`glass-menu ${open ? 'active' : ''}`}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          
          {/* Brand */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <img
              src="/img/logo1.png"
              alt="Logo"
              style={{ width: '72px', height: '72px', objectFit: 'contain', borderRadius: '16px', margin: '0 auto 14px' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <div style={{
              fontFamily: "'Kanit', sans-serif",
              fontWeight: 900,
              fontSize: '1.8rem',
              letterSpacing: '0.2em',
              color: 'var(--accent-color)',
            }}>
              FUTUREPATH AI
            </div>
          </div>

          {/* Nav Links */}
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {navLinks.map((link, i) => (
              <li
                key={link.href}
                className="nav-item"
                style={{ transitionDelay: open ? `${(i + 1) * 0.07}s` : '0s' }}
              >
                <Link
                  href={link.href}
                  className="nav-link"
                  onClick={() => setOpen(false)}
                >
                  <i className={`fa-solid ${link.icon}`} />
                  <span>{link.label}</span>
                </Link>
              </li>
            ))}
          </ul>

        </div>
      </nav>
    </>
  );
}

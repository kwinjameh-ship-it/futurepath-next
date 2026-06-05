'use client';
import { useState } from 'react';
import Link from 'next/link';

const navLinks = [
  { href: '/home',       label: 'หน้าหลัก',                         icon: 'fa-house' },
  { href: '/assessment', label: 'วิเคราะห์ศักยภาพ',                  icon: 'fa-brain' },
  { href: '/chat',       label: 'AI ChatBot',                        icon: 'fa-comments' },
  { href: '/interview',  label: 'จำลองการสัมภาษณ์ด้วยเสียง',         icon: 'fa-microphone' },
  { href: '/simulation', label: 'ทดลองทำงานในสายงานที่คุณใฝ่ฝัน',   icon: 'fa-briefcase' },
  { href: '/feedback',   label: 'ประเมินความพึงพอใจ',                 icon: 'fa-star' },
];

export default function GlassNav() {
  const [open, setOpen] = useState(false);

  const barStyle = () => ({});

  return (
    <>
      {/* ── Fixed Top Navbar ───────────────────────────── */}
      <header
        className="fixed top-0 left-0 right-0 z-[950] flex items-center justify-between"
        style={{
          height: '64px',
          padding: '0 24px',
          background: 'rgba(10, 8, 30, 0.82)',
          backdropFilter: 'blur(24px) saturate(160%)',
          WebkitBackdropFilter: 'blur(24px) saturate(160%)',
          borderBottom: '1px solid var(--glass-border)',
          boxShadow: '0 2px 24px rgba(0,0,0,0.45)',
        }}
      >
        {/* Logo + Brand */}
        <Link href="/home" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <img
            src="/img/logo1.png"
            alt="FuturePath AI"
            style={{ width: '36px', height: '36px', objectFit: 'contain', borderRadius: '8px' }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <span style={{
            fontFamily: "'Kanit', sans-serif",
            fontWeight: 900,
            fontSize: '1.1rem',
            letterSpacing: '0.15em',
            color: 'var(--accent-color)',
            textShadow: '0 0 14px rgba(0,242,254,0.45)',
          }}>
            FUTUREPATH AI
          </span>
        </Link>

        {/* Hamburger Button */}
        <button
          onClick={() => setOpen(!open)}
          aria-label="Toggle Menu"
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            border: `1px solid ${open ? 'var(--accent-color)' : 'var(--glass-border)'}`,
            background: open ? 'rgba(0,242,254,0.10)' : 'var(--glass-bg)',
            transition: 'all 0.3s ease',
            flexShrink: 0,
          }}
        >
          <i
            className={open ? 'fa-solid fa-xmark' : 'fa-solid fa-bars'}
            style={{
              fontSize: '1.25rem',
              color: open ? 'var(--accent-color)' : '#ffffff',
              transition: 'color 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          />
        </button>
      </header>

      {/* ── Full-Screen Overlay Menu ───────────────────── */}
      <nav className={`glass-menu ${open ? 'active' : ''}`}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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
          
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {navLinks.map((link, i) => (
              <li
                key={link.href}
                className="nav-item"
                style={{ transitionDelay: `${(i + 1) * 0.07}s`, margin: '12px 0' }}
              >
                <Link 
                  href={link.href} 
                  className="nav-link" 
                  onClick={() => setOpen(false)}
                  style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '16px', padding: '8px 0' }}
                >
                  <i
                    className={`fa-solid ${link.icon}`}
                    style={{ color: 'var(--accent-color)', fontSize: '1.1rem' }}
                  />
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

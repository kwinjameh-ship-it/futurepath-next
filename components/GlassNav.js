'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { usePathname } from 'next/navigation';

const navLinks = [
  { href: '/home',       label: 'หน้าหลัก',                       icon: 'fa-house' },
  { href: '/assessment', label: 'วิเคราะห์ศักยภาพ',                icon: 'fa-brain' },
  { href: '/chat',       label: 'AI ChatBot',                      icon: 'fa-comments' },
  { href: '/interview',  label: 'จำลองสัมภาษณ์เสียง',              icon: 'fa-microphone' },
  { href: '/simulation', label: 'ทดลองงานในฝัน',                   icon: 'fa-briefcase' },
];

export default function GlassNav() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav 
      className="fixed z-[950] flex items-center justify-between md:justify-center p-3 md:py-6 md:px-3
                 left-4 right-4 bottom-4 md:right-auto md:left-6 md:top-1/2 md:-translate-y-1/2 md:flex-col md:gap-6"
      style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(40px) saturate(180%)',
        WebkitBackdropFilter: 'blur(40px) saturate(180%)',
        border: '1px solid var(--glass-border)',
        borderRadius: '40px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.2)'
      }}
    >
      {/* Logo (Hidden on very small mobile, visible on desktop) */}
      <Link href="/home" className="hidden md:flex items-center justify-center w-10 h-10 rounded-full overflow-hidden shrink-0" title="FuturePath AI">
        <img
          src="/img/logo1.png"
          alt="FuturePath AI"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      </Link>

      <div className="hidden md:block w-8 h-[1px] bg-[var(--glass-border)] opacity-50 shrink-0" />

      {/* Nav Links */}
      <div className="flex md:flex-col items-center justify-around w-full md:w-auto gap-2 md:gap-6">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              title={link.label}
              className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full transition-all duration-300 relative group"
              style={{
                color: isActive ? '#fff' : 'var(--text-sub)',
                background: isActive ? 'linear-gradient(135deg, #ff7a00, #ff4b00)' : 'transparent',
                boxShadow: isActive ? '0 4px 12px rgba(255,107,0,0.4)' : 'none',
                textDecoration: 'none'
              }}
            >
              <i className={`fa-solid ${link.icon} text-lg md:text-xl transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110 group-hover:text-[var(--accent-color)]'}`} />
              
              {/* Tooltip on Desktop */}
              <span className="absolute left-[calc(100%+16px)] px-3 py-1 bg-[var(--glass-bg)] border border-[var(--glass-border)] backdrop-blur-md rounded-lg text-sm text-[var(--text-main)] opacity-0 -translate-x-4 pointer-events-none transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 hidden md:block whitespace-nowrap shadow-lg">
                {link.label}
              </span>
            </Link>
          );
        })}
      </div>

      <div className="hidden md:block w-8 h-[1px] bg-[var(--glass-border)] opacity-50 shrink-0" />
      
      {/* Settings / Theme Toggle */}
      {mounted && (
        <button
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          title="สลับโหมดสว่าง/มืด"
          className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full transition-all duration-300 group shrink-0"
          style={{
            color: 'var(--text-sub)',
            background: 'transparent',
          }}
        >
          <i className={`${theme === 'light' ? 'fa-solid fa-moon' : 'fa-solid fa-sun'} text-lg md:text-xl transition-transform duration-300 group-hover:scale-110 group-hover:text-[var(--accent-color)]`} />
          <span className="absolute left-[calc(100%+16px)] px-3 py-1 bg-[var(--glass-bg)] border border-[var(--glass-border)] backdrop-blur-md rounded-lg text-sm text-[var(--text-main)] opacity-0 -translate-x-4 pointer-events-none transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 hidden md:block whitespace-nowrap shadow-lg">
            สลับโหมดสี
          </span>
        </button>
      )}
    </nav>
  );
}

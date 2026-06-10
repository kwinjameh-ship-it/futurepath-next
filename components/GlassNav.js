'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const navLinks = [
  { href: '/home',       label: 'หน้าหลัก',                       icon: 'fa-house' },
  { href: '/assessment', label: 'วิเคราะห์ศักยภาพ',                icon: 'fa-brain' },
  { href: '/chat',       label: 'AI ChatBot',                      icon: 'fa-comments' },
  { href: '/interview',  label: 'จำลองสัมภาษณ์เสียง',              icon: 'fa-microphone' },
  { href: '/simulation', label: 'ทดลองงานในฝัน',                   icon: 'fa-briefcase' },
];

export default function GlassNav({ inline = false }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('futurepath_user_name');
    localStorage.removeItem('futurepath_user_email');
    router.push('/login');
  };

  const navClasses = inline
    ? "flex flex-col items-center justify-center gap-6 py-6 px-3 shrink-0"
    : "fixed z-[950] flex items-center justify-between md:justify-center gap-2 md:gap-6 p-3 md:py-6 md:px-3 left-4 right-4 bottom-4 md:right-auto md:left-6 md:top-1/2 md:-translate-y-1/2 md:flex-col";

  return (
    <nav 
      className={navClasses}
      style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(40px) saturate(180%)',
        WebkitBackdropFilter: 'blur(40px) saturate(180%)',
        border: '1px solid var(--glass-border)',
        borderRadius: '40px',
        boxShadow: inline ? 'none' : '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.2)'
      }}
    >
      {/* Logo (Hidden on very small mobile, visible on desktop) */}
      <Link href="/home" className="mx-auto hidden md:flex items-center justify-center w-10 h-10 rounded-full overflow-hidden shrink-0" title="FuturePath AI">
        <img
          src="/img/logo1.png"
          alt="FuturePath AI"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      </Link>

      <div className="mx-auto hidden md:block w-8 h-[1px] bg-[var(--glass-border)] opacity-50 shrink-0" />

      {/* Nav Links */}
      <div className="mx-auto flex md:flex-col items-center justify-around flex-1 md:flex-none md:w-auto gap-2 md:gap-6">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              title={link.label}
              className="mx-auto flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full transition-all duration-300 relative group"
              style={{
                color: isActive ? '#fff' : 'var(--text-sub)',
                background: isActive ? 'linear-gradient(135deg, #ff7a00, #ff4b00)' : 'transparent',
                boxShadow: isActive ? '0 4px 12px rgba(255,107,0,0.4)' : 'none',
                textDecoration: 'none'
              }}
            >
              <i className={`fa-solid ${link.icon} text-lg md:text-xl transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110 group-hover:text-[#ff9d4d]'}`} />
              
              {/* Tooltip on Desktop */}
              <span className="absolute left-[calc(100%+16px)] px-3 py-1 bg-[var(--glass-bg)] border border-[var(--glass-border)] backdrop-blur-md rounded-lg text-sm text-[var(--text-main)] opacity-0 -translate-x-4 pointer-events-none transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 hidden md:block whitespace-nowrap shadow-lg z-[999]">
                {link.label}
              </span>
            </Link>
          );
        })}
      </div>

      <div className="mx-auto hidden md:block w-8 h-[1px] bg-[var(--glass-border)] opacity-50 shrink-0" />
      
      {/* Logout Button */}
      <button
        onClick={handleLogout}
        title="ออกจากระบบ"
        className="mx-auto flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full transition-all duration-300 group shrink-0"
        style={{
          color: 'var(--text-sub)',
          background: 'transparent',
        }}
      >
        <i className={`fa-solid fa-arrow-right-from-bracket text-lg md:text-xl transition-transform duration-300 group-hover:scale-110 group-hover:text-[#ff4b00]`} />
        <span className="absolute left-[calc(100%+16px)] px-3 py-1 bg-[var(--glass-bg)] border border-[var(--glass-border)] backdrop-blur-md rounded-lg text-sm text-[#ff4b00] opacity-0 -translate-x-4 pointer-events-none transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 hidden md:block whitespace-nowrap shadow-lg z-[999]">
          ออกจากระบบ
        </span>
      </button>
    </nav>
  );
}

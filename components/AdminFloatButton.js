'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminFloatButton() {
  const pathname = usePathname();
  
  // Hide on admin pages or login pages
  if (pathname && (pathname.startsWith('/admin') || pathname === '/login')) {
    return null;
  }

  return (
    <Link
      href="/admin"
      title="เข้าสู่ระบบผู้ดูแลระบบ"
      className="fixed top-6 right-6 z-[9999] flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 hover:scale-110 shadow-lg group"
      style={{
        background: 'rgba(18, 12, 10, 0.8)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,179,71,0.3)',
        color: 'var(--text-sub)'
      }}
    >
      <i className="fa-solid fa-user-shield text-xl group-hover:text-[#ff9d4d] transition-colors" />
    </Link>
  );
}

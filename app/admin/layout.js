'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Swal from 'sweetalert2';

const showModal = (icon, title, text) => {
  Swal.fire({
    icon,
    title,
    text,
    background: '#12102e',
    color: '#f0f4ff',
    confirmButtonColor: '#ff7a00',
    customClass: {
      popup: 'rounded-2xl border border-white/10 shadow-[0_0_40px_rgba(255,122,0,0.15)]',
      title: 'font-kanit',
      htmlContainer: 'font-kanit text-white/70',
      confirmButton: 'font-kanit rounded-xl px-6 py-2'
    }
  });
};

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxoZo8hs8SKeVF7mnEQYWoxbZSJRL9Fe9h_Tcz0Bwsd6h_UA1JPjaKPqKdyL5mBEHHWHg/exec";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const email = localStorage.getItem('futurepath_user_email');
    if (!email) {
      showModal('error', 'แจ้งเตือน', 'คุณต้องเข้าสู่ระบบก่อน');
      router.push('/login');
      return;
    }

    const checkAdminWithRetry = async (retries = 3) => {
      try {
        const res = await fetch(GOOGLE_SCRIPT_URL, {
          method: 'POST',
          mode: 'cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action: 'admin_check', email })
        });
        const data = await res.json();

        // If GAS returns a lock timeout error, retry up to 3 times
        if (data.status === 'error' && data.message && data.message.includes('การล็อก') && retries > 0) {
          setTimeout(() => checkAdminWithRetry(retries - 1), 2000);
          return;
        }

        if (data.status === 'success' && data.isAdmin) {
          setIsAdmin(true);
          setLoading(false);
        } else if (data.status === 'error') {
          showModal('error', 'แจ้งเตือน', 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์: ' + data.message + '\nกรุณาลองเข้าใหม่อีกครั้ง');
          router.push('/home');
        } else {
          showModal('error', 'แจ้งเตือน', 'คุณไม่มีสิทธิ์เข้าถึงหน้า Admin สำหรับอีเมล: ' + email);
          router.push('/home');
        }
      } catch (error) {
        showModal('error', 'แจ้งเตือน', 'เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์: ' + error.message);
        router.push('/home');
      }
    };

    checkAdminWithRetry();
  }, [router]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <i className="fas fa-spinner fa-spin mr-3" style={{ color: 'var(--accent-color)', fontSize: '2rem' }} /> กำลังตรวจสอบสิทธิ์...
      </div>
    );
  }

  if (!isAdmin) return null;

  const navs = [
    { name: 'แดชบอร์ด',           path: '/admin',         icon: 'fa-chart-pie' },
    { name: 'ผลการประเมิน',        path: '/admin/results', icon: 'fa-table-list' },
    { name: 'School Command Center', path: '/admin/school', icon: 'fa-building' },
    { name: 'ผลความพึงพอใจ',       path: '/admin/satisfaction', icon: 'fa-star' },
    { name: 'จัดการแอดมิน',        path: '/admin/settings', icon: 'fa-users-gear' },
    { name: 'กลับสู่หน้าหลัก',     path: '/home',          icon: 'fa-house' }
  ];

  return (
    <div className="print-wrapper" style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', color: '#334155', fontFamily: "'Kanit', sans-serif" }}>
      {/* Sidebar */}
      <aside className="no-print" style={{
        width: '260px',
        background: '#ffffff',
        borderRight: '1px solid #e2e8f0',
        padding: '24px 0',
        boxShadow: '4px 0 24px rgba(0,0,0,0.02)'
      }}>
        <div style={{ padding: '0 24px', marginBottom: '40px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0284c7', letterSpacing: '0.05em' }}>
            <i className="fa-solid fa-shield-halved mr-2" />
            ADMIN PANEL
          </h2>
        </div>
        
        <ul style={{ listStyle: 'none', padding: '0 12px' }}>
          {navs.map(nav => {
            const isActive = pathname === nav.path;
            return (
              <li key={nav.path} style={{ marginBottom: '8px' }}>
                <Link
                  href={nav.path}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '14px 20px',
                    borderRadius: '8px',
                    background: isActive ? '#e0f2fe' : 'transparent',
                    color: isActive ? '#0369a1' : '#64748b',
                    textDecoration: 'none',
                    fontWeight: isActive ? 700 : 500,
                    transition: 'all 0.2s ease'
                  }}
                >
                  <i className={`fa-solid ${nav.icon}`} style={{ width: '20px', textAlign: 'center' }} />
                  {nav.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </aside>

      {/* Main Content */}
      <main className="print-content" style={{ flex: 1, padding: '32px 48px', overflowY: 'auto', height: '100vh' }}>
        {children}
      </main>
    </div>
  );
}

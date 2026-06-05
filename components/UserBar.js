'use client';
import { useRouter } from 'next/navigation';

export default function UserBar({ name, email }) {
  const router = useRouter();

  const avatarUrl = name
    ? `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=00f2fe&color=0c0a22&size=100&bold=true`
    : '';

  function triggerLogout() {
    if (confirm('คุณต้องการออกจากระบบ FUTUREPATH AI ใช่หรือไม่?')) {
      localStorage.removeItem('futurepath_user_name');
      localStorage.removeItem('futurepath_user_email');
      router.push('/');
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 20px',
        marginBottom: '24px',
        borderRadius: 'var(--r-pill)',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid var(--glass-border)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {avatarUrl && (
          <img
            src={avatarUrl}
            alt="Avatar"
            style={{
              width: '38px', height: '38px', borderRadius: '50%',
              border: '2px solid var(--accent-color)',
              boxShadow: '0 0 10px var(--accent-glow)',
              flexShrink: 0,
            }}
          />
        )}
        <div>
          <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', letterSpacing: '0.06em', fontWeight: 500 }}>
            ระบบลงชื่อเข้าใช้งาน
          </span>
          <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--accent-color)' }}>
            {name || 'กำลังตรวจสอบสิทธิ์...'}
          </span>
        </div>
      </div>

      <button
        onClick={triggerLogout}
        style={{
          padding: '7px 20px',
          borderRadius: 'var(--r-pill)',
          background: 'transparent',
          border: '1px solid var(--secondary-color)',
          color: 'var(--secondary-color)',
          cursor: 'pointer',
          fontFamily: 'Kanit, sans-serif',
          fontWeight: 600,
          fontSize: '0.85rem',
          letterSpacing: '0.03em',
          transition: 'all 0.25s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          flexShrink: 0,
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'var(--secondary-dim)';
          e.currentTarget.style.boxShadow  = '0 0 12px var(--secondary-glow)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.boxShadow  = 'none';
        }}
      >
        <i className="fa-solid fa-right-from-bracket" />
        ออกจากระบบ
      </button>
    </div>
  );
}

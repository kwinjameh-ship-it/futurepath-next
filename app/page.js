'use client';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#120c0a', color: '#fff', fontFamily: "'Kanit', sans-serif" }}>

      {/* Image Background & Corner Gradients (Same as Home) */}
      <div style={{ position: 'fixed', inset: 0, zIndex: -1, pointerEvents: 'none', overflow: 'hidden' }}>
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

      {/* Hero */}
      <main className="relative z-10 flex justify-center items-center w-full min-h-screen p-4 md:p-8">
        <div
          className="fade-in-scale w-full text-center"
          style={{
            maxWidth: '620px',
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '40px',
            padding: '64px 52px',
            boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.2), 0 24px 64px rgba(0, 0, 0, 0.4)',
          }}
        >
          {/* Eyebrow */}
          <p style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#ffb347', opacity: 0.85, marginBottom: '16px' }}>
            ระบบวิเคราะห์ศักยภาพ · แนะแนวอาชีพ · AI
          </p>

          {/* Logo-style heading */}
          <h1
            style={{
              fontSize: 'clamp(2.6rem, 7vw, 4rem)',
              fontWeight: 900,
              letterSpacing: '0.12em',
              background: 'linear-gradient(135deg, #fff 0%, #ff7a00 55%, #fff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              marginBottom: '16px',
              lineHeight: 1.1,
            }}
          >
            FUTUREPATH AI
          </h1>

          {/* Tagline */}
          <p
            style={{
              fontSize: '1.1rem',
              fontWeight: 400,
              color: 'rgba(255,255,255,0.7)',
              marginBottom: '40px',
              lineHeight: 1.75,
            }}
          >
            ค้นพบเส้นทางอาชีพที่ใช่ด้วยพลัง AI <br />
            วิเคราะห์ทักษะ · แนะนำสายงาน · เตรียมพร้อมสู่อนาคต
          </p>

          {/* CTA */}
          <Link
            href="/login"
            className="hover-glow-btn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px 44px',
              borderRadius: '30px',
              background: 'linear-gradient(135deg, #ff7a00, #ff4b00)',
              color: '#fff',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '1.1rem',
              boxShadow: '0 8px 32px rgba(255,107,0,0.4)',
            }}
          >
            <i className="fa-solid fa-rocket" />
            เริ่มต้นใช้งานฟรี
          </Link>

          {/* Trust */}
          <p style={{ marginTop: '28px', fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.05em' }}>
            ✦ ขับเคลื่อนด้วย Google Gemini AI &nbsp;·&nbsp; ไม่มีค่าใช้จ่าย
          </p>
        </div>
      </main>

    </div>
  );
}

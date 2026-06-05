'use client';
import Link from 'next/link';
import GlassNav from '@/components/GlassNav';

export default function LandingPage() {
  return (
    <div className="relative overflow-hidden" style={{ minHeight: '100vh', paddingTop: '64px' }}>
      <div className="blob blob-1" />
      <div className="blob blob-2" />

      {/* Video Background */}
      <div className="fixed inset-0" style={{ zIndex: -2, background: 'var(--body-bg)' }}>
        <video
          autoPlay muted loop playsInline
          className="absolute top-1/2 left-1/2 min-w-full min-h-full"
          style={{ transform: 'translate(-50%,-50%)', objectFit: 'cover', opacity: 0.18, mixBlendMode: 'screen' }}
        >
          <source src="/vdo/vdobg2.mp4" type="video/mp4" />
        </video>
        <div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse at center, rgba(12,10,34,0.05) 0%, rgba(12,10,34,0.92) 100%)', zIndex: -1 }}
        />
      </div>

      <GlassNav />

      {/* Hero */}
      <div
        className="flex justify-center items-center px-5 text-center relative z-10"
        style={{ minHeight: 'calc(100vh - 64px)' }}
      >
        <div
          className="fade-in-scale w-full"
          style={{
            maxWidth: '620px',
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(28px)',
            border: '1px solid var(--glass-border)',
            borderRadius: 'var(--r-xl)',
            padding: '64px 52px',
            boxShadow: '0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
          }}
        >
          {/* Eyebrow */}
          <p className="section-eyebrow mb-4">ระบบวิเคราะห์ศักยภาพ · แนะแนวอาชีพ · AI</p>

          {/* Logo-style heading */}
          <h1
            style={{
              fontSize: 'clamp(2.6rem, 7vw, 4rem)',
              fontWeight: 900,
              letterSpacing: '0.12em',
              background: 'linear-gradient(135deg, #fff 0%, var(--accent-color) 55%, #fff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              marginBottom: '12px',
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
              color: 'var(--text-sub)',
              marginBottom: '36px',
              lineHeight: 1.75,
            }}
          >
            ค้นพบเส้นทางอาชีพที่ใช่ด้วยพลัง AI<br />
            วิเคราะห์ทักษะ · แนะนำสายงาน · เตรียมพร้อมสู่อนาคต
          </p>

          {/* CTA */}
          <Link
            href="/login"
            className="btn-primary"
            style={{
              fontSize: '1.05rem',
              padding: '15px 44px',
              textDecoration: 'none',
            }}
          >
            <i className="fa-solid fa-rocket" />
            เริ่มต้นใช้งานฟรี
          </Link>

          {/* Trust */}
          <p style={{ marginTop: '24px', fontSize: '0.8rem', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
            ✦ ขับเคลื่อนด้วย Google Gemini AI &nbsp;·&nbsp; ไม่มีค่าใช้จ่าย
          </p>
        </div>
      </div>

    </div>
  );
}

'use client';
import Link from 'next/link';
import styles from './page.module.css';

export default function LandingPage() {
  return (
    <div className={styles.container}>

      {/* Image Background & Corner Gradients (Same as Home) */}
      <div className={styles.backgroundContainer}>
        <div className={styles.backgroundImage} />
        <div className={styles.backgroundOverlay} />

        <div className={styles.gradientTopLeft} />
        <div className={styles.gradientBottomRight} />
      </div>

      {/* Hero */}
      <main className="relative z-10 flex justify-center items-center w-full min-h-screen p-4 md:p-8">
        <div className={`fade-in-scale w-full text-center ${styles.heroCard}`}>
          {/* Eyebrow */}
          <p className={styles.eyebrow}>
            ระบบวิเคราะห์ศักยภาพ · แนะแนวอาชีพ · AI
          </p>

          {/* Logo-style heading */}
          <h1 className={styles.heading}>
            FUTUREPATH AI
          </h1>

          {/* Tagline */}
          <p className={styles.tagline}>
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
          <p className={styles.trustText}>
            ✦ ขับเคลื่อนด้วย Google Gemini AI &nbsp;·&nbsp; ไม่มีค่าใช้จ่าย
          </p>
        </div>
      </main>

    </div>
  );
}

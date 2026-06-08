'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import GlassNav from '@/components/GlassNav';
import UserBar from '@/components/UserBar';
import useAuth from '@/lib/useAuth';
import {
  Chart, LineElement, PointElement, LineController,
  CategoryScale, LinearScale, RadialLinearScale, RadarController,
  Filler, Tooltip, Legend, ArcElement, DoughnutController,
} from 'chart.js';

Chart.register(
  LineElement, PointElement, LineController, CategoryScale, LinearScale,
  RadialLinearScale, RadarController, Filler, Tooltip, Legend,
  ArcElement, DoughnutController,
);

const SHEET_WEBAPP_URL =
  'https://script.google.com/macros/s/AKfycby8Is6dQueTovRqsEbn90Yn-pYMBvXH3dNqDNwvodSMK7G0sRc-jTQm46y6c3vm6ij6/exec';

/* ── Reusable card style ─── */
const card = {
  background: 'var(--glass-bg)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: '1px solid var(--glass-border)',
  borderRadius: 'var(--r-lg)',
};

/* ── Feature data ─── */
const features = [
  {
    img: '/img/ai1.png',
    icon: 'fa-chart-bar',
    title: 'Data-Driven Insights',
    desc: 'วิเคราะห์จุดแข็งและทักษะของคุณอย่างแม่นยำด้วยฐานข้อมูลขนาดใหญ่',
  },
  {
    img: '/img/ai2.png',
    icon: 'fa-rocket',
    title: 'Future-Proof Careers',
    desc: 'แนะนำอาชีพดาวรุ่งแห่งอนาคตที่ไม่ถูกแทนที่ด้วยเทคโนโลยี',
  },
  {
    img: '/img/ai3.png',
    icon: 'fa-map',
    title: 'Personalized Roadmap',
    desc: 'วางแผนการเรียนรู้ (Upskill & Reskill) แบบเฉพาะตัว เพื่อก้าวสู่เป้าหมาย',
  },
];

export default function HomePage() {
  const { user, loading } = useAuth();
  const usageRef = useRef(null);
  const satRef   = useRef(null);
  const usageChartRef = useRef(null);
  const satChartRef   = useRef(null);
  const [stats, setStats] = useState({ users: '—', assess: '—', satisfaction: '—' });

  useEffect(() => {
    if (!loading && user.name) fetchDashboard();
  }, [loading, user.name]);

  async function fetchDashboard() {
    try {
      const res  = await fetch(SHEET_WEBAPP_URL, { method: 'POST', body: JSON.stringify({ action: 'getDashboardData' }) });
      const data = await res.json();
      if (data.status === 'success') {
        setStats({
          users:        data.totalUsers.toLocaleString(),
          assess:       data.totalAssessments.toLocaleString(),
          satisfaction: data.avgSatisfaction + ' / 5',
        });
        renderCharts(data.monthlyUsage, data.satDistribution);
      }
    } catch {
      setStats({ users: 'Error', assess: 'Error', satisfaction: 'Error' });
    }
  }

  function renderCharts(monthlyUsage, satDistribution) {
    if (!usageRef.current || !satRef.current) return;

    Chart.defaults.color      = 'rgba(220,230,255,0.65)';
    Chart.defaults.font.family = "'Kanit', sans-serif";
    Chart.defaults.font.size   = 12;

    if (usageChartRef.current) usageChartRef.current.destroy();
    if (satChartRef.current)   satChartRef.current.destroy();

    usageChartRef.current = new Chart(usageRef.current, {
      type: 'line',
      data: {
        labels: ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'],
        datasets: [{
          label: 'ผู้ลงทะเบียน',
          data: monthlyUsage,
          borderColor: '#00f2fe',
          backgroundColor: 'rgba(0,242,254,0.12)',
          borderWidth: 2.5,
          tension: 0.45,
          fill: true,
          pointBackgroundColor: '#ff0080',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { font: { family: 'Kanit' } } },
          x: { grid: { display: false },                  ticks: { font: { family: 'Kanit' } } },
        },
      },
    });

    satChartRef.current = new Chart(satRef.current, {
      type: 'doughnut',
      data: {
        labels: ['มากที่สุด (5)','มาก (4)','ปานกลาง (3)','น้อย (2)','น้อยที่สุด (1)'],
        datasets: [{
          data: satDistribution,
          backgroundColor: ['#00f2fe','#00c3ff','#ff0080','#ff5e00','#ff0040'],
          borderWidth: 0,
          hoverOffset: 8,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: { padding: 14, usePointStyle: true, color: 'rgba(220,230,255,0.7)', font: { family: 'Kanit', size: 11 } },
          },
        },
      },
    });
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Kanit,sans-serif', color: 'var(--text-sub)' }}>
      <i className="fas fa-spinner fa-spin mr-3" style={{ color: 'var(--accent-color)' }} /> กำลังโหลด...
    </div>
  );

  return (
    <div style={{ minHeight: '100vh' }}>
      <div className="blob blob-1" /><div className="blob blob-2" />
      <GlassNav />

      {/* ── Video banner below navbar ── */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '22vh',
          marginTop: '64px',
          overflow: 'hidden',
          maskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)',
        }}
      >
        <video autoPlay muted loop playsInline
          style={{ position: 'absolute', top: '50%', left: '50%', minWidth: '100%', minHeight: '100%', transform: 'translate(-50%,-50%)', objectFit: 'cover', zIndex: -1, opacity: 0.55 }}
        >
          <source src="/vdo/vdobg2.mp4" type="video/mp4" />
        </video>
      </div>

      {/* ── Main content ── */}
      <main
        style={{
          maxWidth: '1140px',
          margin: '-40px auto 0',
          padding: '0 24px 80px',
          position: 'relative',
          zIndex: 10,
        }}
      >
        <UserBar name={user.name} email={user.email} />

        {/* ── Hero Section ── */}
        <section
          className="flex flex-col md:flex-row items-center gap-8 md:gap-12 mb-12"
          style={{
            ...card,
            padding: '48px 32px',
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <p className="section-eyebrow" style={{ marginBottom: '12px' }}>ยินดีต้อนรับสู่</p>
            <h1
              style={{
                fontSize: 'clamp(2.4rem, 5vw, 3.5rem)',
                fontWeight: 900,
                letterSpacing: '0.08em',
                background: 'linear-gradient(135deg, var(--text-gradient-start) 0%, var(--text-gradient-end) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                marginBottom: '14px',
              }}
            >
              FUTUREPATH AI
            </h1>
            <h2
              style={{
                fontSize: '1.2rem',
                fontWeight: 600,
                color: 'var(--text-main)',
                marginBottom: '14px',
                lineHeight: 1.5,
              }}
            >
              ปลดล็อกศักยภาพที่ซ่อนอยู่ &mdash; ค้นพบ &ldquo;อาชีพที่ใช่&rdquo; ด้วย AI แห่งอนาคต
            </h2>
            <p
              style={{
                fontSize: '0.97rem',
                color: 'var(--text-sub)',
                lineHeight: 1.8,
                marginBottom: '28px',
              }}
            >
              ไม่มั่นใจว่าทักษะที่คุณมีเหมาะกับงานแบบไหน?<br />
              ให้ระบบ AI อัจฉริยะช่วยวิเคราะห์ตัวตน เจาะลึกศักยภาพ<br />
              และแนะนำสายงานที่ตรงกับคุณที่สุด
            </p>
            <a
              href="/assessment"
              className="btn-primary"
              style={{ textDecoration: 'none', fontSize: '1rem' }}
            >
              <i className="fa-solid fa-wand-magic-sparkles" />
              เริ่มต้นวิเคราะห์ศักยภาพ ฟรี!
            </a>
          </div>

          <div
            className="w-full md:w-[420px] shrink-0"
            style={{
              borderRadius: 'var(--r-lg)',
              overflow: 'hidden',
              border: '1px solid var(--glass-border)',
              boxShadow: '0 8px 40px rgba(0,242,254,0.12)',
            }}
          >
            <img
              src="/img/AIbanner.png"
              alt="AI Banner"
              style={{ width: '100%', display: 'block' }}
              onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=500'; }}
            />
          </div>
        </section>

        {/* ── Features ── */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <p className="section-eyebrow" style={{ marginBottom: '8px' }}>สิ่งที่เราทำได้</p>
          <h2
            style={{
              fontSize: '2rem',
              fontWeight: 800,
              background: 'linear-gradient(135deg, var(--text-gradient-start) 0%, var(--text-gradient-end) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            ฟีเจอร์เด่นของเรา
          </h2>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '20px',
            marginBottom: '56px',
          }}
        >
          {features.map((f) => (
            <div
              key={f.title}
              style={{
                ...card,
                padding: '36px 28px',
                textAlign: 'center',
                transition: 'transform 0.3s var(--ease-out), box-shadow 0.3s ease, border-color 0.3s ease',
                cursor: 'default',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform    = 'translateY(-6px)';
                e.currentTarget.style.boxShadow    = '0 16px 40px rgba(0,0,0,0.35)';
                e.currentTarget.style.borderColor  = 'var(--glass-border-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform    = '';
                e.currentTarget.style.boxShadow    = '';
                e.currentTarget.style.borderColor  = '';
              }}
            >
              <div
                style={{
                  width: '64px', height: '64px', borderRadius: '18px',
                  background: 'var(--accent-dim)', border: '1px solid var(--glass-border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 20px',
                }}
              >
                <img
                  src={f.img}
                  alt={f.title}
                  style={{ width: '36px', height: '36px', objectFit: 'contain' }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = `<i class="fa-solid ${f.icon}" style="font-size:1.6rem;color:var(--accent-color)"></i>`;
                  }}
                />
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '10px' }}>
                {f.title}
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-sub)', lineHeight: 1.7 }}>{f.desc}</p>
            </div>
          ))}
        </div>

        {/* ── Stats ── */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <p className="section-eyebrow" style={{ marginBottom: '8px' }}>ข้อมูลแบบเรียลไทม์</p>
          <h2
            style={{
              fontSize: '2rem',
              fontWeight: 800,
              background: 'linear-gradient(135deg, var(--text-gradient-start) 0%, var(--text-gradient-end) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            <i className="fa-solid fa-chart-line mr-2" style={{ fontSize: '1.4rem' }} />
            ภาพรวมสถิติระบบ
          </h2>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '32px',
          }}
        >
          {[
            { icon: 'fa-users',         label: 'ผู้เข้าใช้งานทั้งหมด',  value: stats.users        },
            { icon: 'fa-file-signature', label: 'ประเมินศักยภาพแล้ว',    value: stats.assess       },
            { icon: 'fa-star',           label: 'ความพึงพอใจเฉลี่ย',     value: stats.satisfaction },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                ...card,
                padding: '28px 20px',
                textAlign: 'center',
                transition: 'transform 0.25s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = ''; }}
            >
              <i
                className={`fa-solid ${s.icon}`}
                style={{ fontSize: '1.8rem', color: 'var(--accent-color)', marginBottom: '12px', display: 'block' }}
              />
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 500, letterSpacing: '0.04em' }}>
                {s.label}
              </p>
              <div style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '0.02em', lineHeight: 1 }}>
                {s.value}
              </div>
            </div>
          ))}
        </div>

        {/* ── Charts ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[
            { title: 'สถิติการลงทะเบียน (รายเดือน)', ref: usageRef },
            { title: 'ระดับความพึงพอใจ',              ref: satRef   },
          ].map((c) => (
            <div
              key={c.title}
              style={{
                ...card,
                padding: '28px 24px',
                height: '340px',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <h3
                style={{
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  color: 'var(--text-sub)',
                  marginBottom: '16px',
                  textAlign: 'center',
                  letterSpacing: '0.04em',
                }}
              >
                {c.title}
              </h3>
              <div style={{ flex: 1, position: 'relative' }}>
                <canvas ref={c.ref} />
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Admin Floating Button */}
      <Link
        href="/admin"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid var(--glass-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-muted)',
          zIndex: 999,
          textDecoration: 'none',
          backdropFilter: 'blur(10px)',
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
        }}
        onMouseEnter={e => {
          e.currentTarget.style.color = 'var(--accent-color)';
          e.currentTarget.style.background = 'rgba(0, 242, 254, 0.1)';
          e.currentTarget.style.borderColor = 'var(--accent-color)';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.color = 'var(--text-muted)';
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
          e.currentTarget.style.borderColor = 'var(--glass-border)';
          e.currentTarget.style.transform = 'none';
        }}
        title="ผู้ดูแลระบบ (Admin)"
      >
        <i className="fa-solid fa-lock" style={{ fontSize: '1rem' }} />
      </Link>
    </div>
  );
}

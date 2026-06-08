'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import GlassNav from '@/components/GlassNav';
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

// ── Purple palette (brighter) ─────────────────────────────────
const P = {
  darkest:  '#3D1F5C',
  dark:     '#6B2FA0',
  mid:      '#9B4DD4',
  light:    '#BC80E8',
  pale:     '#DDB8F0',
  glow:     'rgba(155,77,212,0.45)',
  glowSoft: 'rgba(155,77,212,0.18)',
  border:   'rgba(188,128,232,0.28)',
  borderHv: 'rgba(188,128,232,0.65)',
};

const features = [
  { icon: 'fa-brain',          label: 'วิเคราะห์ศักยภาพ', desc: 'AI วิเคราะห์ทักษะและแนะนำอาชีพที่เหมาะสมที่สุด',       href: '/assessment' },
  { icon: 'fa-comments',       label: 'AI ChatBot',       desc: 'ปรึกษา AI ได้ทุกเรื่องเกี่ยวกับการวางแผนอาชีพ',         href: '/chat'       },
  { icon: 'fa-microphone',     label: 'ฝึกสัมภาษณ์',      desc: 'จำลองการสัมภาษณ์งานจริงกับ AI HR มืออาชีพ',            href: '/interview'  },
  { icon: 'fa-briefcase',      label: 'ทดลองทำงาน',       desc: 'ลองทำงานจริงในสายอาชีพที่ฝันก่อนตัดสินใจ',            href: '/simulation' },
];

export default function HomePage() {
  const { user, loading } = useAuth();
  const usageRef    = useRef(null);
  const satRef      = useRef(null);
  const usageChart  = useRef(null);
  const satChart    = useRef(null);
  const [stats, setStats] = useState({ users: '—', assess: '—', satisfaction: '—' });
  const [hovered, setHovered] = useState(null);

  useEffect(() => {
    if (!loading && user.name) fetchDashboard();
  }, [loading, user.name]);

  async function fetchDashboard() {
    try {
      const res  = await fetch(SHEET_WEBAPP_URL, { method: 'POST', body: JSON.stringify({ action: 'getDashboardData' }) });
      const data = await res.json();
      if (data.status === 'success') {
        setStats({ users: data.totalUsers.toLocaleString(), assess: data.totalAssessments.toLocaleString(), satisfaction: data.avgSatisfaction + ' / 5' });
        renderCharts(data.monthlyUsage, data.satDistribution);
      }
    } catch {}
  }

  function renderCharts(monthlyUsage, satDistribution) {
    if (!usageRef.current || !satRef.current) return;
    Chart.defaults.color       = 'rgba(196,160,216,0.65)';
    Chart.defaults.font.family = "'Kanit', sans-serif";
    Chart.defaults.font.size   = 12;
    if (usageChart.current) usageChart.current.destroy();
    if (satChart.current)   satChart.current.destroy();

    usageChart.current = new Chart(usageRef.current, {
      type: 'line',
      data: {
        labels: ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'],
        datasets: [{ label: 'ผู้ลงทะเบียน', data: monthlyUsage,
          borderColor: P.light, backgroundColor: P.glowSoft,
          borderWidth: 2, tension: 0.45, fill: true,
          pointBackgroundColor: P.pale, pointBorderColor: P.darkest, pointBorderWidth: 2, pointRadius: 4 }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { grid: { color: 'rgba(155,107,192,0.1)' }, ticks: { color: 'rgba(196,160,216,0.6)' } },
          x: { grid: { display: false },                 ticks: { color: 'rgba(196,160,216,0.6)' } },
        },
      },
    });

    satChart.current = new Chart(satRef.current, {
      type: 'doughnut',
      data: {
        labels: ['มากที่สุด (5)','มาก (4)','ปานกลาง (3)','น้อย (2)','น้อยที่สุด (1)'],
        datasets: [{ data: satDistribution,
          backgroundColor: [P.mid, P.light, P.pale, '#6B2D8B', P.darkest],
          borderWidth: 0, hoverOffset: 8 }],
      },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: '72%',
        plugins: { legend: { position: 'bottom', labels: { padding: 14, usePointStyle: true, color: 'rgba(196,160,216,0.7)', font: { family: 'Kanit', size: 11 } } } },
      },
    });
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Kanit,sans-serif', background: 'linear-gradient(135deg, #3D1F5C 0%, #2D1B3D 100%)', color: P.pale }}>
      <i className="fas fa-spinner fa-spin" style={{ marginRight: 10, color: P.light }} /> กำลังโหลด...
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: `linear-gradient(145deg, #3D1F5C 0%, #2A1A4A 35%, #351C5B 70%, #4A2575 100%)`, fontFamily: 'Kanit,sans-serif' }}>

      {/* ── Ambient circles ── */}
      <div style={{ position: 'fixed', top: '-150px', left: '-150px',  width: '550px', height: '550px', borderRadius: '50%', background: `radial-gradient(circle, rgba(155,77,212,0.25) 0%, transparent 65%)`, pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '-100px', right: '-100px', width: '450px', height: '450px', borderRadius: '50%', background: `radial-gradient(circle, rgba(107,47,160,0.22) 0%, transparent 65%)`, pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', top: '40%', right: '15%', width: '300px', height: '300px', borderRadius: '50%', background: `radial-gradient(circle, rgba(188,128,232,0.10) 0%, transparent 60%)`, pointerEvents: 'none', zIndex: 0 }} />

      <GlassNav />

      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '100px 24px 80px', position: 'relative', zIndex: 1 }}>

        {/* ─────────── HERO ─────────── */}
        <section style={{ textAlign: 'center', marginBottom: '80px' }}>

          {/* Eyebrow */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 18px', borderRadius: '999px', border: `1px solid ${P.border}`, background: 'rgba(155,77,212,0.18)', marginBottom: '28px' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: P.light, display: 'inline-block', boxShadow: `0 0 8px ${P.light}`, animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: '0.72rem', letterSpacing: '0.14em', color: P.pale, fontWeight: 700, textTransform: 'uppercase' }}>
              AI-Powered Career Platform
            </span>
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize: 'clamp(2.8rem, 6vw, 5rem)',
            fontWeight: 900, letterSpacing: '0.06em', lineHeight: 1.1,
            background: `linear-gradient(135deg, #fff 0%, ${P.pale} 40%, ${P.light} 100%)`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            marginBottom: '20px',
            filter: 'drop-shadow(0 0 30px rgba(188,128,232,0.5))',
          }}>
            FUTUREPATH AI
          </h1>

          <p style={{ fontSize: 'clamp(1rem, 2vw, 1.15rem)', color: '#E8D0F8', maxWidth: '560px', margin: '0 auto 40px', lineHeight: 1.8 }}>
            ค้นพบอาชีพที่ใช่ ฝึกทักษะที่ต้องการ<br />และเดินหน้าสู่อนาคตที่คุณออกแบบเอง
          </p>

          {/* CTA row */}
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/assessment" style={{
              padding: '14px 36px', borderRadius: '999px',
              background: `linear-gradient(135deg, ${P.dark}, ${P.mid})`,
              color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: '1rem',
              boxShadow: `0 8px 32px ${P.glow}`,
              transition: 'transform 0.25s ease, box-shadow 0.25s ease',
              display: 'inline-flex', alignItems: 'center', gap: '8px',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 12px 40px ${P.glow}`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = `0 8px 32px ${P.glow}`; }}
            >
              <i className="fa-solid fa-wand-magic-sparkles" /> เริ่มวิเคราะห์ฟรี
            </Link>
            <Link href="/chat" style={{
              padding: '14px 32px', borderRadius: '999px',
              background: 'transparent', border: `1.5px solid ${P.border}`,
              color: P.pale, textDecoration: 'none', fontWeight: 600, fontSize: '1rem',
              transition: 'all 0.25s ease',
              display: 'inline-flex', alignItems: 'center', gap: '8px',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = P.light; e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = P.glowSoft; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = P.border; e.currentTarget.style.color = P.pale; e.currentTarget.style.background = 'transparent'; }}
            >
              <i className="fa-solid fa-comments" /> คุยกับ AI
            </Link>
          </div>

          {/* Welcome pill */}
          <div style={{ marginTop: '36px', display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '10px 20px', borderRadius: '999px', background: 'rgba(255,255,255,0.07)', border: `1px solid ${P.border}` }}>
            <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: `linear-gradient(135deg, ${P.dark}, ${P.mid})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 900, color: '#fff', boxShadow: `0 0 12px ${P.glow}` }}>
              {user.name?.charAt(0)}
            </div>
            <span style={{ fontSize: '0.88rem', color: 'rgba(232,208,248,0.75)' }}>
              ยินดีต้อนรับ, <strong style={{ color: '#E8D0F8' }}>{user.name}</strong>
            </span>
          </div>
        </section>

        {/* ─────────── FEATURES GRID ─────────── */}
        <section style={{ marginBottom: '80px' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <p style={{ fontSize: '0.7rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: P.light, fontWeight: 700, marginBottom: '8px' }}>ฟีเจอร์</p>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 800, color: '#fff', margin: 0, textShadow: '0 2px 20px rgba(188,128,232,0.3)' }}>สิ่งที่คุณทำได้กับเรา</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            {features.map((f, i) => (
              <Link key={f.href} href={f.href} style={{ textDecoration: 'none' }}>
                <div
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    padding: '32px 24px',
                    borderRadius: '20px',
                    border: `1px solid ${hovered === i ? P.borderHv : P.border}`,
                    background: hovered === i
                      ? `linear-gradient(135deg, rgba(107,47,160,0.50), rgba(155,77,212,0.30))`
                      : 'rgba(255,255,255,0.12)',
                    backdropFilter: 'blur(12px)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    transform: hovered === i ? 'translateY(-6px)' : 'translateY(0)',
                    boxShadow: hovered === i ? `0 20px 56px ${P.glow}` : '0 2px 12px rgba(0,0,0,0.2)',
                  }}
                >
                  <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: hovered === i ? `linear-gradient(135deg, ${P.dark}, ${P.mid})` : `rgba(123,61,184,0.15)`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', transition: 'all 0.3s ease' }}>
                    <i className={`fa-solid ${f.icon}`} style={{ fontSize: '1.3rem', color: hovered === i ? '#fff' : P.light }} />
                  </div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>{f.label}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'rgba(220,190,245,0.8)', lineHeight: 1.65, margin: 0 }}>{f.desc}</p>
                  <div style={{ marginTop: '16px', fontSize: '0.78rem', color: P.light, display: 'flex', alignItems: 'center', gap: '4px', opacity: hovered === i ? 1 : 0.6, transition: 'opacity 0.3s ease' }}>
                    เริ่มต้น <i className="fa-solid fa-arrow-right" style={{ fontSize: '0.7rem' }} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ─────────── STATS ─────────── */}
        <section style={{ marginBottom: '80px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
            {[
              { icon: 'fa-users',         label: 'ผู้ใช้งานทั้งหมด', value: stats.users        },
              { icon: 'fa-file-signature', label: 'ประเมินแล้ว',       value: stats.assess       },
              { icon: 'fa-star',           label: 'ความพึงพอใจ',       value: stats.satisfaction },
            ].map((s) => (
              <div key={s.label} style={{ padding: '28px 24px', borderRadius: '20px', border: `1px solid ${P.border}`, background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(12px)', textAlign: 'center' }}>
                <i className={`fa-solid ${s.icon}`} style={{ fontSize: '1.6rem', color: P.light, marginBottom: '12px', display: 'block', filter: `drop-shadow(0 0 8px ${P.light})` }} />
                <div style={{ fontSize: '2rem', fontWeight: 900, color: '#fff', lineHeight: 1, marginBottom: '6px', textShadow: '0 2px 12px rgba(188,128,232,0.4)' }}>{s.value}</div>
                <p style={{ fontSize: '0.78rem', color: 'rgba(220,190,245,0.65)', margin: 0, letterSpacing: '0.04em' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─────────── CHARTS ─────────── */}
        <section>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
            {[
              { title: 'สถิติการลงทะเบียน (รายเดือน)', ref: usageRef },
              { title: 'ระดับความพึงพอใจ',              ref: satRef   },
            ].map((c) => (
              <div key={c.title} style={{ padding: '28px', borderRadius: '20px', border: `1px solid ${P.border}`, background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(12px)', height: '320px', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'rgba(196,160,216,0.7)', marginBottom: '16px', textAlign: 'center', letterSpacing: '0.06em' }}>
                  {c.title}
                </h3>
                <div style={{ flex: 1, position: 'relative' }}>
                  <canvas ref={c.ref} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Admin FAB */}
      <Link href="/admin" title="Admin" style={{
        position: 'fixed', bottom: '24px', right: '24px',
        width: '40px', height: '40px', borderRadius: '50%',
        background: 'rgba(255,255,255,0.03)', border: `1px solid ${P.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'rgba(196,160,216,0.35)', textDecoration: 'none', zIndex: 999,
        backdropFilter: 'blur(10px)', transition: 'all 0.3s ease',
      }}
        onMouseEnter={e => { e.currentTarget.style.color = P.light; e.currentTarget.style.borderColor = P.border; }}
        onMouseLeave={e => { e.currentTarget.style.color = 'rgba(196,160,216,0.35)'; }}
      >
        <i className="fa-solid fa-lock" style={{ fontSize: '0.9rem' }} />
      </Link>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
      `}</style>
    </div>
  );
}

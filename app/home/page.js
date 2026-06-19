'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import useAuth from '@/lib/useAuth';
import GlassNav from '@/components/GlassNav';
import { Chart, LineElement, PointElement, LineController, CategoryScale, LinearScale, Filler, Tooltip } from 'chart.js';

Chart.register(LineElement, PointElement, LineController, CategoryScale, LinearScale, Filler, Tooltip);

const SHEET_WEBAPP_URL = 'https://script.google.com/macros/s/AKfycby-qewa8CfMVp1V5GimbZtprRKDTPlRBNxa2siekCfM8mdKAXo1MAE9htIjidMlei2fqQ/exec';

export default function HomePage() {
  const { user, loading } = useAuth();
  const [stats, setStats] = useState({ users: '...', assess: '...', satisfaction: '...' });
  const [activeToggles, setActiveToggles] = useState({
    f1: true,
    f2: false,
    f3: false,
    f4: false
  });
  const [showModal, setShowModal] = useState(false);
  const usageRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (!loading && user.name) {
      fetchDashboard();
      // Show TCAS portfolio modal automatically
      const timer = setTimeout(() => setShowModal(true), 800);
      return () => clearTimeout(timer);
    }
  }, [loading, user.name]);

  async function fetchDashboard() {
    try {
      const res = await fetch(SHEET_WEBAPP_URL, { method: 'POST', body: JSON.stringify({ action: 'getDashboardData' }) });
      const data = await res.json();
      if (data.status === 'success') {
        setStats({
          users: data.totalUsers.toLocaleString(),
          assess: data.totalAssessments.toLocaleString(),
          satisfaction: data.avgSatisfaction,
        });
        renderLineChart(data.monthlyUsage);
      }
    } catch {
      setStats({ users: 'Err', assess: 'Err', satisfaction: '0' });
    }
  }

  function renderLineChart(monthlyUsage) {
    if (!usageRef.current) return;
    if (chartInstance.current) chartInstance.current.destroy();

    Chart.defaults.color = 'rgba(255,255,255,0.6)';
    Chart.defaults.font.family = "'Kanit', sans-serif";

    chartInstance.current = new Chart(usageRef.current, {
      type: 'line',
      data: {
        labels: ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'],
        datasets: [{
          label: 'ผู้ลงทะเบียน',
          data: monthlyUsage,
          borderColor: '#ff9d4d',
          backgroundColor: 'rgba(255,122,0,0.15)',
          borderWidth: 2,
          tension: 0.4,
          fill: true,
          pointBackgroundColor: '#ff4b00',
          pointBorderColor: '#fff',
          pointRadius: 4,
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { grid: { color: 'rgba(255,255,255,0.05)' } },
          x: { grid: { display: false } },
        },
      },
    });
  }

  // Common glass styles
  const glassPanel = {
    background: 'rgba(255, 255, 255, 0.12)',
    backdropFilter: 'blur(40px)',
    WebkitBackdropFilter: 'blur(40px)',
    border: '1px solid rgba(255, 255, 255, 0.25)',
    boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.4), 0 24px 64px rgba(0, 0, 0, 0.4)',
    borderRadius: '40px',
  };

  const glassCard = {
    background: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '28px',
    boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1)',
    padding: '24px',
    display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden',
    transition: 'all 0.3s ease-out',
  };

  const activeCard = {
    ...glassCard,
    background: 'linear-gradient(135deg, #ff7a00 0%, #ff4b00 100%)',
    border: '1px solid #ff9d4d',
    boxShadow: '0 8px 32px rgba(255, 122, 0, 0.4), inset 0 2px 4px rgba(255,255,255,0.4)',
    color: '#fff',
  };

  const Toggle = ({ active, onChange }) => (
    <div 
      onClick={onChange}
      style={{
        width: '44px', height: '24px', borderRadius: '12px',
        background: active ? '#fff' : 'rgba(255,255,255,0.3)',
        padding: '2px', cursor: 'pointer', transition: 'all 0.3s',
        display: 'flex', alignItems: 'center', justifyContent: active ? 'flex-end' : 'flex-start',
      }}
    >
      <div style={{
        width: '20px', height: '20px', borderRadius: '50%',
        background: active ? '#ff6b00' : '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
      }} />
    </div>
  );

  if (loading) return null;

  return (
    <div style={{ minHeight: '100vh', background: '#120c0a', color: '#fff', fontFamily: "'Kanit', sans-serif" }}>

      {/* Image Background & Corner Gradients */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        {/* Main Sci-Fi Image */}
        <div style={{ 
          position: 'absolute', inset: 0, 
          backgroundImage: "url('/img/bg-room.jpg')", 
          backgroundSize: 'cover', 
          backgroundPosition: 'center',
          opacity: 0.8
        }} />
        {/* Dark overlay to ensure text readability */}
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(18, 12, 10, 0.65)' }} />

        {/* Orange Ambient Glows at Corners */}
        <div style={{ position: 'absolute', top: '-20%', left: '-15%', width: '60vw', height: '60vw', background: 'radial-gradient(circle, rgba(255,122,0,0.35) 0%, transparent 70%)', filter: 'blur(80px)', mixBlendMode: 'screen' }} />
        <div style={{ position: 'absolute', bottom: '-20%', right: '-15%', width: '70vw', height: '70vw', background: 'radial-gradient(circle, rgba(255,75,0,0.3) 0%, transparent 70%)', filter: 'blur(100px)', mixBlendMode: 'screen' }} />
      </div>

      <GlassNav />

      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes zoomIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .stagger-1 { animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; animation-delay: 0.1s; }
        .stagger-2 { animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; animation-delay: 0.2s; }
        .stagger-3 { animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; animation-delay: 0.3s; }
      `}</style>

      <main className="relative z-10 flex justify-center items-center w-full min-h-screen p-4 md:p-8" style={{ paddingLeft: '80px' }}>
        <div className="flex w-[100%] md:w-[95%] max-w-[1400px] gap-2 md:gap-6" style={{ minHeight: '85vh' }}>
          
          <div style={{ ...glassPanel, flex: 1, padding: '40px 48px', display: 'flex', flexDirection: 'column', gap: '40px' }}>
          
          {/* Header Row (Hero Content) */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '24px', alignItems: 'center' }}>
            <div style={{ maxWidth: '60%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                <div style={{
                  width: '56px', height: '56px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #ff7a00, #ff4b00)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: '1.5rem', fontWeight: 700,
                  boxShadow: '0 4px 16px rgba(255,107,0,0.4)'
                }}>
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <p style={{ color: '#ff9d4d', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', fontSize: '0.9rem', margin: 0 }}>
                  ยินดีต้อนรับคุณ {user.name?.split(' ')[0]} สู่
                </p>
              </div>
              <h1 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.8rem)', fontWeight: 800, lineHeight: 1.2, marginBottom: '16px' }}>
                ปลดล็อกศักยภาพที่ซ่อนอยู่ <br />
                <span style={{ color: '#ffb347' }}>ค้นพบ &ldquo;อาชีพที่ใช่&rdquo;</span> ด้วย AI
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem', lineHeight: 1.6 }}>
                ไม่มั่นใจว่าทักษะที่คุณมีเหมาะกับงานแบบไหน? ให้ระบบ AI อัจฉริยะช่วยวิเคราะห์ตัวตน เจาะลึกศักยภาพ และแนะนำสายงานที่ตรงกับคุณที่สุด
              </p>
            </div>
            <div>
              <Link href="/assessment" className="hover-glow-btn" style={{
                display: 'inline-flex', alignItems: 'center', gap: '12px', padding: '16px 32px', borderRadius: '30px',
                background: 'linear-gradient(135deg, #ff7a00, #ff4b00)', color: '#fff', textDecoration: 'none',
                fontWeight: 700, fontSize: '1.1rem', boxShadow: '0 8px 32px rgba(255,107,0,0.4)'
              }}>
                <i className="fa-solid fa-wand-magic-sparkles" /> เริ่มต้นวิเคราะห์ศักยภาพ ฟรี!
              </Link>
            </div>
          </div>

          {/* Bento Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            
            {/* Column 1: Feature Cards */}
            <div className="stagger-1" style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%' }}>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)', marginBottom: '4px', letterSpacing: '0.12em', textTransform: 'uppercase' }}>การนำไปประยุกต์ใช้งาน (Use Cases)</h3>

              {[
                {
                  icon: 'fa-robot', iconBg: 'linear-gradient(135deg,#2bcbba,#0a9e8f)', tag: 'AI Powered',
                  en: 'AI Chatbot', th: 'แชทบอทที่ปรึกษาอาชีพ',
                  desc: 'สอบถามและวางแผนอนาคตกับ AI ที่เข้าใจคุณได้ตลอด 24 ชั่วโมง',
                  href: '/chat', color: '#2bcbba',
                },
                {
                  icon: 'fa-compass', iconBg: 'linear-gradient(135deg,#ff7a00,#ff4b00)', tag: 'ค้นหาตัวเอง',
                  en: 'Self Discovery', th: 'ค้นหาคณะและสายการเรียน',
                  desc: 'วิเคราะห์ศักยภาพเชิงลึกด้วย AI เพื่อเลือกคณะหรือสายการเรียน ม.ปลาย หมดปัญหาเรียนผิดสาย',
                  href: '/assessment', color: '#ff7a00',
                },
                {
                  icon: 'fa-briefcase', iconBg: 'linear-gradient(135deg,#fed330,#f7b731)', tag: 'ประสบการณ์',
                  en: 'Dream Job Simulation', th: 'ทดลองงานในฝัน',
                  desc: 'สร้างความได้เปรียบด้วยการทดลองงานเสมือนจริง และประเมินความเหมาะสมก่อนเลือกอาชีพ',
                  href: '/simulation', color: '#fed330',
                },
                {
                  icon: 'fa-microphone', iconBg: 'linear-gradient(135deg,#a55eea,#7c3aed)', tag: 'ฝึกฝน',
                  en: 'Mock Interview', th: 'จำลองการสัมภาษณ์งาน',
                  desc: 'ฝึกซ้อมสัมภาษณ์กับ AI HR จำลอง รับ Feedback แบบเรียลไทม์ เพื่อเพิ่มความมั่นใจ',
                  href: '/interview', color: '#a55eea',
                },
              ].map((f) => {
                const innerCard = (
                  <div
                    className="hover-lift"
                    style={{
                      ...glassCard,
                      cursor: 'pointer',
                      padding: '20px 22px',
                      transition: 'all 0.25s ease',
                      flex: 1,
                      justifyContent: 'center',
                    }}
                    onClick={f.onClick}
                    onMouseEnter={e => { e.currentTarget.style.background = `${f.color}18`; e.currentTarget.style.borderColor = `${f.color}60`; }}
                    onMouseLeave={e => { e.currentTarget.style.background = glassCard.background; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      {/* Icon circle */}
                      <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: f.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 4px 12px ${f.color}40` }}>
                        <i className={`fa-solid ${f.icon}`} style={{ color: '#fff', fontSize: '1.1rem' }} />
                      </div>
                      {/* Text */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                          <span style={{ fontSize: '0.98rem', fontWeight: 800, color: '#fff' }}>{f.en}</span>
                          <span style={{ fontSize: '0.65rem', fontWeight: 700, color: f.color, background: `${f.color}20`, border: `1px solid ${f.color}50`, borderRadius: '999px', padding: '1px 8px', letterSpacing: '0.05em' }}>{f.tag}</span>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.55)', margin: 0 }}>{f.th}</p>
                      </div>
                      <i className="fa-solid fa-chevron-right" style={{ color: f.color, fontSize: '0.8rem', opacity: 0.7 }} />
                    </div>
                  </div>
                );

                if (f.href) {
                  return (
                    <Link key={f.en} href={f.href} style={{ textDecoration: 'none', display: 'flex', flex: 1 }}>
                      {innerCard}
                    </Link>
                  );
                }

                return (
                  <div key={f.en} style={{ textDecoration: 'none', display: 'flex', flex: 1 }}>
                    {innerCard}
                  </div>
                );
              })}
            </div>


            {/* Column 2: Satisfaction Dial & Quick Stats */}
            <div className="stagger-2" style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%' }}>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)', marginBottom: '4px', letterSpacing: '0.12em', textTransform: 'uppercase' }}>ภาพรวมสถิติระบบ</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div 
                  className="hover-lift"
                  style={{ ...glassCard, padding: '20px', alignItems: 'center', textAlign: 'center' }}
                >
                  <i className="fa-solid fa-users" style={{ color: '#ffb347', fontSize: '1.5rem', marginBottom: '8px' }} />
                  <h3 style={{ fontSize: '1.8rem', fontWeight: 700, lineHeight: 1 }}>{stats.users}</h3>
                  <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', marginTop: '4px' }}>ผู้ใช้งานทั้งหมด</p>
                </div>
                <div 
                  className="hover-lift"
                  style={{ ...glassCard, padding: '20px', alignItems: 'center', textAlign: 'center' }}
                >
                  <i className="fa-solid fa-file-signature" style={{ color: '#ff4b00', fontSize: '1.5rem', marginBottom: '8px' }} />
                  <h3 style={{ fontSize: '1.8rem', fontWeight: 700, lineHeight: 1 }}>{stats.assess}</h3>
                  <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', marginTop: '4px' }}>การประเมินศักยภาพ</p>
                </div>
              </div>

              <div 
                className="hover-lift"
                style={{ ...glassCard, flex: 1, padding: '32px 24px' }}
              >
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 500 }}>ระดับความพึงพอใจ</h3>
                </div>
                
                <div style={{ position: 'relative', width: '200px', height: '200px', margin: '0 auto' }}>
                  <svg width="200" height="200" viewBox="0 0 240 240" style={{ transform: 'rotate(-135deg)' }}>
                    <circle cx="120" cy="120" r="100" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="16" strokeDasharray="471" strokeDashoffset="0" strokeLinecap="round" />
                    <circle 
                      cx="120" cy="120" r="100" fill="none" 
                      stroke="url(#orangeGrad)" strokeWidth="16" 
                      strokeDasharray="471" 
                      strokeDashoffset={isNaN(parseFloat(stats.satisfaction)) ? 471 : 471 - (471 * (parseFloat(stats.satisfaction) / 5.0))} 
                      strokeLinecap="round" 
                      style={{ 
                        filter: 'drop-shadow(0 0 8px rgba(255,107,0,0.5))',
                        transition: 'stroke-dashoffset 2s cubic-bezier(0.16, 1, 0.3, 1)'
                      }} 
                    />
                    <defs>
                      <linearGradient id="orangeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ffb347" />
                        <stop offset="100%" stopColor="#ff6b00" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div style={{
                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                    width: '120px', height: '120px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
                    boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.2)',
                    display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                  }}>
                    <span style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>{stats.satisfaction}</span>
                    <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>/ 5.0</span>
                  </div>
                </div>

                {/* Sub-metrics */}
                <div style={{ marginTop: '40px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { label: 'ความแม่นยำของการวิเคราะห์ (AI)', pct: 92 },
                    { label: 'ประสบการณ์ใช้งานแพลตฟอร์ม', pct: 95 },
                    { label: 'แนะนำให้เพื่อนใช้งานต่อ', pct: 98 },
                  ].map((m, i) => (
                    <div key={i}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                        <span style={{ color: 'rgba(255,255,255,0.7)' }}>{m.label}</span>
                        <span style={{ color: '#ffb347', fontWeight: 600 }}>{m.pct}%</span>
                      </div>
                      <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ 
                          width: stats.satisfaction !== '...' ? `${m.pct}%` : '0%', 
                          height: '100%', 
                          background: 'linear-gradient(90deg, #ff4b00, #ffb347)',
                          transition: `width 1.5s cubic-bezier(0.16, 1, 0.3, 1) ${0.2 * i}s`
                        }} />
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            </div>

            {/* Column 3: Monthly Usage Chart & Feedback */}
            <div className="stagger-3" style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%' }}>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)', marginBottom: '4px', letterSpacing: '0.12em', textTransform: 'uppercase' }}>สถิติและการประเมิน</h3>
              <div 
                className="hover-lift"
                style={{ ...glassCard, flex: 1 }}
              >
                <h4 style={{ fontSize: '0.95rem', fontWeight: 500, color: '#ffb347', marginBottom: '20px' }}>การลงทะเบียน (ผู้ใช้ใหม่)</h4>
                <div style={{ position: 'relative', width: '100%', height: 'calc(100% - 40px)', minHeight: '160px' }}>
                  <canvas ref={usageRef} />
                </div>
              </div>

              {/* Feedback Card */}
              <Link href="/feedback" style={{ textDecoration: 'none' }}>
                <div
                  className="hover-lift"
                  style={{
                    ...glassCard,
                    padding: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    background: 'linear-gradient(135deg, rgba(255,122,0,0.15), rgba(255,75,0,0.05))',
                    border: '1px solid rgba(255,122,0,0.3)',
                  }}
                >
                  <div style={{ 
                    width: '48px', height: '48px', borderRadius: '14px', 
                    background: 'linear-gradient(135deg, #ff7a00, #ff4b00)', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    boxShadow: '0 4px 16px rgba(255, 122, 0, 0.4)'
                  }}>
                    <i className="fa-solid fa-star" style={{ color: '#fff', fontSize: '1.2rem' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>ประเมินความพึงพอใจ</h4>
                    <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.65)', margin: 0, lineHeight: 1.4 }}>
                      ช่วยเราพัฒนาระบบ FUTUREPATH ให้ดียิ่งขึ้น
                    </p>
                  </div>
                  <div style={{ 
                    width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center' 
                  }}>
                    <i className="fa-solid fa-arrow-right" style={{ color: '#ffb347', fontSize: '0.9rem' }} />
                  </div>
                </div>
              </Link>
            </div>

          </div>
        </div>
        </div>
      </main>

      {/* Modal Notification */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0, 0, 0, 0.65)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          animation: 'fadeIn 0.3s ease-out'
        }} onClick={() => setShowModal(false)}>
          <div 
            onClick={e => e.stopPropagation()}
            style={{
              background: 'linear-gradient(135deg, rgba(30, 20, 15, 0.95), rgba(18, 12, 10, 0.98))',
              border: '1px solid rgba(255, 122, 0, 0.3)',
              borderRadius: '24px', padding: '40px 32px',
              maxWidth: '450px', width: '90%', textAlign: 'center',
              boxShadow: '0 24px 64px rgba(255, 75, 0, 0.3), inset 0 1px 1px rgba(255,255,255,0.1)',
              position: 'relative',
              animation: 'zoomIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            {/* Close button */}
            <button 
              onClick={() => setShowModal(false)} 
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: '8px', transition: 'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = '#fff'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
            >
              <i className="fa-solid fa-xmark" style={{ fontSize: '1.2rem' }} />
            </button>

            {/* Icon */}
            <div style={{ 
              width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto 24px',
              background: 'linear-gradient(135deg, #ff0080, #ff8c00)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 32px rgba(255, 0, 128, 0.4)'
            }}>
              <i className="fa-solid fa-file-pdf" style={{ fontSize: '2.5rem', color: '#fff' }} />
            </div>

            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', marginBottom: '12px' }}>
              เคล็ดลับการสร้าง Portfolio
            </h3>
            
            <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.7, marginBottom: '24px' }}>
              เพียงแค่ทำ <strong style={{ color: '#ffb347' }}>แบบประเมินศักยภาพ</strong> หรือ <strong style={{ color: '#ffb347' }}>ทดลองงานในฝัน</strong> จนจบ <br/>ระบบจะดึงจุดแข็งมาจัดหน้า Portfolio สวยๆ ให้คุณใช้ยื่น TCAS รอบ 1 ได้ทันที!
            </p>

            <button 
              onClick={() => setShowModal(false)}
              className="hover-glow-btn"
              style={{
                width: '100%', padding: '14px', borderRadius: '16px',
                background: 'rgba(255, 122, 0, 0.15)', border: '1px solid #ff7a00',
                color: '#ffb347', fontWeight: 700, fontSize: '1rem', cursor: 'pointer'
              }}
            >
              รับทราบ
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

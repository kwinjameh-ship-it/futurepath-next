'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import useAuth from '@/lib/useAuth';
import GlassNav from '@/components/GlassNav';
import { Chart, LineElement, PointElement, LineController, CategoryScale, LinearScale, Filler, Tooltip } from 'chart.js';

Chart.register(LineElement, PointElement, LineController, CategoryScale, LinearScale, Filler, Tooltip);

const SHEET_WEBAPP_URL = 'https://script.google.com/macros/s/AKfycby8Is6dQueTovRqsEbn90Yn-pYMBvXH3dNqDNwvodSMK7G0sRc-jTQm46y6c3vm6ij6/exec';

export default function HomePage() {
  const { user, loading } = useAuth();
  const [stats, setStats] = useState({ users: '...', assess: '...', satisfaction: '...' });
  const [activeToggles, setActiveToggles] = useState({
    f1: true,
    f2: false,
    f3: false,
    f4: false
  });
  const usageRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (!loading && user.name) fetchDashboard();
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
              <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)', marginBottom: '4px', letterSpacing: '0.12em', textTransform: 'uppercase' }}>ฟีเจอร์เด่นของเรา</h3>

              {[
                {
                  icon: 'fa-brain', iconBg: 'linear-gradient(135deg,#ff7a00,#ff4b00)', tag: 'แนะนำ',
                  en: 'Potential Assessment', th: 'วิเคราะห์ศักยภาพ',
                  desc: 'ประเมินทักษะและค้นพบจุดแข็งที่ซ่อนอยู่ด้วย AI ที่แม่นยำ',
                  bullets: ['จับคู่กับสายงานที่เหมาะสม','วิเคราะห์ทักษะทั้ง 6 ด้าน','ผลลัพธ์เชิงลึกจาก AI'],
                  href: '/assessment', color: '#ff7a00',
                },
                {
                  icon: 'fa-robot', iconBg: 'linear-gradient(135deg,#2bcbba,#0a9e8f)', tag: 'AI Powered',
                  en: 'AI Chatbot', th: 'แชทบอทที่ปรึกษาอาชีพ',
                  desc: 'สอบถามและวางแผนอนาคตกับ AI ที่เข้าใจคุณได้ตลอด 24 ชั่วโมง',
                  bullets: ['คำแนะนำเฉพาะบุคคล','ตอบได้ทุกคำถามด้านอาชีพ','ปรึกษาได้ทุกเวลา'],
                  href: '/chat', color: '#2bcbba',
                },
                {
                  icon: 'fa-microphone', iconBg: 'linear-gradient(135deg,#a55eea,#7c3aed)', tag: 'ฝึกฝน',
                  en: 'Mock Interview', th: 'จำลองการสัมภาษณ์งาน',
                  desc: 'ฝึกซ้อมสัมภาษณ์กับ AI HR จำลอง รับ Feedback แบบเรียลไทม์',
                  bullets: ['AI HR สัมภาษณ์จริง','ประเมินคำตอบและให้คะแนน','เพิ่มความมั่นใจก่อนสมัครงาน'],
                  href: '/interview', color: '#a55eea',
                },
                {
                  icon: 'fa-briefcase', iconBg: 'linear-gradient(135deg,#fed330,#f7b731)', tag: 'ใหม่',
                  en: 'Dream Job Simulation', th: 'ทดลองงานในฝัน',
                  desc: 'สัมผัสประสบการณ์การทำงานจริงในสายอาชีพต่างๆ ก่อนตัดสินใจ',
                  bullets: ['ภารกิจจำลองสถานการณ์จริง','ทดลองหลายสายอาชีพ','ประเมินความเหมาะสมก่อนเลือก'],
                  href: '/assessment', color: '#fed330',
                },
              ].map((f) => (
                <Link key={f.en} href={f.href} style={{ textDecoration: 'none', display: 'flex', flex: 1 }}>
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
                </Link>
              ))}
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

            {/* Column 3: Monthly Usage Chart */}
            <div className="stagger-3" style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%' }}>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)', marginBottom: '4px', letterSpacing: '0.12em', textTransform: 'uppercase' }}>กราฟสถิติรายเดือน</h3>
              <div 
                className="hover-lift"
                style={{ ...glassCard, flex: 1 }}
              >
                <h4 style={{ fontSize: '0.95rem', fontWeight: 500, color: '#ffb347', marginBottom: '20px' }}>การลงทะเบียน (ผู้ใช้ใหม่)</h4>
                <div style={{ position: 'relative', width: '100%', height: 'calc(100% - 40px)', minHeight: '220px' }}>
                  <canvas ref={usageRef} />
                </div>
              </div>
            </div>

          </div>
        </div>
        </div>
      </main>
    </div>
  );
}

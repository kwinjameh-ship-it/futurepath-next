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

      <main className="relative z-10 flex justify-center items-center w-full min-h-screen p-4 md:p-8">
        <div className="flex w-[90%] md:w-[85%] max-w-[1400px] gap-2 md:gap-6" style={{ minHeight: '85vh' }}>
          
          {/* Desktop Attached Nav */}
          <div className="hidden md:block shrink-0 self-center relative z-[99]">
            <GlassNav inline={true} />
          </div>

          <div style={{ ...glassPanel, flex: 1, padding: '40px 48px', display: 'flex', flexDirection: 'column', gap: '40px' }}>
          
          {/* Header Row (Hero Content) */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '24px', alignItems: 'center' }}>
            <div style={{ maxWidth: '60%' }}>
              <p style={{ color: '#ff9d4d', fontWeight: 600, letterSpacing: '2px', marginBottom: '8px', textTransform: 'uppercase', fontSize: '0.9rem' }}>
                ยินดีต้อนรับคุณ {user.name?.split(' ')[0]} สู่
              </p>
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'rgba(255,255,255,0.8)', marginBottom: '8px' }}>ฟีเจอร์เด่นของเรา</h3>
              
              {/* 1. วิเคราะห์ศักยภาพ */}
              <div className="hover-lift" style={{...(activeToggles.f1 ? activeCard : glassCard)}}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <i className="fa-solid fa-brain" style={{ fontSize: '1.5rem', opacity: activeToggles.f1 ? 1 : 0.6 }} />
                  <Toggle active={activeToggles.f1} onChange={() => setActiveToggles(p => ({...p, f1: !p.f1}))} />
                </div>
                <h4 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '4px' }}>Potential Assessment</h4>
                <p style={{ fontSize: '0.85rem', opacity: 0.8 }}>วิเคราะห์ศักยภาพ</p>

                <div style={{
                  maxHeight: activeToggles.f1 ? '160px' : '0px', overflow: 'hidden', transition: 'max-height 0.4s ease-out, opacity 0.3s ease-out',
                  opacity: activeToggles.f1 ? 1 : 0, marginTop: activeToggles.f1 ? '16px' : '0', paddingTop: activeToggles.f1 ? '16px' : '0',
                  borderTop: activeToggles.f1 ? '1px solid rgba(255,255,255,0.2)' : 'none'
                }}>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.85rem', lineHeight: 1.8, opacity: 0.9 }}>
                    <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '6px' }}>
                      <i className="fa-solid fa-chart-pie" style={{ color: '#ffb347', marginTop: '4px' }}></i>
                      <span>ประเมินทักษะและความถนัดของคุณอย่างแม่นยำ</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '6px' }}>
                      <i className="fa-solid fa-bullseye" style={{ color: '#ffb347', marginTop: '4px' }}></i>
                      <span>ค้นหาจุดแข็งที่ซ่อนอยู่เพื่อสร้างข้อได้เปรียบ</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <i className="fa-solid fa-handshake" style={{ color: '#ffb347', marginTop: '4px' }}></i>
                      <span>จับคู่กับสายงานที่เหมาะสมกับคุณที่สุด</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* 2. AI Chatbot */}
              <div className="hover-lift" style={{...(activeToggles.f2 ? activeCard : glassCard)}}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <i className="fa-solid fa-robot" style={{ fontSize: '1.5rem', opacity: activeToggles.f2 ? 1 : 0.6 }} />
                  <Toggle active={activeToggles.f2} onChange={() => setActiveToggles(p => ({...p, f2: !p.f2}))} />
                </div>
                <h4 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '4px' }}>AI Chatbot</h4>
                <p style={{ fontSize: '0.85rem', opacity: 0.8 }}>แชทบอทที่ปรึกษาอาชีพ</p>

                <div style={{
                  maxHeight: activeToggles.f2 ? '160px' : '0px', overflow: 'hidden', transition: 'max-height 0.4s ease-out, opacity 0.3s ease-out',
                  opacity: activeToggles.f2 ? 1 : 0, marginTop: activeToggles.f2 ? '16px' : '0', paddingTop: activeToggles.f2 ? '16px' : '0',
                  borderTop: activeToggles.f2 ? '1px solid rgba(255,255,255,0.2)' : 'none'
                }}>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.85rem', lineHeight: 1.8, opacity: 0.9 }}>
                    <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '6px' }}>
                      <i className="fa-solid fa-comments" style={{ color: '#ffb347', marginTop: '4px' }}></i>
                      <span>ปรึกษาและไขข้อข้องใจเรื่องสายอาชีพได้ 24 ชั่วโมง</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '6px' }}>
                      <i className="fa-solid fa-user-astronaut" style={{ color: '#ffb347', marginTop: '4px' }}></i>
                      <span>รับคำแนะนำที่ปรับแต่งตามโปรไฟล์ของคุณ</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <i className="fa-solid fa-lightbulb" style={{ color: '#ffb347', marginTop: '4px' }}></i>
                      <span>แลกเปลี่ยนแนวคิดและวางแผนอนาคตกับ AI</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* 3. จำลองการสัมภาษณ์ */}
              <div className="hover-lift" style={{...(activeToggles.f3 ? activeCard : glassCard)}}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <i className="fa-solid fa-microphone" style={{ fontSize: '1.5rem', opacity: activeToggles.f3 ? 1 : 0.6 }} />
                  <Toggle active={activeToggles.f3} onChange={() => setActiveToggles(p => ({...p, f3: !p.f3}))} />
                </div>
                <h4 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '4px' }}>Mock Interview</h4>
                <p style={{ fontSize: '0.85rem', opacity: 0.8 }}>จำลองการสัมภาษณ์</p>

                <div style={{
                  maxHeight: activeToggles.f3 ? '160px' : '0px', overflow: 'hidden', transition: 'max-height 0.4s ease-out, opacity 0.3s ease-out',
                  opacity: activeToggles.f3 ? 1 : 0, marginTop: activeToggles.f3 ? '16px' : '0', paddingTop: activeToggles.f3 ? '16px' : '0',
                  borderTop: activeToggles.f3 ? '1px solid rgba(255,255,255,0.2)' : 'none'
                }}>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.85rem', lineHeight: 1.8, opacity: 0.9 }}>
                    <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '6px' }}>
                      <i className="fa-solid fa-user-tie" style={{ color: '#ffb347', marginTop: '4px' }}></i>
                      <span>ฝึกซ้อมตอบคำถามสัมภาษณ์งานกับ AI แบบเรียลไทม์</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '6px' }}>
                      <i className="fa-solid fa-clipboard-check" style={{ color: '#ffb347', marginTop: '4px' }}></i>
                      <span>รับ Feedback เพื่อปรับปรุงจุดอ่อนและเสริมความมั่นใจ</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <i className="fa-solid fa-building" style={{ color: '#ffb347', marginTop: '4px' }}></i>
                      <span>จำลองสถานการณ์จริงจากบริษัทยอดฮิต</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* 4. ทดลองงานในฝัน */}
              <div className="hover-lift" style={{...(activeToggles.f4 ? activeCard : glassCard)}}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <i className="fa-solid fa-briefcase" style={{ fontSize: '1.5rem', opacity: activeToggles.f4 ? 1 : 0.6 }} />
                  <Toggle active={activeToggles.f4} onChange={() => setActiveToggles(p => ({...p, f4: !p.f4}))} />
                </div>
                <h4 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '4px' }}>Dream Job Simulation</h4>
                <p style={{ fontSize: '0.85rem', opacity: 0.8 }}>ทดลองงานในฝัน</p>

                <div style={{
                  maxHeight: activeToggles.f4 ? '160px' : '0px', overflow: 'hidden', transition: 'max-height 0.4s ease-out, opacity 0.3s ease-out',
                  opacity: activeToggles.f4 ? 1 : 0, marginTop: activeToggles.f4 ? '16px' : '0', paddingTop: activeToggles.f4 ? '16px' : '0',
                  borderTop: activeToggles.f4 ? '1px solid rgba(255,255,255,0.2)' : 'none'
                }}>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.85rem', lineHeight: 1.8, opacity: 0.9 }}>
                    <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '6px' }}>
                      <i className="fa-solid fa-vr-cardboard" style={{ color: '#ffb347', marginTop: '4px' }}></i>
                      <span>สัมผัสประสบการณ์จำลองการทำงานจริงในสายอาชีพต่างๆ</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '6px' }}>
                      <i className="fa-solid fa-list-check" style={{ color: '#ffb347', marginTop: '4px' }}></i>
                      <span>ทำภารกิจและแก้ไขปัญหาที่มักพบในสายงานนั้น</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <i className="fa-solid fa-star" style={{ color: '#ffb347', marginTop: '4px' }}></i>
                      <span>ประเมินความชอบและความถนัดก่อนตัดสินใจจริง</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Column 2: Satisfaction Dial & Quick Stats */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'rgba(255,255,255,0.8)', marginBottom: '8px' }}>ภาพรวมสถิติระบบ</h3>
              
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
                    <circle cx="120" cy="120" r="100" fill="none" stroke="url(#orangeGrad)" strokeWidth="16" strokeDasharray="471" strokeDashoffset={471 - (471 * 0.96)} strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 8px rgba(255,107,0,0.5))' }} />
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
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                      <span style={{ color: 'rgba(255,255,255,0.7)' }}>ความแม่นยำของการวิเคราะห์ (AI)</span>
                      <span style={{ color: '#ffb347', fontWeight: 600 }}>92%</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: '92%', height: '100%', background: 'linear-gradient(90deg, #ff4b00, #ffb347)' }} />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                      <span style={{ color: 'rgba(255,255,255,0.7)' }}>ประสบการณ์ใช้งานแพลตฟอร์ม</span>
                      <span style={{ color: '#ffb347', fontWeight: 600 }}>95%</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: '95%', height: '100%', background: 'linear-gradient(90deg, #ff4b00, #ffb347)' }} />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                      <span style={{ color: 'rgba(255,255,255,0.7)' }}>แนะนำให้เพื่อนใช้งานต่อ</span>
                      <span style={{ color: '#ffb347', fontWeight: 600 }}>98%</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: '98%', height: '100%', background: 'linear-gradient(90deg, #ff4b00, #ffb347)' }} />
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Column 3: Monthly Usage Chart */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'rgba(255,255,255,0.8)', marginBottom: '8px' }}>กราฟสถิติรายเดือน</h3>
              <div 
                className="hover-lift"
                style={glassCard}
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

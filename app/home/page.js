'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import useAuth from '@/lib/useAuth';
import GlassNav from '@/components/GlassNav';

const SHEET_WEBAPP_URL = 'https://script.google.com/macros/s/AKfycby8Is6dQueTovRqsEbn90Yn-pYMBvXH3dNqDNwvodSMK7G0sRc-jTQm46y6c3vm6ij6/exec';

export default function HomePage() {
  const { user, loading } = useAuth();
  const [stats, setStats] = useState({ users: '...', assess: '...', satisfaction: '...' });
  const [activeToggles, setActiveToggles] = useState({ ai: true, data: true, roadmap: false });

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
      }
    } catch {
      setStats({ users: 'Err', assess: 'Err', satisfaction: '0' });
    }
  }

  // Common glass card styles
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
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
  };

  const activeCard = {
    ...glassCard,
    background: 'linear-gradient(135deg, #ff7a00 0%, #ff4b00 100%)',
    border: '1px solid #ff9d4d',
    boxShadow: '0 8px 32px rgba(255, 122, 0, 0.4), inset 0 2px 4px rgba(255,255,255,0.4)',
    color: '#fff',
  };

  // Toggle Switch Component
  const Toggle = ({ active, onChange }) => (
    <div 
      onClick={onChange}
      style={{
        width: '44px', height: '24px', borderRadius: '12px',
        background: active ? '#fff' : 'rgba(255,255,255,0.3)',
        padding: '2px', cursor: 'pointer', transition: 'all 0.3s',
        display: 'flex', alignItems: 'center',
        justifyContent: active ? 'flex-end' : 'flex-start',
      }}
    >
      <div style={{
        width: '20px', height: '20px', borderRadius: '50%',
        background: active ? '#ff6b00' : '#fff',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
      }} />
    </div>
  );

  if (loading) return null;

  return (
    <div style={{ minHeight: '100vh', background: '#120c0a', color: '#fff', fontFamily: "'Inter', 'Kanit', sans-serif" }}>
      <GlassNav />

      {/* Warm Glowing Background */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '800px', height: '800px', background: 'radial-gradient(circle, rgba(255,107,0,0.4) 0%, transparent 60%)', filter: 'blur(80px)' }} />
        <div style={{ position: 'absolute', bottom: '-20%', left: '-10%', width: '1000px', height: '1000px', background: 'radial-gradient(circle, rgba(255,60,0,0.3) 0%, transparent 60%)', filter: 'blur(100px)' }} />
        <div style={{ position: 'absolute', top: '30%', left: '40%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(255,200,100,0.15) 0%, transparent 60%)', filter: 'blur(60px)' }} />
      </div>

      <main style={{ position: 'relative', zIndex: 10, padding: '100px 24px 60px', display: 'flex', justifyContent: 'center' }}>
        
        {/* Main Glass Panel */}
        <div style={{ ...glassPanel, width: '100%', maxWidth: '1280px', padding: '40px', display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }}>
          
          {/* Header Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 600, letterSpacing: '-0.02em', marginBottom: '8px' }}>
                Welcome, {user.name?.split(' ')[0] || 'User'}
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.1rem' }}>FUTUREPATH AI Workspace</p>
            </div>
            
            {/* Top segmented nav */}
            <div style={{ display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.2)', padding: '6px', borderRadius: '40px', border: '1px solid rgba(255,255,255,0.1)' }}>
              {['Home', 'Assessment', 'Chatbot', 'Simulation'].map((item, i) => (
                <Link key={item} href={`/${item.toLowerCase()}`} style={{
                  padding: '8px 24px', borderRadius: '30px', textDecoration: 'none',
                  color: i === 0 ? '#fff' : 'rgba(255,255,255,0.6)',
                  background: i === 0 ? 'rgba(255,255,255,0.15)' : 'transparent',
                  fontSize: '0.9rem', fontWeight: 500, transition: 'all 0.3s'
                }}>
                  {i === 0 && <span style={{ display: 'inline-block', width: '6px', height: '6px', background: '#00f2fe', borderRadius: '50%', marginRight: '8px', boxShadow: '0 0 8px #00f2fe' }} />}
                  {item}
                </Link>
              ))}
            </div>
          </div>

          {/* Bento Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
          }}>
            
            {/* Left Column (Stats & Toggles) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Date & Assess Card */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ ...glassCard, padding: '20px' }}>
                  <h3 style={{ fontSize: '2.2rem', fontWeight: 700, lineHeight: 1 }}>{stats.assess}</h3>
                  <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', marginTop: '4px' }}>Assessments Done</p>
                </div>
                <div style={{ ...glassCard, padding: '20px' }}>
                  <h3 style={{ fontSize: '2.2rem', fontWeight: 700, lineHeight: 1 }}>{stats.users}</h3>
                  <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', marginTop: '4px' }}>Total Users</p>
                </div>
              </div>

              {/* Toggles Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={activeToggles.data ? activeCard : glassCard}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                    <div style={{ background: activeToggles.data ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)', padding: '8px', borderRadius: '12px' }}>
                      <i className="fa-solid fa-chart-pie" />
                    </div>
                    <Toggle active={activeToggles.data} onChange={() => setActiveToggles(p => ({...p, data: !p.data}))} />
                  </div>
                  <div>
                    <h4 style={{ fontWeight: 600, fontSize: '1.1rem' }}>Data-Driven</h4>
                    <p style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '4px' }}>Insights active</p>
                  </div>
                </div>

                <div style={activeToggles.ai ? activeCard : glassCard}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                    <div style={{ background: activeToggles.ai ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)', padding: '8px', borderRadius: '12px' }}>
                      <i className="fa-solid fa-robot" />
                    </div>
                    <Toggle active={activeToggles.ai} onChange={() => setActiveToggles(p => ({...p, ai: !p.ai}))} />
                  </div>
                  <div>
                    <h4 style={{ fontWeight: 600, fontSize: '1.1rem' }}>AI Chatbot</h4>
                    <p style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '4px' }}>Assistant ON</p>
                  </div>
                </div>

                <div style={glassCard}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.1)', padding: '8px', borderRadius: '12px' }}>
                      <i className="fa-solid fa-map" />
                    </div>
                    <Toggle active={activeToggles.roadmap} onChange={() => setActiveToggles(p => ({...p, roadmap: !p.roadmap}))} />
                  </div>
                  <div>
                    <h4 style={{ fontWeight: 600, fontSize: '1.1rem' }}>Roadmap</h4>
                    <p style={{ fontSize: '0.75rem', opacity: 0.6, marginTop: '4px' }}>Off</p>
                  </div>
                </div>

                <div style={{ ...glassCard, display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer' }} onClick={() => window.location.href='/assessment'}>
                   <i className="fa-solid fa-plus" style={{ fontSize: '2rem', opacity: 0.5 }} />
                </div>
              </div>

            </div>

            {/* Middle Column (Satisfaction Dial) */}
            <div style={{ ...glassCard, flex: 2, minWidth: '320px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 500 }}>System Satisfaction</h3>
                <Toggle active={true} onChange={()=>{}} />
              </div>

              {/* Dial Control */}
              <div style={{ position: 'relative', width: '240px', height: '240px', margin: '0 auto' }}>
                <svg width="240" height="240" viewBox="0 0 240 240" style={{ transform: 'rotate(-135deg)' }}>
                  {/* Background Track */}
                  <circle cx="120" cy="120" r="100" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="12" strokeDasharray="471" strokeDashoffset="0" strokeLinecap="round" />
                  {/* Active Track (Orange) */}
                  <circle cx="120" cy="120" r="100" fill="none" stroke="url(#orangeGrad)" strokeWidth="12" strokeDasharray="471" strokeDashoffset={471 - (471 * 0.75)} strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 8px rgba(255,107,0,0.5))' }} />
                  <defs>
                    <linearGradient id="orangeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ffb347" />
                      <stop offset="100%" stopColor="#ff6b00" />
                    </linearGradient>
                  </defs>
                </svg>
                
                {/* Center Knob */}
                <div style={{
                  position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                  width: '140px', height: '140px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)',
                  boxShadow: '0 16px 32px rgba(0,0,0,0.3), inset 0 -4px 8px rgba(0,0,0,0.1)',
                  display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                  color: '#333'
                }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, opacity: 0.6, letterSpacing: '0.05em' }}>AVG SCORE</span>
                  <span style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1 }}>{stats.satisfaction}</span>
                </div>
              </div>
              
              {/* Scale Labels */}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 40px', marginTop: '-20px', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
                <span>0</span>
                <span>5.0</span>
              </div>

              {/* Bottom Buttons */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '40px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><i className="fa-solid fa-minus" /></div>
                <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><i className="fa-solid fa-plus" /></div>
              </div>
            </div>

            {/* Right Column (Music / Simulator player) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* "Player" Card */}
              <div style={{ ...glassCard, background: 'rgba(40,20,10,0.4)', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                  <img src="/img/vdobg2.jpg" style={{ width: '80px', height: '80px', borderRadius: '16px', objectFit: 'cover', boxShadow: '0 8px 16px rgba(0,0,0,0.3)' }} onError={(e) => e.target.style.display='none'} />
                  <i className="fa-solid fa-microphone-lines" style={{ color: '#ff6b00', fontSize: '1.2rem' }} />
                </div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 600 }}>HR Simulator</h4>
                <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', marginBottom: '24px' }}>Voice Interview Practice</p>
                
                {/* Progress */}
                <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', position: 'relative', marginBottom: '12px' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: '30%', background: '#ff6b00', borderRadius: '2px' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', marginBottom: '24px' }}>
                  <span>02:14</span>
                  <span>10:00</span>
                </div>

                {/* Controls */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', alignItems: 'center' }}>
                  <i className="fa-solid fa-backward-step" style={{ fontSize: '1.2rem', cursor: 'pointer', opacity: 0.8 }} />
                  <Link href="/interview" style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#fff', color: '#ff6b00', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', cursor: 'pointer', boxShadow: '0 8px 24px rgba(255,107,0,0.3)', textDecoration: 'none' }}>
                    <i className="fa-solid fa-play" style={{ marginLeft: '4px' }} />
                  </Link>
                  <i className="fa-solid fa-forward-step" style={{ fontSize: '1.2rem', cursor: 'pointer', opacity: 0.8 }} />
                </div>
              </div>

              {/* Assessment Light Card */}
              <div style={{ ...glassCard, flex: 1, padding: '32px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 500 }}>Potential Core</h3>
                  <Toggle active={true} onChange={()=>{}} />
                </div>
                
                {/* Lamp / Beam Graphic */}
                <div style={{ position: 'relative', height: '160px', display: 'flex', justifyContent: 'center' }}>
                  <div style={{ position: 'absolute', top: 0, width: '120px', height: '20px', background: '#222', borderRadius: '4px', zIndex: 2 }} />
                  <div style={{ position: 'absolute', top: '20px', width: '200px', height: '140px', background: 'linear-gradient(to bottom, rgba(255,255,255,0.4) 0%, transparent 100%)', clipPath: 'polygon(30% 0, 70% 0, 100% 100%, 0% 100%)', filter: 'blur(8px)' }} />
                  
                  <div style={{ position: 'absolute', bottom: '10px', textAlign: 'center' }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: 800, textShadow: '0 0 16px rgba(255,255,255,0.8)' }}>94%</div>
                    <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)' }}>Match Found</div>
                  </div>
                </div>

                {/* Color dots */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: 'auto' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#fff' }} />
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#00f2fe' }} />
                  <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#ffb347', border: '2px solid #fff', boxShadow: '0 0 8px #ffb347' }} />
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ff0080' }} />
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#9b59b6' }} />
                </div>
              </div>

            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

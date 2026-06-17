'use client';
import { useState } from 'react';
import GlassNav from '@/components/GlassNav';
import useAuth from '@/lib/useAuth';

export default function SimulationPage() {
  const { user, loading } = useAuth();
  const [step,        setStep]        = useState(1);
  const [jobTitle,    setJobTitle]    = useState('');
  const [currentTask, setCurrentTask] = useState('');
  const [userWork,    setUserWork]    = useState('');
  const [evaluation,  setEvaluation]  = useState(null);
  const [loadingTask, setLoadingTask] = useState(false);
  const [loadingEval, setLoadingEval] = useState(false);

  async function getTask() {
    if (!jobTitle.trim()) { alert('โปรดระบุตำแหน่งงานก่อนครับ'); return; }
    setLoadingTask(true);
    try {
      const res  = await fetch('/api/proxy', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'get_task', jobTitle }) });
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        setCurrentTask(data.candidates[0].content.parts[0].text);
        setStep(2);
      } else { alert('ระบบขัดข้อง โปรดลองใหม่'); }
    } catch { alert('เชื่อมต่อ AI ล้มเหลว'); }
    setLoadingTask(false);
  }

  async function submitWork() {
    if (!userWork.trim()) { alert('โปรดพิมพ์ผลงานก่อนส่งครับ'); return; }
    setLoadingEval(true);
    try {
      const res  = await fetch('/api/proxy', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'evaluate_work', jobTitle, task: currentTask, userWork }) });
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        let txt = data.candidates[0].content.parts[0].text.replace(/```json/g,'').replace(/```/g,'').trim();
        setEvaluation(JSON.parse(txt));
        setStep(3);
      } else { alert('ระบบขัดข้อง'); }
    } catch { alert('เกิดข้อผิดพลาดในการแปลผล AI'); }
    setLoadingEval(false);
  }

  const formatTask = (t) => t.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>');

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Kanit,sans-serif', color: 'var(--text-sub)' }}>
      <i className="fas fa-spinner fa-spin mr-3" style={{ color: 'var(--accent-color)' }} /> กำลังโหลด...
    </div>
  );

  const stepLabels = ['เลือกตำแหน่งงาน', 'ทำโจทย์', 'ดูผลลัพธ์'];

  return (
    <div style={{ minHeight: '100vh', paddingTop: '64px' }}>
      {/* Video BG */}
      <div className="fixed inset-0" style={{ zIndex: -1 }}>
        <video autoPlay muted loop playsInline
          style={{ position: 'absolute', top: '50%', left: '50%', minWidth: '100%', minHeight: '100%', transform: 'translate(-50%,-50%)', objectFit: 'cover', filter: 'brightness(0.28) blur(2px)' }}
        >
          <source src="/vdo/vdobg.mp4" type="video/mp4" />
        </video>
      </div>
      <GlassNav />

      <div
        className="no-print"
        style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          padding: '24px 20px 48px',
          minHeight: 'calc(100vh - 64px)',
          position: 'relative', zIndex: 10,
        }}
      >
        {/* Title */}
        <header style={{ textAlign: 'center', marginBottom: '20px' }}>
          <p className="section-eyebrow" style={{ marginBottom: '8px' }}>Work Simulation</p>
          <h1
            style={{
              fontSize: 'clamp(2rem, 5vw, 3.2rem)',
              fontWeight: 900,
              letterSpacing: '0.08em',
              background: 'linear-gradient(to right, var(--accent-color), var(--secondary-color))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Workspace
          </h1>
          <p style={{ color: 'var(--text-sub)', fontWeight: 400, marginTop: '6px', fontSize: '0.97rem' }}>
            ทดลองทำงานจริงในสายงานที่คุณใฝ่ฝัน
          </p>
        </header>

        {/* User Card */}
        <div
          style={{
            width: '100%', maxWidth: '800px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '12px 20px', borderRadius: 'var(--r-pill)', marginBottom: '20px',
            background: 'var(--card-bg)', backdropFilter: 'blur(16px)',
            border: '1px solid var(--card-border)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px', height: '40px', borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--accent-color), #ff4b00)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 900, fontSize: '1rem', color: 'var(--body-bg-start)',
                boxShadow: '0 0 12px var(--accent-glow)', flexShrink: 0,
              }}
            >
              {user.name?.charAt(0)}
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', letterSpacing: '0.06em' }}>ผู้ทดลองงาน</span>
              <span style={{ fontWeight: 700, color: 'var(--accent-color)', fontSize: '0.97rem' }}>{user.name}</span>
            </div>
          </div>
          <button
            onClick={() => { if (confirm('ออกจากระบบ?')) { localStorage.clear(); window.location.href = '/'; } }}
            style={{
              padding: '7px 18px', borderRadius: 'var(--r-pill)',
              background: 'transparent', border: '1px solid var(--secondary-color)',
              color: 'var(--secondary-color)', cursor: 'pointer',
              fontFamily: 'Kanit,sans-serif', fontWeight: 600, fontSize: '0.85rem',
              display: 'flex', alignItems: 'center', gap: '6px',
            }}
          >
            <i className="fa-solid fa-right-from-bracket" /> ออกจากระบบ
          </button>
        </div>

        {/* Step Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0', marginBottom: '24px', width: '100%', maxWidth: '480px' }}>
          {stepLabels.map((label, i) => {
            const idx     = i + 1;
            const active  = idx === step;
            const done    = idx < step;
            return (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <div
                    style={{
                      width: '34px', height: '34px', borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 800, fontSize: '0.85rem',
                      background: done ? 'var(--accent-color)' : active ? 'var(--accent-dim)' : 'rgba(255,255,255,0.06)',
                      border: active ? '2px solid var(--accent-color)' : done ? '2px solid var(--accent-color)' : '1px solid rgba(255,255,255,0.15)',
                      color: done ? '#0c0a22' : active ? 'var(--accent-color)' : 'var(--text-muted)',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {done ? <i className="fa-solid fa-check" style={{ fontSize: '0.75rem' }} /> : idx}
                  </div>
                  <span style={{ fontSize: '0.7rem', color: active ? 'var(--accent-color)' : 'var(--text-muted)', fontWeight: active ? 700 : 400, whiteSpace: 'nowrap' }}>
                    {label}
                  </span>
                </div>
                {i < stepLabels.length - 1 && (
                  <div style={{ flex: 1, height: '1px', background: done ? 'var(--accent-color)' : 'rgba(255,255,255,0.12)', margin: '0 8px', marginBottom: '24px', transition: 'background 0.3s' }} />
                )}
              </div>
            );
          })}
        </div>

        {/* Main Card */}
        <div
          style={{
            width: '100%', maxWidth: '800px',
            background: 'var(--card-bg)',
            backdropFilter: 'blur(22px)',
            border: '1px solid var(--card-border)',
            borderRadius: 'var(--r-xl)',
            padding: '36px',
            boxShadow: '0 24px 60px var(--shadow-color)',
          }}
        >
          {/* ── Step 1 ── */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <p className="section-eyebrow" style={{ marginBottom: '10px' }}>ขั้นตอนที่ 1</p>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '6px' }}>
                  เลือกตำแหน่งงานที่อยากทดลอง
                </h2>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                  ระบุตำแหน่งงานที่คุณสนใจ แล้ว AI จะสร้างโจทย์จำลองจาก Senior Director
                </p>
              </div>
              <input
                className="fp-input"
                type="text"
                value={jobTitle}
                onChange={e => setJobTitle(e.target.value)}
                placeholder="เช่น นักการตลาด, โปรแกรมเมอร์, กราฟิกดีไซเนอร์..."
                onKeyDown={e => e.key === 'Enter' && getTask()}
              />
              <button
                onClick={getTask}
                disabled={loadingTask}
                className="btn-primary"
                style={{ alignSelf: 'flex-start', fontSize: '1rem' }}
              >
                {loadingTask
                  ? <><i className="fas fa-spinner fa-spin" /> กำลังรอโจทย์จากผู้บริหาร...</>
                  : <><i className="fa-solid fa-briefcase" /> ขอโจทย์ทดลองงาน</>
                }
              </button>
            </div>
          )}

          {/* ── Step 2 ── */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <p className="section-eyebrow" style={{ marginBottom: '10px' }}>ขั้นตอนที่ 2</p>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '6px' }}>
                  โจทย์จาก Senior Director
                </h2>
              </div>
              <div
                style={{
                  padding: '20px 22px',
                  borderRadius: 'var(--r-md)',
                  background: 'var(--card-bg)',
                  borderLeft: '3px solid var(--accent-color)',
                  border: '1px solid var(--card-border)',
                }}
              >
                <p style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--secondary-color)', marginBottom: '10px', letterSpacing: '0.05em' }}>
                  <i className="fa-solid fa-user-tie mr-2" />ข้อความจาก Senior Director:
                </p>
                <p
                  style={{ fontSize: '0.95rem', color: 'var(--text-main)', lineHeight: 1.75, fontWeight: 400 }}
                  dangerouslySetInnerHTML={{ __html: formatTask(currentTask) }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-color)', letterSpacing: '0.04em' }}>
                  <i className="fa-solid fa-pen-nib mr-2" />ลงมือทำผลงานหรือพิมพ์วิธีแก้ปัญหาของคุณที่นี่
                </label>
                <textarea
                  className="fp-input"
                  value={userWork}
                  onChange={e => setUserWork(e.target.value)}
                  placeholder="พิมพ์ผลงานหรือวิธีแก้ปัญหาของคุณ..."
                  style={{ resize: 'vertical', minHeight: '160px' }}
                />
              </div>
              <button
                onClick={submitWork}
                disabled={loadingEval}
                className="btn-primary"
                style={{ alignSelf: 'flex-start', fontSize: '1rem' }}
              >
                {loadingEval
                  ? <><i className="fas fa-spinner fa-spin" /> กำลังประเมินคะแนน...</>
                  : <><i className="fa-solid fa-paper-plane" /> ส่งผลงานให้ Senior Director ตรวจ</>
                }
              </button>
            </div>
          )}

          {/* ── Step 3 ── */}
          {step === 3 && evaluation && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
                <button 
                  onClick={() => window.print()}
                  className="btn-primary hover-glow-btn"
                  style={{ padding: '10px 20px', fontSize: '0.85rem' }}
                >
                  <i className="fa-solid fa-file-pdf mr-2" /> ดาวน์โหลดผลงาน (Portfolio)
                </button>
              </div>

              {/* ─── HERO SCORE BANNER ─── */}
              <div style={{
                borderRadius: 'var(--r-lg)',
                background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 40%, #0c1445 100%)',
                border: '1px solid rgba(99,102,241,0.35)',
                boxShadow: '0 0 60px rgba(99,102,241,0.15), 0 24px 48px rgba(0,0,0,0.4)',
                overflow: 'hidden',
                position: 'relative',
              }}>
                {/* decorative circles */}
                <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '220px', height: '220px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)' }} />
                <div style={{ position: 'absolute', bottom: '-40px', left: '-40px', width: '180px', height: '180px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(14,165,233,0.15) 0%, transparent 70%)' }} />

                <div style={{ position: 'relative', zIndex: 1, padding: '28px 28px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
                  {/* Left: title + metadata */}
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'rgba(148,163,184,0.7)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '6px' }}>
                      Work Simulation · FUTUREPATH AI
                    </div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#f1f5f9', margin: '0 0 4px', letterSpacing: '0.04em' }}>
                      PERFORMANCE REPORT
                    </h2>
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '10px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#94a3b8' }}>
                        <i className="fa-solid fa-user" style={{ color: '#a78bfa' }} /> {user?.name}
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#94a3b8' }}>
                        <i className="fa-solid fa-briefcase" style={{ color: '#38bdf8' }} /> {jobTitle}
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#94a3b8' }}>
                        <i className="fa-solid fa-calendar" style={{ color: '#4ade80' }} /> {new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  {/* Right: Big Score */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    {/* Score ring */}
                    <div style={{
                      width: '130px', height: '130px', borderRadius: '50%',
                      background: `conic-gradient(
                        ${evaluation.score >= 80 ? '#4ade80' : evaluation.score >= 60 ? '#facc15' : '#f87171'} ${evaluation.score * 3.6}deg,
                        rgba(255,255,255,0.06) 0deg
                      )`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: `0 0 32px ${evaluation.score >= 80 ? 'rgba(74,222,128,0.35)' : evaluation.score >= 60 ? 'rgba(250,204,21,0.35)' : 'rgba(248,113,113,0.35)'}`,
                    }}>
                      <div style={{
                        width: '106px', height: '106px', borderRadius: '50%',
                        background: '#0f172a',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <span style={{
                          fontSize: '2.6rem', fontWeight: 900, lineHeight: 1,
                          color: evaluation.score >= 80 ? '#4ade80' : evaluation.score >= 60 ? '#facc15' : '#f87171',
                        }}>
                          {evaluation.score}
                        </span>
                        <span style={{ fontSize: '0.65rem', color: '#64748b', letterSpacing: '0.1em' }}>/ 100</span>
                      </div>
                    </div>
                    {/* Grade Badge */}
                    <div style={{
                      padding: '4px 18px', borderRadius: '20px', fontWeight: 800, fontSize: '0.85rem', letterSpacing: '0.08em',
                      background: evaluation.score >= 80 ? 'rgba(74,222,128,0.15)' : evaluation.score >= 60 ? 'rgba(250,204,21,0.15)' : 'rgba(248,113,113,0.15)',
                      color: evaluation.score >= 80 ? '#4ade80' : evaluation.score >= 60 ? '#facc15' : '#f87171',
                      border: `1px solid ${evaluation.score >= 80 ? 'rgba(74,222,128,0.3)' : evaluation.score >= 60 ? 'rgba(250,204,21,0.3)' : 'rgba(248,113,113,0.3)'}`,
                    }}>
                      {evaluation.score >= 90 ? '🏆 Excellent' : evaluation.score >= 80 ? '⭐ Good' : evaluation.score >= 60 ? '📈 Average' : '🔧 Need Improvement'}
                    </div>
                  </div>
                </div>
              </div>

              {/* ─── โจทย์ + คำตอบของผู้ใช้ ─── */}
              <div style={{ textAlign: 'left', background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: 'var(--r-md)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <h4 style={{ fontSize: '0.85rem', color: 'var(--accent-color)', marginBottom: '8px', fontWeight: 700 }}>
                  <i className="fa-solid fa-briefcase mr-2" />โจทย์ที่ได้รับ:
                </h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-sub)', marginBottom: '16px', lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: formatTask(currentTask) }} />

                <h4 style={{ fontSize: '0.85rem', color: 'var(--secondary-color)', marginBottom: '8px', fontWeight: 700 }}>
                  <i className="fa-solid fa-pen-nib mr-2" />คำตอบ/วิธีแก้ปัญหาของคุณ:
                </h4>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-main)', lineHeight: 1.6, whiteSpace: 'pre-wrap', background: 'rgba(0,0,0,0.2)', padding: '12px 16px', borderRadius: '8px', borderLeft: '3px solid var(--secondary-color)' }}>
                  {userWork}
                </p>
              </div>


              <div
                style={{
                  padding: '24px 28px', borderRadius: 'var(--r-lg)',
                  background: 'linear-gradient(145deg, var(--card-bg), rgba(255,255,255,0.02))', 
                  border: '1px solid var(--card-border)',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
                }}
              >
                <h3 style={{ fontWeight: 800, marginBottom: '14px', color: 'var(--accent-color)', fontSize: '1.1rem', letterSpacing: '0.02em' }}>
                  <i className="fa-solid fa-bolt mr-2" /> Executive Summary
                </h3>
                <p style={{ fontSize: '1.05rem', lineHeight: 1.6, color: 'var(--text-main)', fontWeight: 600, marginBottom: '20px' }}>
                  {evaluation.executive_summary || evaluation.feedback}
                </p>

                {evaluation.detailed_analysis && (
                  <>
                    <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '20px 0' }} />
                    <h4 style={{ fontWeight: 700, marginBottom: '10px', color: 'var(--secondary-color)', fontSize: '0.95rem' }}>
                      <i className="fa-solid fa-microscope mr-2" /> บทวิเคราะห์เชิงลึก (Detailed Analysis)
                    </h4>
                    <p style={{ fontSize: '0.93rem', lineHeight: 1.8, color: 'var(--text-sub)', fontWeight: 400 }}>
                      {evaluation.detailed_analysis}
                    </p>
                  </>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
                <div style={{ padding: '20px', borderRadius: 'var(--r-md)', borderTop: '3px solid #00f2fe', background: 'rgba(0,242,254,0.04)', border: '1px solid rgba(0,242,254,0.1)' }}>
                  <h4 style={{ fontWeight: 800, marginBottom: '16px', color: '#00f2fe', fontSize: '0.95rem' }}>
                    <i className="fa-solid fa-medal mr-2" /> สิ่งที่คุณทำได้ยอดเยี่ยม
                  </h4>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {evaluation.strengths?.map((s, i) => (
                      <li key={i} style={{ fontSize: '0.88rem', color: 'var(--text-sub)', paddingLeft: '20px', position: 'relative', lineHeight: 1.6 }}>
                        <span style={{ position: 'absolute', left: 0, color: '#00f2fe' }}><i className="fa-solid fa-check" /></span>{s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div style={{ padding: '20px', borderRadius: 'var(--r-md)', borderTop: '3px solid #ff0844', background: 'rgba(255,8,68,0.04)', border: '1px solid rgba(255,8,68,0.1)' }}>
                  <h4 style={{ fontWeight: 800, marginBottom: '16px', color: '#ff0844', fontSize: '0.95rem' }}>
                    <i className="fa-solid fa-arrow-trend-up mr-2" /> สิ่งที่ต้องอัปเกรดด่วน
                  </h4>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {evaluation.improvements?.map((s, i) => (
                      <li key={i} style={{ fontSize: '0.88rem', color: 'var(--text-sub)', paddingLeft: '20px', position: 'relative', lineHeight: 1.6 }}>
                        <span style={{ position: 'absolute', left: 0, color: '#ff0844' }}><i className="fa-solid fa-xmark" /></span>{s}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {evaluation.next_action && (
                <div style={{ padding: '20px 24px', borderRadius: 'var(--r-md)', background: 'linear-gradient(90deg, rgba(255,179,71,0.1), transparent)', borderLeft: '4px solid #ffb347' }}>
                  <h4 style={{ fontWeight: 800, marginBottom: '8px', color: '#ffb347', fontSize: '1rem' }}>
                    <i className="fa-solid fa-compass mr-2" /> Next Action (ก้าวต่อไปของคุณ)
                  </h4>
                  <p style={{ fontSize: '0.95rem', color: 'var(--text-main)', lineHeight: 1.6 }}>
                    {evaluation.next_action}
                  </p>
                </div>
              )}

              <button
                onClick={() => { setStep(1); setJobTitle(''); setCurrentTask(''); setUserWork(''); setEvaluation(null); }}
                className="btn-outline"
                style={{ alignSelf: 'center', marginTop: '8px' }}
              >
                <i className="fa-solid fa-rotate-right" /> ทดลองตำแหน่งอื่น
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── PRINT ONLY LAYOUT ── */}
      {step === 3 && evaluation && (
        <div className="print-only" style={{ width: '100%', padding: '0', background: '#fff', color: '#000', fontFamily: "'Kanit', sans-serif" }}>
          {/* Header */}
          <div style={{ borderBottom: '2px solid #ff7a00', paddingBottom: '16px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <h1 style={{ fontSize: '24px', fontWeight: 900, margin: 0, color: '#111827' }}>FUTUREPATH AI</h1>
                <p style={{ fontSize: '14px', color: '#ff7a00', fontWeight: 700, margin: 0 }}>รายงานผลการทดลองงาน (Work Simulation Report)</p>
              </div>
              <div style={{ textAlign: 'right', fontSize: '12px', color: '#4b5563' }}>
                <div style={{ fontWeight: 700, color: '#111827', fontSize: '14px' }}>ผู้ประเมิน: {user?.name || 'ไม่ระบุชื่อ'}</div>
                <div>อีเมล: {user?.email || 'ไม่ระบุ'} | วันที่ประเมิน: {new Date().toLocaleDateString('th-TH')}</div>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#ff7a00', marginBottom: '8px' }}>ตำแหน่งที่ทดลอง: {jobTitle}</h2>
          </div>

          {/* โจทย์และผลงาน */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
             <div style={{ padding: '16px', border: '1px solid #e5e7eb', borderRadius: '8px', background: '#f9fafb' }}>
               <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#374151', borderBottom: '1px solid #d1d5db', paddingBottom: '8px', marginBottom: '12px' }}>โจทย์จาก Senior Director</h3>
               <div style={{ fontSize: '12px', color: '#4b5563', lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: formatTask(currentTask) }} />
             </div>
             <div style={{ padding: '16px', border: '1px solid #e5e7eb', borderRadius: '8px', background: '#fff' }}>
               <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#374151', borderBottom: '1px solid #d1d5db', paddingBottom: '8px', marginBottom: '12px' }}>ผลงาน/วิธีแก้ปัญหาของคุณ</h3>
               <div style={{ fontSize: '12px', color: '#111827', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{userWork}</div>
             </div>
          </div>

          {/* ผลการประเมิน */}
          <div style={{ marginBottom: '24px' }}>
             <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', borderBottom: '1px solid #e5e7eb', paddingBottom: '8px', marginBottom: '16px' }}>ผลการประเมิน (Performance Report)</h3>
             <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                <div style={{ width: '100px', height: '100px', borderRadius: '50%', border: '4px solid #ff7a00', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: '32px', fontWeight: 900, color: '#ff7a00', lineHeight: 1 }}>{evaluation.score}</span>
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>/ 100</span>
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#374151', marginBottom: '4px' }}>ความคิดเห็นจากผู้บริหาร</h4>
                  <p style={{ fontSize: '13px', color: '#4b5563', lineHeight: 1.6 }}>{evaluation.feedback}</p>
                </div>
             </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#059669', marginBottom: '8px' }}>จุดเด่นที่ทำได้ดี</h4>
              <ul style={{ listStyleType: 'disc', paddingLeft: '20px', margin: 0 }}>
                {evaluation.strengths?.map((s, i) => (
                  <li key={i} style={{ fontSize: '12px', color: '#374151', marginBottom: '4px', lineHeight: 1.5 }}>{s}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#d97706', marginBottom: '8px' }}>ข้อเสนอแนะเพื่อพัฒนา</h4>
              <ul style={{ listStyleType: 'disc', paddingLeft: '20px', margin: 0 }}>
                {evaluation.improvements?.map((s, i) => (
                  <li key={i} style={{ fontSize: '12px', color: '#374151', marginBottom: '4px', lineHeight: 1.5 }}>{s}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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
    <div style={{ minHeight: '100vh', background: '#000', paddingTop: '64px' }}>
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
              background: 'linear-gradient(to right, #00f2fe, #fa709a)',
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
            background: 'rgba(20,18,42,0.55)', backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.12)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px', height: '40px', borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--accent-color), #00a8ff)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 900, fontSize: '1rem', color: '#0c0a22',
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
              background: 'transparent', border: '1px solid #fa709a',
              color: '#fa709a', cursor: 'pointer',
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
            background: 'rgba(8, 6, 22, 0.65)',
            backdropFilter: 'blur(22px)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 'var(--r-xl)',
            padding: '36px',
            boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
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
                  background: 'rgba(0,242,254,0.06)',
                  borderLeft: '3px solid var(--accent-color)',
                  border: '1px solid rgba(0,242,254,0.2)',
                }}
              >
                <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fa709a', marginBottom: '10px', letterSpacing: '0.05em' }}>
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
              <div style={{ textAlign: 'center' }}>
                <p className="section-eyebrow" style={{ marginBottom: '10px' }}>ผลการประเมิน</p>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '0.1em', color: 'var(--accent-color)', marginBottom: '20px' }}>
                  PERFORMANCE REPORT
                </h2>
                <div
                  style={{
                    width: '110px', height: '110px', borderRadius: '50%',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 10px',
                    border: '4px solid #fa709a',
                    boxShadow: '0 0 24px rgba(250,112,154,0.4)',
                    background: 'rgba(0,0,0,0.4)',
                  }}
                >
                  <span style={{ fontSize: '2.4rem', fontWeight: 900, color: '#fa709a', lineHeight: 1 }}>{evaluation.score}</span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.06em' }}>/ 100</span>
                </div>
              </div>

              <div
                style={{
                  padding: '20px 22px', borderRadius: 'var(--r-md)',
                  background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.10)',
                }}
              >
                <h3 style={{ fontWeight: 700, marginBottom: '10px', color: '#fa709a', fontSize: '0.95rem' }}>
                  <i className="fa-solid fa-comment-dots mr-2" />ความคิดเห็นจากผู้บริหาร
                </h3>
                <p style={{ fontSize: '0.93rem', lineHeight: 1.75, color: 'var(--text-sub)', fontWeight: 400 }}>
                  {evaluation.feedback}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div style={{ padding: '18px', borderRadius: 'var(--r-md)', borderTop: '2px solid #4facfe', background: 'rgba(79,172,254,0.06)' }}>
                  <h4 style={{ fontWeight: 700, marginBottom: '12px', color: '#4facfe', fontSize: '0.9rem' }}>
                    <i className="fa-solid fa-circle-check mr-2" />จุดเด่นที่ทำได้ดี
                  </h4>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '7px' }}>
                    {evaluation.strengths?.map((s, i) => (
                      <li key={i} style={{ fontSize: '0.87rem', color: 'var(--text-sub)', paddingLeft: '16px', position: 'relative', lineHeight: 1.5 }}>
                        <span style={{ position: 'absolute', left: 0, color: '#4facfe' }}>✓</span>{s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div style={{ padding: '18px', borderRadius: 'var(--r-md)', borderTop: '2px solid #fee140', background: 'rgba(254,225,64,0.06)' }}>
                  <h4 style={{ fontWeight: 700, marginBottom: '12px', color: '#fee140', fontSize: '0.9rem' }}>
                    <i className="fa-solid fa-triangle-exclamation mr-2" />ข้อเสนอแนะ
                  </h4>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '7px' }}>
                    {evaluation.improvements?.map((s, i) => (
                      <li key={i} style={{ fontSize: '0.87rem', color: 'var(--text-sub)', paddingLeft: '16px', position: 'relative', lineHeight: 1.5 }}>
                        <span style={{ position: 'absolute', left: 0, color: '#fee140' }}>→</span>{s}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

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
    </div>
  );
}

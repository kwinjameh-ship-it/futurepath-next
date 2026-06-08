'use client';
import { useState, useEffect, useRef } from 'react';
import GlassNav from '@/components/GlassNav';
import useAuth from '@/lib/useAuth';

const SYSTEM_PROMPT = (name) =>
  `คุณคือ "คุณวีรพล" เจ้าหน้าที่ฝ่ายบุคคล (HR) อาวุโส จากบริษัทชั้นนำระดับโลก มีประสบการณ์สัมภาษณ์งานมากกว่า 15 ปี บุคลิกภาพ: จริงจัง มืออาชีพ สุภาพแต่เด็ดขาด

คุณกำลังสัมภาษณ์ผู้สมัครชื่อ "${name}" โดยมีเป้าหมายเพื่อวัดและฝึกฝน:
1. ทักษะการตอบคำถามสัมภาษณ์
2. ความสามารถในการแก้ไขปัญหาเฉพาะหน้า
3. ไหวพริบและการคิดเชิงวิเคราะห์

กฎสำคัญ:
- ถามทีละ 1 คำถามเท่านั้น รอฟังคำตอบก่อนถามต่อ
- นำข้อมูลจากคำตอบที่ผ่านมาต่อยอดถามเจาะลึก (follow-up)
- เริ่มจากคำถามทั่วไป → ค่อยๆ ยกระดับความยาก
- หลังจากผู้สมัครตอบ ให้ feedback สั้นๆ ว่าดีหรือควรปรับตรงไหน แล้วถามต่อ
- ใช้ภาษาสุภาพ ทางการ แต่เป็นกันเอง
- ห้ามพูดซ้ำหรือวกวน
- หากผู้สมัครยังไม่ได้บอกอาชีพที่ต้องการ ให้ถามก่อนเป็นคำถามแรก`;

export default function InterviewPage() {
  const { user, loading } = useAuth();

  const INIT_MSG = 'สวัสดีครับ ผมคุณวีรพล ตัวแทนฝ่ายบุคคล (HR) ยินดีต้อนรับสู่การสัมภาษณ์จำลองครับ\n\nวันนี้เราจะฝึกทักษะการสัมภาษณ์งาน ทั้งการตอบคำถาม การแก้ปัญหาเฉพาะหน้า และไหวพริบของคุณ\n\nก่อนเริ่ม ขอถามหน่อยนะครับ — **คุณสนใจสมัครงานในสายอาชีพไหน** หรืออาชีพเป้าหมายของคุณคืออะไรครับ?';

  const [messages, setMessages]   = useState([{ sender: 'ai', text: INIT_MSG }]);
  const [history, setHistory]     = useState([]);
  const [inputText, setInputText] = useState('');
  const [status, setStatus]       = useState('idle'); // idle | recording | processing
  const [qCount, setQCount]       = useState(0);
  const [speaking, setSpeaking]   = useState(false);

  const chatRef        = useRef(null);
  const recognitionRef = useRef(null);
  const inputRef       = useRef(null);

  /* ── Init history & speech recognition ── */
  useEffect(() => {
    if (!loading && user?.name) {
      setHistory([
        { role: 'system', parts: [{ text: SYSTEM_PROMPT(user.name) }] },
        { role: 'model',  parts: [{ text: INIT_MSG }] },
      ]);

      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SR) {
        const r = new SR();
        r.lang = 'th-TH';
        r.interimResults = false;
        r.maxAlternatives = 1;
        r.onstart  = () => setStatus('recording');
        r.onresult = (e) => {
          const t = e.results[0][0].transcript.trim();
          if (t) { setInputText(t); }
        };
        r.onend = () => setStatus('idle');
        recognitionRef.current = r;
      }
    }
  }, [loading, user?.name]);

  /* ── Auto scroll ── */
  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  /* ── TTS ── */
  function speakText(text) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const clean = text.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*/g, '');
    const u = new SpeechSynthesisUtterance(clean);
    u.lang = 'th-TH';
    u.rate = 1.05;
    u.onstart = () => setSpeaking(true);
    u.onend   = () => setSpeaking(false);
    window.speechSynthesis.speak(u);
  }

  /* ── Send message ── */
  async function handleSend() {
    const text = inputText.trim();
    if (!text || status === 'processing') return;

    setInputText('');
    setMessages(prev => [...prev, { sender: 'user', text }]);
    const newHistory = [...history, { role: 'user', parts: [{ text }] }];
    setHistory(newHistory);
    setStatus('processing');

    let aiReply = 'ขออภัยครับ ระบบ AI เกิดข้อขัดข้องชั่วคราว กรุณาลองอีกครั้ง';
    try {
      const res = await fetch('/api/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'chat', history: newHistory }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.candidates?.[0]?.content?.parts?.[0]?.text)
          aiReply = data.candidates[0].content.parts[0].text;
      }
    } catch {}

    setHistory(prev => [...prev, { role: 'model', parts: [{ text: aiReply }] }]);
    setMessages(prev => [...prev, { sender: 'ai', text: aiReply }]);
    setQCount(c => c + 1);
    speakText(aiReply);
    setStatus('idle');
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  /* ── Mic toggle ── */
  function toggleMic() {
    if (!recognitionRef.current) { alert('เบราว์เซอร์นี้ไม่รองรับระบบเสียง'); return; }
    if (status === 'recording') {
      recognitionRef.current.stop();
    } else {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      recognitionRef.current.start();
    }
  }

  /* ── Reset ── */
  function resetInterview() {
    if (!confirm('เริ่มการสัมภาษณ์ใหม่?')) return;
    setMessages([{ sender: 'ai', text: INIT_MSG }]);
    setHistory([
      { role: 'system', parts: [{ text: SYSTEM_PROMPT(user.name) }] },
      { role: 'model',  parts: [{ text: INIT_MSG }] },
    ]);
    setQCount(0);
    setInputText('');
    setStatus('idle');
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  }

  const formatMsg = (t) =>
    t.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>');

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Kanit,sans-serif', color: 'var(--text-sub)' }}>
      <i className="fas fa-spinner fa-spin mr-3" style={{ color: 'var(--accent-color)' }} /> กำลังโหลด...
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #050314 0%, #0c0a22 50%, #0d0622 100%)', paddingTop: '64px' }}>
      {/* Ambient blobs */}
      <div style={{ position: 'fixed', top: '10%', left: '5%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,100,255,0.06) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '10%', right: '5%', width: '350px', height: '350px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,0,128,0.06) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

      <GlassNav />

      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '28px 20px 60px', position: 'relative', zIndex: 1 }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <p style={{ fontSize: '0.72rem', color: 'var(--accent-color)', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>
              HR Interview Simulator
            </p>
            <h1 style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 900, background: 'linear-gradient(135deg, #fff 0%, var(--accent-color) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', margin: 0 }}>
              ฝึกการสัมภาษณ์งานกับ AI HR
            </h1>
          </div>

          {/* Stats + Reset */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '8px 16px', borderRadius: 'var(--r-pill)', background: 'rgba(0,242,254,0.08)', border: '1px solid rgba(0,242,254,0.2)', textAlign: 'center' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--accent-color)' }}>{qCount}</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.06em' }}>คำถาม</div>
            </div>
            <button onClick={resetInterview} style={{ padding: '8px 16px', borderRadius: 'var(--r-pill)', background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: 'var(--text-sub)', cursor: 'pointer', fontSize: '0.82rem', fontFamily: 'Kanit,sans-serif', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <i className="fa-solid fa-rotate-right" /> เริ่มใหม่
            </button>
          </div>
        </div>

        {/* ── Main Layout ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '20px', alignItems: 'start' }}>

          {/* ── HR Avatar Panel ── */}
          <div style={{ position: 'sticky', top: '88px' }}>
            <div style={{ borderRadius: '20px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '24px 16px', textAlign: 'center', backdropFilter: 'blur(12px)' }}>
              {/* Avatar */}
              <div style={{ position: 'relative', marginBottom: '16px', display: 'inline-block' }}>
                <div style={{
                  width: '90px', height: '90px', borderRadius: '50%', margin: '0 auto',
                  background: 'linear-gradient(135deg, #1a1a3a, #0d2040)',
                  border: `3px solid ${speaking ? '#00f2fe' : 'rgba(0,242,254,0.3)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: speaking ? '0 0 24px rgba(0,242,254,0.5)' : '0 0 12px rgba(0,242,254,0.15)',
                  transition: 'all 0.3s ease', fontSize: '2.8rem',
                }}>
                  👔
                </div>
                {/* Status dot */}
                <div style={{
                  position: 'absolute', bottom: '4px', right: '4px',
                  width: '16px', height: '16px', borderRadius: '50%',
                  background: status === 'processing' ? '#fed330' : speaking ? '#00f2fe' : '#26de81',
                  border: '2px solid #0c0a22',
                  boxShadow: `0 0 8px ${status === 'processing' ? '#fed330' : speaking ? '#00f2fe' : '#26de81'}`,
                  transition: 'all 0.3s ease',
                }} />
              </div>

              <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '2px' }}>คุณวีรพล</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--accent-color)', letterSpacing: '0.04em', marginBottom: '12px' }}>ฝ่ายบุคคล (HR)</div>

              {/* Speaking status */}
              <div style={{ fontSize: '0.72rem', color: status === 'processing' ? '#fed330' : speaking ? 'var(--accent-color)' : 'var(--text-muted)', transition: 'all 0.3s ease' }}>
                {status === 'processing' ? '⏳ กำลังคิดคำถาม...' : speaking ? '🔊 กำลังพูด...' : status === 'recording' ? '🎙️ กำลังฟัง...' : '🟢 พร้อมรับฟัง'}
              </div>

              {/* Tips */}
              <div style={{ marginTop: '20px', padding: '12px', borderRadius: '12px', background: 'rgba(0,242,254,0.05)', border: '1px solid rgba(0,242,254,0.1)', textAlign: 'left' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--accent-color)', fontWeight: 700, marginBottom: '8px', letterSpacing: '0.06em' }}>💡 เคล็ดลับ</div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {[
                    'ตอบให้ชัดเจนและตรงประเด็น',
                    'ยกตัวอย่างจากประสบการณ์จริง',
                    'แสดงความคิดเชิงบวก',
                  ].map((tip, i) => (
                    <li key={i} style={{ fontSize: '0.68rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>• {tip}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* ── Chat Area ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

            {/* Messages */}
            <div
              ref={chatRef}
              style={{
                height: '55vh', overflowY: 'auto',
                borderRadius: '20px',
                background: 'rgba(8,6,22,0.7)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.08)',
                padding: '24px',
                display: 'flex', flexDirection: 'column', gap: '16px',
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(0,242,254,0.2) transparent',
              }}
            >
              {messages.map((msg, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', flexDirection: msg.sender === 'ai' ? 'row' : 'row-reverse' }}>
                  {/* Avatar mini */}
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                    background: msg.sender === 'ai'
                      ? 'linear-gradient(135deg, #1a1a3a, #0d2040)'
                      : 'linear-gradient(135deg, var(--accent-color), #00a8ff)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: msg.sender === 'ai' ? '0.9rem' : '0.85rem',
                    fontWeight: 900, color: msg.sender === 'ai' ? 'white' : '#0c0a22',
                    border: msg.sender === 'ai' ? '1px solid rgba(0,242,254,0.3)' : 'none',
                    boxShadow: msg.sender === 'ai' ? '0 0 8px rgba(0,242,254,0.2)' : 'none',
                  }}>
                    {msg.sender === 'ai' ? '👔' : user.name?.charAt(0)}
                  </div>

                  {/* Bubble */}
                  <div
                    style={{
                      maxWidth: '80%',
                      padding: '14px 18px',
                      borderRadius: msg.sender === 'ai' ? '4px 18px 18px 18px' : '18px 4px 18px 18px',
                      fontSize: '0.93rem', lineHeight: 1.75,
                      background: msg.sender === 'ai'
                        ? 'linear-gradient(135deg, rgba(0,100,255,0.08), rgba(0,242,254,0.06))'
                        : 'linear-gradient(135deg, rgba(255,0,128,0.10), rgba(0,242,254,0.06))',
                      border: msg.sender === 'ai'
                        ? '1px solid rgba(0,242,254,0.2)'
                        : '1px solid rgba(255,0,128,0.25)',
                      color: 'var(--text-main)',
                    }}
                    dangerouslySetInnerHTML={{ __html: formatMsg(msg.text) }}
                  />
                </div>
              ))}

              {/* Typing indicator */}
              {status === 'processing' && (
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #1a1a3a, #0d2040)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', border: '1px solid rgba(0,242,254,0.3)' }}>👔</div>
                  <div style={{ padding: '14px 20px', borderRadius: '4px 18px 18px 18px', background: 'rgba(0,242,254,0.06)', border: '1px solid rgba(0,242,254,0.2)', display: 'flex', gap: '6px', alignItems: 'center' }}>
                    {[0, 1, 2].map(i => (
                      <div key={i} style={{
                        width: '8px', height: '8px', borderRadius: '50%',
                        background: 'var(--accent-color)',
                        animation: `bounce 1s ease ${i * 0.2}s infinite`,
                        opacity: 0.7,
                      }} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Input row */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
              {/* Text input */}
              <div style={{ flex: 1, position: 'relative' }}>
                <textarea
                  ref={inputRef}
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder="พิมพ์คำตอบของคุณ... หรือกดปุ่มไมค์"
                  disabled={status === 'processing'}
                  rows={2}
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    padding: '14px 18px', borderRadius: '16px',
                    background: 'rgba(255,255,255,0.05)',
                    border: `1px solid ${status === 'recording' ? 'rgba(255,8,68,0.5)' : 'rgba(255,255,255,0.12)'}`,
                    color: 'var(--text-main)', fontSize: '0.95rem', lineHeight: 1.6,
                    fontFamily: 'Kanit,sans-serif', resize: 'none', outline: 'none',
                    backdropFilter: 'blur(8px)',
                    transition: 'border-color 0.2s ease',
                  }}
                />
                {status === 'recording' && (
                  <div style={{ position: 'absolute', top: '50%', right: '14px', transform: 'translateY(-50%)', display: 'flex', gap: '3px', alignItems: 'center' }}>
                    {[0, 1, 2, 1, 0].map((h, i) => (
                      <div key={i} style={{ width: '3px', height: `${8 + h * 6}px`, borderRadius: '2px', background: '#ff0844', animation: `wave 0.6s ease ${i * 0.1}s infinite alternate` }} />
                    ))}
                  </div>
                )}
              </div>

              {/* Mic button */}
              <button
                onClick={toggleMic}
                disabled={status === 'processing'}
                title="กดพูด"
                style={{
                  width: '50px', height: '50px', borderRadius: '50%', flexShrink: 0,
                  border: 'none', cursor: status === 'processing' ? 'not-allowed' : 'pointer',
                  background: status === 'recording'
                    ? 'linear-gradient(135deg, #ff0844, #ff6b6b)'
                    : 'rgba(255,255,255,0.06)',
                  border: `1px solid ${status === 'recording' ? 'rgba(255,8,68,0.5)' : 'rgba(255,255,255,0.12)'}`,
                  color: status === 'recording' ? '#fff' : 'var(--text-sub)',
                  fontSize: '1.2rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: status === 'recording' ? '0 0 16px rgba(255,8,68,0.4)' : 'none',
                  transition: 'all 0.3s ease',
                  opacity: status === 'processing' ? 0.4 : 1,
                }}
              >
                <i className={`fa-solid ${status === 'recording' ? 'fa-stop' : 'fa-microphone'}`} />
              </button>

              {/* Send button */}
              <button
                onClick={handleSend}
                disabled={!inputText.trim() || status === 'processing'}
                style={{
                  height: '50px', padding: '0 20px', borderRadius: '16px', flexShrink: 0,
                  border: 'none', cursor: (!inputText.trim() || status === 'processing') ? 'not-allowed' : 'pointer',
                  background: inputText.trim() && status !== 'processing'
                    ? 'linear-gradient(135deg, var(--accent-color), #4facfe)'
                    : 'rgba(255,255,255,0.05)',
                  color: inputText.trim() && status !== 'processing' ? '#0c0a22' : 'var(--text-muted)',
                  fontFamily: 'Kanit,sans-serif', fontWeight: 700, fontSize: '0.9rem',
                  display: 'flex', alignItems: 'center', gap: '8px',
                  transition: 'all 0.3s ease',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <i className="fa-solid fa-paper-plane" />
                ส่ง
              </button>
            </div>

            {/* Hint */}
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center', margin: 0 }}>
              Enter เพื่อส่ง  •  Shift+Enter ขึ้นบรรทัดใหม่  •  🎙️ กดไมค์เพื่อพูด
            </p>
          </div>
        </div>
      </main>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        @keyframes wave {
          from { transform: scaleY(0.6); }
          to   { transform: scaleY(1.4); }
        }
        textarea::placeholder { color: rgba(255,255,255,0.25); }
        textarea:focus { border-color: rgba(0,242,254,0.4) !important; box-shadow: 0 0 0 2px rgba(0,242,254,0.08); }
      `}</style>
    </div>
  );
}

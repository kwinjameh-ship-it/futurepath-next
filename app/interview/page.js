'use client';
import { useState, useEffect, useRef } from 'react';
import GlassNav from '@/components/GlassNav';
import useAuth from '@/lib/useAuth';

export default function InterviewPage() {
  const { user, loading } = useAuth();
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'สวัสดีครับ/ค่ะ ฉันคือเจ้าหน้าที่ฝ่ายบุคคล (HR) วันนี้เราจะมาสัมภาษณ์เพื่อดูวิสัยทัศน์และความเหมาะสมในสายอาชีพของคุณ กดปุ่มไมค์เพื่อแนะนำตัว พร้อมบอก "อาชีพเป้าหมาย" ที่คุณสนใจให้ฟังหน่อยครับ/ค่ะ' },
  ]);
  const [history,    setHistory]    = useState([]);
  const [status,     setStatus]     = useState('คลิกที่ไมโครโฟนเพื่อเริ่มพูด');
  const [recording,  setRecording]  = useState(false);
  const [processing, setProcessing] = useState(false);
  const chatRef        = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (!loading && user.name) {
      setHistory([
        { role: 'system',  parts: [{ text: `คุณคือ 'เจ้าหน้าที่ฝ่ายบุคคล (HR) ระดับท็อป' จากบริษัทชั้นนำระดับโลก ทำหน้าที่สัมภาษณ์งานผู้ใช้งานชื่อ ${user.name} อย่างมืออาชีพ เป้าหมายหลักของคุณคือการตั้งคำถามเพื่อประเมิน "วิสัยทัศน์ (Vision)" และ "ความเหมาะสมกับอาชีพเป้าหมายของผู้สมัคร"\n\nกฎการสัมภาษณ์:\n1. ถามเจาะลึกทีละ 1 คำถามเท่านั้น\n2. นำข้อมูลจากคำตอบล่าสุดของผู้ใช้มาต่อยอดเป็นคำถามถัดไป (Follow-up questions) เพื่อเจาะลึกความคิดและต้อนให้จนมุม เสมือน HR จริงๆ\n3. ยิงคำถามเพื่อวัดวิสัยทัศน์ ทัศนคติ การแก้ปัญหา หรือการรับมือกับความกดดันในสายอาชีพนั้นๆ\n4. หากผู้ใช้ยังไม่ระบุอาชีพเป้าหมาย ให้ถามก่อน\n5. หากผู้ใช้งานตอบได้ดี ให้ชื่นชมสั้นๆ แล้วปรับระดับความท้าทายของคำถามถัดไปให้ยากขึ้น\n6. ห้ามพูดซ้ำไปซ้ำมา ห้ามพูดวกวน และต้องรักษาบุคลิกความเฉียบขาดจริงจังตลอดเวลา` }] },
        { role: 'model', parts: [{ text: 'สวัสดีครับ/ค่ะ ฉันคือเจ้าหน้าที่ฝ่ายบุคคล (HR) วันนี้เราจะมาสัมภาษณ์เพื่อดูวิสัยทัศน์และความเหมาะสมในสายอาชีพของคุณ กดปุ่มไมค์เพื่อแนะนำตัว พร้อมบอก "อาชีพเป้าหมาย" ที่คุณสนใจให้ฟังหน่อยครับ/ค่ะ' }] },
      ]);

      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SR) {
        const r = new SR();
        r.lang = 'th-TH';
        r.interimResults = false;
        r.maxAlternatives = 1;
        r.onstart  = () => { setRecording(true); setStatus('กำลังฟังเสียงของคุณ... (พูดเสร็จแล้วรอสักครู่)'); if ('speechSynthesis' in window) window.speechSynthesis.cancel(); };
        r.onresult = (e) => { const t = e.results[0][0].transcript.trim(); if (t) sendToAI(t); };
        r.onend    = () => { setRecording(false); setStatus('คลิกที่ไมโครโฟนเพื่อเริ่มพูด'); };
        recognitionRef.current = r;
      }
    }
  }, [loading, user.name]);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  function speakText(text) {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text.replace(/\*/g, ''));
      u.lang = 'th-TH';
      u.rate = 1.0;
      window.speechSynthesis.speak(u);
    }
  }

  async function sendToAI(userText) {
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    const newHistory = [...history, { role: 'user', parts: [{ text: userText }] }];
    setHistory(newHistory);
    setProcessing(true);
    setStatus('AI กำลังประเมินและคิดคำถาม... โปรดรอสักครู่ ✨');

    let aiReply = 'ขออภัยครับ ระบบ AI เกิดข้อขัดข้องชั่วคราว';
    try {
      const res = await fetch('/api/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'chat', history: newHistory }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.candidates?.[0]?.content?.parts?.[0]?.text) aiReply = data.candidates[0].content.parts[0].text;
      }
    } catch {}

    setHistory(prev => [...prev, { role: 'model', parts: [{ text: aiReply }] }]);
    setMessages(prev => [...prev, { sender: 'ai', text: aiReply }]);
    speakText(aiReply);
    setProcessing(false);
    setStatus('คลิกที่ไมโครโฟนเพื่อตอบคำถาม');
  }

  function toggleMic() {
    if (!recognitionRef.current) { setStatus('เบราว์เซอร์นี้ไม่รองรับระบบสั่งงานด้วยเสียง'); return; }
    if (recording) { recognitionRef.current.stop(); } else { recognitionRef.current.start(); }
  }

  const formatMsg = (t) => t.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>');

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Kanit,sans-serif', color: 'var(--text-sub)' }}>
      <i className="fas fa-spinner fa-spin mr-3" style={{ color: 'var(--accent-color)' }} /> กำลังโหลด...
    </div>
  );

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
          padding: '24px 20px 40px',
          minHeight: 'calc(100vh - 64px)',
          position: 'relative', zIndex: 10,
        }}
      >
        {/* Title */}
        <header style={{ textAlign: 'center', marginBottom: '20px' }}>
          <p className="section-eyebrow" style={{ marginBottom: '8px' }}>Voice Interview Simulation</p>
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
            AI Interviewer
          </h1>
          <p style={{ color: 'var(--text-sub)', fontWeight: 400, marginTop: '6px', fontSize: '0.97rem' }}>
            ระบบจำลองการสัมภาษณ์ด้วยเสียง
          </p>
        </header>

        {/* User Card */}
        <div
          style={{
            width: '100%', maxWidth: '800px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '12px 20px', borderRadius: 'var(--r-pill)', marginBottom: '16px',
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
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', letterSpacing: '0.06em' }}>ผู้เข้าสัมภาษณ์</span>
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

        {/* Chat Container */}
        <div
          style={{
            width: '100%', maxWidth: '800px',
            display: 'flex', flexDirection: 'column',
            borderRadius: 'var(--r-xl)', overflow: 'hidden',
            height: '60vh',
            background: 'rgba(8, 6, 22, 0.65)',
            backdropFilter: 'blur(22px)',
            border: '1px solid rgba(255,255,255,0.12)',
            boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
          }}
        >
          {/* Messages */}
          <div
            ref={chatRef}
            style={{
              flex: 1, overflowY: 'auto',
              padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px',
            }}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  maxWidth: '75%',
                  alignSelf: msg.sender === 'ai' ? 'flex-start' : 'flex-end',
                  padding: '13px 18px',
                  borderRadius: msg.sender === 'ai' ? '18px 18px 18px 4px' : '18px 18px 4px 18px',
                  fontSize: '0.95rem', lineHeight: 1.7,
                  background: msg.sender === 'ai'
                    ? 'linear-gradient(135deg, rgba(0,242,254,0.10), rgba(79,172,254,0.10))'
                    : 'linear-gradient(135deg, rgba(250,112,154,0.15), rgba(254,225,64,0.08))',
                  border: msg.sender === 'ai'
                    ? '1px solid rgba(0,242,254,0.3)'
                    : '1px solid rgba(250,112,154,0.35)',
                  color: 'var(--text-main)',
                }}
                dangerouslySetInnerHTML={{ __html: formatMsg(msg.text) }}
              />
            ))}
          </div>

          {/* Mic Control */}
          <div
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              padding: '20px 28px',
              background: 'rgba(0,0,0,0.4)',
              borderTop: '1px solid rgba(255,255,255,0.10)',
              gap: '12px',
              flexShrink: 0,
            }}
          >
            <p style={{ fontSize: '0.87rem', color: 'var(--text-muted)', fontWeight: 500, textAlign: 'center' }}>
              {status}
            </p>
            <button
              onClick={toggleMic}
              disabled={processing}
              className={recording ? 'mic-recording' : ''}
              style={{
                width: '72px', height: '72px',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '2rem',
                border: 'none',
                cursor: processing ? 'not-allowed' : 'pointer',
                opacity: processing ? 0.5 : 1,
                background: recording
                  ? 'linear-gradient(135deg, #ff0844, #ffb199)'
                  : 'linear-gradient(135deg, #00f2fe, #4facfe)',
                boxShadow: recording
                  ? '0 0 24px rgba(255,8,68,0.5)'
                  : '0 0 24px var(--accent-glow)',
                transition: 'all 0.3s ease',
              }}
            >
              🎙️
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

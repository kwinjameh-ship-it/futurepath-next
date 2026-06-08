'use client';
import { useState, useEffect, useRef } from 'react';
import GlassNav from '@/components/GlassNav';
import useAuth from '@/lib/useAuth';

export default function ChatPage() {
  const { user, loading } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput]       = useState('');
  const [sending, setSending]   = useState(false);
  const [history, setHistory]   = useState([]);
  const chatRef = useRef(null);

  useEffect(() => {
    if (!loading && user.name) {
      const greeting = 'สวัสดีครับ! ผมคือ FUTUREPATH AI ผู้ช่วยให้คำปรึกษาด้านการศึกษาและอาชีพ มีอะไรให้ช่วยได้เลยครับ 😊';
      setMessages([{ sender: 'ai', text: greeting, time: getTime() }]);
      setHistory([
        { role: 'user',  parts: [{ text: `คุณคือ FUTUREPATH AI ผู้เชี่ยวชาญด้านการให้คำปรึกษาเกี่ยวกับการศึกษา การเรียนต่อ และการค้นหาอาชีพ ตอบคำถามเป็นภาษาไทยด้วยความสุภาพ เป็นกันเอง ผู้ใช้งานชื่อ: ${user.name}` }] },
        { role: 'model', parts: [{ text: greeting }] },
      ]);
    }
  }, [loading, user.name]);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  function getTime() {
    return new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
  }

  async function handleSend() {
    const text = input.trim();
    if (!text || sending) return;
    setInput('');
    setSending(true);

    const userMsg = { sender: 'user', text, time: getTime() };
    setMessages(prev => [...prev, userMsg]);

    const newHistory = [...history, { role: 'user', parts: [{ text }] }];
    setHistory(newHistory);

    setMessages(prev => [...prev, { sender: 'ai', text: '__typing__', time: getTime() }]);

    let aiText = 'ขออภัยครับ ระบบ AI เกิดข้อขัดข้องชั่วคราว กรุณาลองใหม่อีกครั้ง';
    try {
      const res = await fetch('/api/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'chat', history: newHistory }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
          aiText = data.candidates[0].content.parts[0].text;
        }
      }
    } catch {}

    setHistory(prev => [...prev, { role: 'model', parts: [{ text: aiText }] }]);
    setMessages(prev => [
      ...prev.filter(m => m.text !== '__typing__'),
      { sender: 'ai', text: aiText, time: getTime() },
    ]);
    setSending(false);
  }

  function formatAI(text) {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<b style="color:var(--accent-color)">$1</b>')
      .replace(/\n/g, '<br>');
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Kanit,sans-serif', color: 'var(--text-sub)' }}>
      <i className="fas fa-spinner fa-spin mr-3" style={{ color: 'var(--accent-color)' }} /> กำลังโหลด...
    </div>
  );

  return (
    <div style={{ height: '100vh', background: '#120c0a', color: '#fff', fontFamily: "'Kanit', sans-serif", paddingTop: '64px', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
      {/* Image Background & Corner Gradients */}
      <div className="no-print" style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ 
          position: 'absolute', inset: 0, 
          backgroundImage: "url('/img/bg-room.jpg')", 
          backgroundSize: 'cover', 
          backgroundPosition: 'center',
          opacity: 0.8
        }} />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(18, 12, 10, 0.65)' }} />
        <div style={{ position: 'absolute', top: '-20%', left: '-15%', width: '60vw', height: '60vw', background: 'radial-gradient(circle, rgba(255,122,0,0.35) 0%, transparent 70%)', filter: 'blur(80px)', mixBlendMode: 'screen' }} />
        <div style={{ position: 'absolute', bottom: '-20%', right: '-15%', width: '70vw', height: '70vw', background: 'radial-gradient(circle, rgba(255,75,0,0.3) 0%, transparent 70%)', filter: 'blur(100px)', mixBlendMode: 'screen' }} />
      </div>

      <GlassNav />

      {/* Chat Container */}
      <div
        style={{
          flex: 1,
          maxWidth: '900px',
          width: '100%',
          margin: '16px auto',
          borderRadius: 'var(--r-xl)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid var(--glass-border)',
          boxShadow: '0 24px 60px var(--shadow-color)',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '18px 28px',
            borderBottom: '1px solid var(--glass-border)',
            background: 'transparent',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '42px', height: '42px', borderRadius: '50%',
                background: 'var(--accent-dim)',
                border: '2px solid var(--accent-color)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 12px var(--accent-glow)',
                flexShrink: 0,
              }}
            >
              <i className="fa-solid fa-robot" style={{ color: 'var(--accent-color)', fontSize: '1.1rem' }} />
            </div>
            <div>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', letterSpacing: '0.08em', fontWeight: 500 }}>ระบบให้คำปรึกษา AI</p>
              <p style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--accent-color)' }}>{user.name}</p>
            </div>
          </div>

          <button
            onClick={() => { if (confirm('ต้องการออกจากระบบ?')) { localStorage.clear(); window.location.href = '/'; } }}
            style={{
              padding: '7px 18px', borderRadius: 'var(--r-pill)',
              background: 'transparent', border: '1px solid var(--secondary-color)',
              color: 'var(--secondary-color)', cursor: 'pointer',
              fontFamily: 'Kanit,sans-serif', fontWeight: 600, fontSize: '0.85rem',
              display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.25s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--secondary-dim)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
          >
            <i className="fa-solid fa-right-from-bracket" /> ออกจากระบบ
          </button>
        </div>

        {/* Messages */}
        <div
          ref={chatRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '28px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                flexDirection: 'column',
                maxWidth: '78%',
                alignSelf: msg.sender === 'ai' ? 'flex-start' : 'flex-end',
                animation: 'fadeIn 0.35s ease',
              }}
            >
              {/* Sender + time */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginBottom: '5px',
                  justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <span style={{ fontWeight: 700, fontSize: '0.78rem', color: msg.sender === 'ai' ? 'var(--accent-color)' : 'var(--text-sub)' }}>
                  {msg.sender === 'ai' ? 'FUTUREPATH AI' : user.name}
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{msg.time} น.</span>
              </div>

              {/* Bubble */}
              <div
                style={msg.sender === 'ai' ? {
                  padding: '14px 18px',
                  borderRadius: '18px 18px 18px 4px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid var(--glass-border)',
                  fontSize: '0.95rem',
                  lineHeight: 1.7,
                  color: 'var(--text-main)',
                } : {
                  padding: '14px 18px',
                  borderRadius: '18px 18px 4px 18px',
                  background: 'var(--accent-dim)',
                  border: '1px solid rgba(255,122,0,0.35)',
                  fontSize: '0.95rem',
                  lineHeight: 1.7,
                  color: 'var(--text-main)',
                }}
              >
                {msg.text === '__typing__' ? (
                  <div style={{ display: 'flex', gap: '5px', padding: '4px 0', alignItems: 'center' }}>
                    <div className="dot" /><div className="dot" /><div className="dot" />
                  </div>
                ) : msg.sender === 'ai' ? (
                  <span dangerouslySetInnerHTML={{ __html: formatAI(msg.text) }} />
                ) : msg.text}
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div
          style={{
            display: 'flex',
            gap: '12px',
            padding: '16px 24px',
            borderTop: '1px solid var(--glass-border)',
            background: 'transparent',
            flexShrink: 0,
          }}
        >
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="พิมพ์คำถามหรือปรึกษาเรื่องการศึกษา / อาชีพที่นี่..."
            disabled={sending}
            style={{
              flex: 1,
              padding: '13px 20px',
              borderRadius: 'var(--r-pill)',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid var(--glass-border)',
              color: 'var(--text-main)',
              fontFamily: 'Kanit,sans-serif',
              fontSize: '0.97rem',
              outline: 'none',
              transition: 'border-color 0.25s',
            }}
            onFocus={e => { e.target.style.borderColor = 'var(--accent-color)'; }}
            onBlur={e => { e.target.style.borderColor = 'var(--glass-border)'; }}
          />
          <button
            onClick={handleSend}
            disabled={sending}
            style={{
              width: '50px', height: '50px', borderRadius: '50%',
              background: sending ? 'rgba(255,122,0,0.3)' : 'linear-gradient(135deg, var(--accent-color), #ff4b00)',
              border: 'none', cursor: sending ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#0c0a22', fontSize: '1.1rem',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              flexShrink: 0,
            }}
            onMouseEnter={e => { if (!sending) e.currentTarget.style.transform = 'scale(1.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; }}
          >
            <i className="fa-solid fa-paper-plane" />
          </button>
        </div>
      </div>
    </div>
  );
}

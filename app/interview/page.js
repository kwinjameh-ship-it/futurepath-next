'use client';
import { useState, useEffect, useRef } from 'react';
import Script from 'next/script';
import GlassNav from '@/components/GlassNav';
import useAuth from '@/lib/useAuth';
import Swal from 'sweetalert2';

const showModal = (icon, title, text) => {
  Swal.fire({
    icon,
    title,
    text,
    background: 'rgba(255, 255, 255, 0.08)',
    color: '#f0f4ff',
    confirmButtonColor: '#ff7a00',
    backdrop: 'rgba(0, 0, 0, 0.5)',
    customClass: {
      popup: '!rounded-[40px] backdrop-blur-[40px] border border-[rgba(255,255,255,0.15)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_24px_64px_rgba(0,0,0,0.4)] px-4 py-8',
      title: 'font-kanit text-[1.8rem] font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-[#ff7a00] to-white',
      htmlContainer: 'font-kanit text-[rgba(255,255,255,0.6)] text-[0.88rem] mt-2 font-normal',
      confirmButton: '!rounded-full font-kanit px-8 py-3 text-lg font-semibold shadow-lg shadow-[#ff7a00]/30 transition-all hover:scale-105'
    }
  });
};





const SYSTEM_PROMPT = (name) =>
  `คุณคือ "คุณวีรพล" เจ้าหน้าที่ฝ่ายบุคคล (HR) อาวุโส จากบริษัทชั้นนำระดับโลก มีประสบการณ์สัมภาษณ์งานมากกว่า 15 ปี บุคลิกภาพ: จริงจัง มืออาชีพ สุภาพแต่เด็ดขาด

คุณกำลังสัมภาษณ์ผู้สมัครชื่อ "${name}" โดยมีเป้าหมายเพื่อวัดและฝึกฝน:
1. ทักษะการตอบคำถามสัมภาษณ์
2. ความสามารถในการแก้ไขปัญหาเฉพาะหน้า
3. ไหวพริบและการคิดเชิงวิเคราะห์

กฎสำคัญ:
- **ตอบเป็นภาษาไทยเท่านั้น ห้ามใช้ภาษาอังกฤษโดยเด็ดขาด แม้แต่คำเดียว**
- ถามทีละ 1 คำถามเท่านั้น รอฟังคำตอบก่อนถามต่อ
- นำข้อมูลจากคำตอบที่ผ่านมาต่อยอดถามเจาะลึก (follow-up)
- เริ่มจากคำถามทั่วไป → ค่อยๆ ยกระดับความยาก
- หลังจากผู้สมัครตอบ ให้ feedback สั้นๆ ว่าดีหรือควรปรับตรงไหน แล้วถามต่อ
- ใช้ภาษาไทยสุภาพ ทางการ แต่เป็นกันเอง ห้ามสลับภาษาอังกฤษ
- ห้ามพูดซ้ำหรือวกวน
- หากผู้สมัครยังไม่ได้บอกอาชีพที่ต้องการ ให้ถามก่อนเป็นคำถามแรก
- ตอบสั้น กระชับ ไม่เกิน 3-4 ประโยค เพื่อให้ฟังออกทางเสียงได้ง่าย`;

export default function InterviewPage() {
  const { user, loading } = useAuth();

  const INIT_MSG = 'สวัสดีครับ ผมคุณวีรพล ตัวแทนฝ่ายบุคคล (HR) ยินดีต้อนรับสู่การสัมภาษณ์จำลองครับ\n\nวันนี้เราจะฝึกทักษะการสัมภาษณ์งาน ทั้งการตอบคำถาม การแก้ปัญหาเฉพาะหน้า และไหวพริบของคุณ\n\nก่อนเริ่ม ขอถามหน่อยนะครับ — **คุณสนใจสมัครงานในสายอาชีพไหน** หรืออาชีพเป้าหมายของคุณคืออะไรครับ?';

  const [messages, setMessages]   = useState([{ sender: 'ai', text: INIT_MSG }]);
  const [history, setHistory]     = useState([]);
  const [inputText, setInputText] = useState('');
  const [status, setStatus]       = useState('idle'); // idle | recording | processing
  const [qCount, setQCount]       = useState(0);
  const [speaking, setSpeaking]   = useState(false);
  const [mouthOpen, setMouthOpen] = useState(false);
  const [voiceReady, setVoiceReady] = useState(false);
  const selectedVoiceRef = useRef(null);
  const mouthTimerRef    = useRef(null);

  const chatRef        = useRef(null);
  const recognitionRef = useRef(null);
  const inputRef       = useRef(null);
  const videoRef       = useRef(null);
  const handleSendRef  = useRef(null); // ref to handleSend for use inside callbacks
  const [camActive, setCamActive] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false); // full voice conversation mode

  /* ── Webcam Logic ── */
  async function toggleCamera() {
    if (camActive) {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(t => t.stop());
        videoRef.current.srcObject = null;
      }
      setCamActive(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCamActive(true);
      } catch (err) {
        showModal('error', 'เปิดกล้องไม่ได้', 'กรุณาอนุญาตให้เบราว์เซอร์เข้าถึงกล้องของคุณบน Address Bar ครับ');
      }
    }
  }

  useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  /* ── Load & pick best Thai voice ── */
  useEffect(() => {
    if (!('speechSynthesis' in window)) return;

    function pickVoice() {
      const voices = window.speechSynthesis.getVoices();
      if (!voices.length) return;

      // Priority: Thai male > Thai any > network Thai > first Thai-sounding
      const thaiVoices = voices.filter(v => v.lang.startsWith('th'));
      const maleThai   = thaiVoices.find(v => /male|man|กัน|วีร|สม/i.test(v.name));
      const netThai    = thaiVoices.find(v => !v.localService);
      selectedVoiceRef.current = maleThai || thaiVoices[0] || netThai || null;
      setVoiceReady(true);
    }

    pickVoice();
    window.speechSynthesis.onvoiceschanged = pickVoice;
  }, []);

  /* ── Init history & speech recognition ── */
  useEffect(() => {
    if (!loading && user?.name) {
      setHistory([
        { role: 'system', parts: [{ text: SYSTEM_PROMPT(user.name) }] },
        { role: 'model',  parts: [{ text: INIT_MSG }] },
      ]);

      // Speak the opening greeting after voices are loaded
      setTimeout(() => {
        speakTextWithCallback(INIT_MSG, null);
      }, 1200);


      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SR) {
        const r = new SR();
        r.lang = 'th-TH';
        r.interimResults = false;
        r.maxAlternatives = 1;
        r.onstart  = () => setStatus('recording');
        r.onresult = (e) => {
          const t = e.results[0][0].transcript.trim();
          if (t) {
            setInputText(t);
            // Auto-send after voice recognition
            setTimeout(() => {
              handleSendRef.current(t);
            }, 300);
          }
        };
        r.onend = () => setStatus(prev => prev === 'recording' ? 'idle' : prev);
        recognitionRef.current = r;
      }
    }
  }, [loading, user?.name]);

  /* ── Auto scroll ── */
  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  /* ── Mouth animation loop ── */
  function startMouthAnim() {
    if (mouthTimerRef.current) clearInterval(mouthTimerRef.current);
    mouthTimerRef.current = setInterval(() => {
      setMouthOpen(p => !p);
    }, 220);
  }
  function stopMouthAnim() {
    if (mouthTimerRef.current) clearInterval(mouthTimerRef.current);
    setMouthOpen(false);
  }

  /* ── TTS: Google Translate (primary) + Web Speech API (fallback) ── */
  const voiceModeRef = useRef(false);
  useEffect(() => { voiceModeRef.current = voiceMode; }, [voiceMode]);
  useEffect(() => { handleSendRef.current = handleSend; });

  async function speakTextWithCallback(text, onDone) {
    const clean = text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*/g, '')
      .replace(/<br>/g, ' ')
      .replace(/<[^>]+>/g, '')
      .replace(/[^\u0000-\u007F\u0E00-\u0E7F\s]/g, '') // keep ASCII + Thai only
      .trim();
    if (!clean) { onDone && onDone(); return; }

    setSpeaking(true);
    startMouthAnim();

    // — Primary: /api/tts proxy → Google TTS (ภาษาไทย 100%) —
    try {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();

      // แบ่งข้อความเป็น chunk ไม่เกิน 180 ตัวอักษร
      const chunks = [];
      let remaining = clean;
      while (remaining.length > 0) {
        // ตัดที่ช่องว่างเพื่อไม่ให้คำขาดกลาง
        let cutAt = Math.min(180, remaining.length);
        if (cutAt < remaining.length) {
          const lastSpace = remaining.lastIndexOf(' ', cutAt);
          if (lastSpace > 80) cutAt = lastSpace;
        }
        chunks.push(remaining.slice(0, cutAt).trim());
        remaining = remaining.slice(cutAt).trim();
      }

      for (const chunk of chunks) {
        if (!chunk) continue;
        await new Promise((resolve) => {
          const url = `/api/tts?text=${encodeURIComponent(chunk)}`;
          const audio = new Audio(url);
          audio.playbackRate = 1.35;       // พูดเร็วขึ้น
          audio.preservesPitch = false;    // pitch ต่ำลงตามความเร็ว → เสียงผู้ชาย
          audio.onended = () => resolve();
          audio.onerror = () => resolve();
          audio.play().catch(() => resolve());
        });
      }

      setSpeaking(false);
      stopMouthAnim();
      onDone && onDone();
      return;
    } catch {
      // ถ้า proxy ล้มเหลว ใช้ Web Speech API
    }

    // — Fallback: Web Speech API —
    if (!('speechSynthesis' in window)) {
      setSpeaking(false); stopMouthAnim(); onDone && onDone(); return;
    }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(clean);
    const voice = selectedVoiceRef.current ||
      window.speechSynthesis.getVoices().find(v => v.lang.startsWith('th'));
    if (voice) { u.voice = voice; u.lang = voice.lang; }
    else { u.lang = 'th-TH'; }
    u.rate = 0.88; u.pitch = 0.9; u.volume = 1.0;
    u.onstart = () => { setSpeaking(true);  startMouthAnim(); };
    u.onend   = () => { setSpeaking(false); stopMouthAnim(); onDone && onDone(); };
    u.onerror = () => { setSpeaking(false); stopMouthAnim(); onDone && onDone(); };
    window.speechSynthesis.speak(u);
  }


  function speakText(text) { speakTextWithCallback(text, null); }


  /* ── Send message (accepts optional text arg from voice) ── */
  async function handleSend(voiceText) {
    const text = (typeof voiceText === 'string' ? voiceText : inputText).trim();
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
    setStatus('idle');

    // Speak AI reply — then if voiceMode, auto-open mic again
    speakTextWithCallback(aiReply, () => {
      if (voiceModeRef.current && recognitionRef.current) {
        setTimeout(() => {
          try { recognitionRef.current.start(); } catch {}
        }, 600);
      }
    });

    setTimeout(() => inputRef.current?.focus(), 100);
  }

  /* ── Mic toggle ── */
  function toggleMic() {
    if (!recognitionRef.current) { showModal('error', 'แจ้งเตือน', 'เบราว์เซอร์นี้ไม่รองรับระบบเสียง'); return; }
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
    showModal('success', 'สำเร็จ', 'เริ่มการสัมภาษณ์ใหม่');
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
    <div style={{ minHeight: '100vh', background: '#120c0a', color: '#fff', fontFamily: "'Kanit', sans-serif", paddingTop: '64px', display: 'flex', flexDirection: 'column' }}>
      {/* Image Background & Corner Gradients */}
      <div className="no-print" style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ 
          position: 'absolute', inset: 0, 
          backgroundImage: "url('/img/bg-room2.png')", 
          backgroundSize: 'cover', 
          backgroundPosition: 'center',
          opacity: 0.8
        }} />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(18, 12, 10, 0.65)' }} />
        <div style={{ position: 'absolute', top: '-20%', left: '-15%', width: '60vw', height: '60vw', background: 'radial-gradient(circle, rgba(255,122,0,0.15) 0%, transparent 70%)', filter: 'blur(80px)', mixBlendMode: 'screen' }} />
        <div style={{ position: 'absolute', bottom: '-20%', right: '-15%', width: '70vw', height: '70vw', background: 'radial-gradient(circle, rgba(255,75,0,0.1) 0%, transparent 70%)', filter: 'blur(100px)', mixBlendMode: 'screen' }} />
      </div>

      <GlassNav />

      {/* ResponsiveVoice TTS — เสียงภาษาไทย */}
      <Script
        src="https://code.responsivevoice.org/responsivevoice.js?key=FREE"
        strategy="afterInteractive"
      />

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
            <div style={{ padding: '8px 16px', borderRadius: 'var(--r-pill)', background: 'rgba(255,122,0,0.08)', border: '1px solid rgba(255,122,0,0.2)', textAlign: 'center' }}>
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
          <div className="fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div style={{ borderRadius: '20px', background: 'var(--card-bg)', border: '1px solid var(--card-border)', padding: '24px 16px', textAlign: 'center', backdropFilter: 'blur(12px)' }}>
              {/* ── Animated Avatar ── */}
              <div style={{ position: 'relative', marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>

                {/* Outer glow ring when speaking */}
                {speaking && (
                  <div style={{
                    position: 'absolute', top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '110px', height: '110px', borderRadius: '50%',
                    border: '2px solid var(--accent-color)',
                    animation: 'ping 1s cubic-bezier(0,0,0.2,1) infinite',
                    pointerEvents: 'none',
                  }} />
                )}

                {/* Face circle */}
                <div style={{
                  width: '90px', height: '90px', borderRadius: '50%',
                  background: 'var(--avatar-bg)',
                  border: `3px solid ${speaking ? 'var(--accent-color)' : 'var(--accent-dim)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'border-color 0.25s ease, box-shadow 0.25s ease',
                  position: 'relative', flexDirection: 'column', gap: '0',
                }}>
                  {/* SVG Face */}
                  <svg width="54" height="54" viewBox="0 0 54 54" fill="none">
                    {/* Hair */}
                    <ellipse cx="27" cy="10" rx="17" ry="10" fill="#1a2840"/>
                    {/* Face */}
                    <ellipse cx="27" cy="28" rx="15" ry="18" fill="#f5c89a"/>
                    {/* Forehead hair line */}
                    <path d="M13 18 Q27 8 41 18" stroke="#2d3a52" strokeWidth="6" strokeLinecap="round" fill="none"/>
                    {/* Eyebrows */}
                    <path d="M18 19 Q21 17 24 19" stroke="#4a3520" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                    <path d="M30 19 Q33 17 36 19" stroke="#4a3520" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                    {/* Eyes */}
                    <ellipse cx="21" cy="23" rx="2.5" ry={speaking && mouthOpen ? "2.2" : "2.5"} fill="#2d1f14"/>
                    <ellipse cx="33" cy="23" rx="2.5" ry={speaking && mouthOpen ? "2.2" : "2.5"} fill="#2d1f14"/>
                    {/* Eye shine */}
                    <circle cx="22.2" cy="22" r="0.8" fill="white"/>
                    <circle cx="34.2" cy="22" r="0.8" fill="white"/>
                    {/* Nose */}
                    <path d="M25.5 27 Q27 30 28.5 27" stroke="#c99a7a" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
                    {/* Mouth - animated */}
                    {speaking && mouthOpen ? (
                      <ellipse cx="27" cy="35" rx="5" ry="3.5" fill="#8B3A3A"/>
                    ) : (
                      <path d="M22 34 Q27 37.5 32 34" stroke="#c27a5a" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
                    )}
                    {/* Shirt collar */}
                    <path d="M12 50 L20 40 L27 44 L34 40 L42 50" fill="#1a3a6a" stroke="#1a3a6a" strokeWidth="1"/>
                    {/* Tie */}
                    <path d="M25 42 L27 50 L29 42 L27 39Z" fill="#c0392b"/>
                  </svg>
                </div>

                {/* Status dot */}
                <div style={{
                  position: 'absolute', bottom: '2px', right: 'calc(50% - 48px)',
                  width: '14px', height: '14px', borderRadius: '50%',
                  background: status === 'processing' ? 'var(--status-warn)' : speaking ? 'var(--accent-color)' : 'var(--status-ok)',
                  border: '2px solid var(--body-bg-start)',
                  transition: 'all 0.3s ease',
                }} />
              </div>

              <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '2px' }}>คุณวีรพล</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--accent-color)', letterSpacing: '0.04em', marginBottom: '14px' }}>ฝ่ายบุคคล (HR)</div>

              {/* Sound wave bars when speaking */}
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '3px', height: '24px', marginBottom: '10px' }}>
                {[0.6, 1, 0.7, 1.3, 0.5, 1.1, 0.8].map((h, i) => (
                  <div key={i} style={{
                    width: '4px', borderRadius: '2px',
                    background: speaking ? 'var(--accent-color)' : 'var(--card-border)',
                    height: speaking ? `${h * 18}px` : '4px',
                    transition: 'height 0.15s ease, background 0.3s ease',
                    animation: speaking ? `soundBar 0.5s ease ${i * 0.07}s infinite alternate` : 'none',
                  }} />
                ))}
              </div>

              {/* Status text */}
              <div style={{ fontSize: '0.72rem', color: status === 'processing' ? 'var(--status-warn)' : speaking ? 'var(--accent-color)' : 'var(--text-muted)', transition: 'all 0.3s ease', marginBottom: '16px' }}>
                {status === 'processing' ? '⏳ กำลังคิดคำถาม...' : speaking ? '🔊 กำลังพูด...' : status === 'recording' ? '🎙️ กำลังฟัง...' : '🟢 พร้อมรับฟัง'}
              </div>

              {/* Tips */}
              <div style={{ padding: '12px', borderRadius: '12px', background: 'var(--accent-dim)', border: '1px solid var(--card-border)', textAlign: 'left' }}>
                <div style={{ fontSize: '0.67rem', color: 'var(--accent-color)', fontWeight: 700, marginBottom: '8px', letterSpacing: '0.06em' }}>💡 เคล็ดลับ</div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {['ตอบให้ชัดเจนตรงประเด็น', 'ยกตัวอย่างจากประสบการณ์', 'แสดงความคิดเชิงบวก'].map((tip, i) => (
                    <li key={i} style={{ fontSize: '0.67rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>• {tip}</li>
                  ))}
                </ul>
              </div>
              
              {/* Webcam Area */}
              <div style={{ marginTop: '20px', padding: '12px', borderRadius: '12px', background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
                <button 
                  onClick={toggleCamera} 
                  style={{ width: '100%', padding: '8px', borderRadius: '8px', background: camActive ? 'rgba(255, 77, 77, 0.15)' : 'rgba(38, 222, 129, 0.15)', color: camActive ? '#ff4d4d' : '#26de81', border: `1px solid ${camActive ? '#ff4d4d' : '#26de81'}`, fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', marginBottom: camActive ? '10px' : '0', transition: 'all 0.3s ease' }}
                >
                  <i className={`fa-solid ${camActive ? 'fa-video-slash' : 'fa-video'} mr-2`} />
                  {camActive ? 'ปิดกล้อง' : 'เปิดกล้อง (เสมือนจริง)'}
                </button>
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  style={{ width: '100%', borderRadius: '8px', display: camActive ? 'block' : 'none', transform: 'scaleX(-1)' }} 
                />
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
                background: 'var(--card-bg)',
                backdropFilter: 'blur(20px)',
                border: '1px solid var(--card-border)',
                padding: '24px',
                display: 'flex', flexDirection: 'column', gap: '16px',
                scrollbarWidth: 'thin',
                scrollbarColor: 'var(--accent-dim) transparent',
              }}
            >
              {messages.map((msg, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', flexDirection: msg.sender === 'ai' ? 'row' : 'row-reverse' }}>
                  {/* Avatar mini */}
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                    background: msg.sender === 'ai'
                      ? 'var(--card-bg)'
                      : 'linear-gradient(135deg, var(--accent-color), #ff4b00)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: msg.sender === 'ai' ? '0.9rem' : '0.85rem',
                    fontWeight: 900, color: msg.sender === 'ai' ? 'var(--text-main)' : 'var(--body-bg-start)',
                    border: msg.sender === 'ai' ? '1px solid var(--accent-dim)' : 'none',
                    boxShadow: msg.sender === 'ai' ? '0 0 8px var(--accent-dim)' : 'none',
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
                        ? 'var(--bubble-ai)'
                        : 'var(--bubble-user)',
                      border: msg.sender === 'ai'
                        ? '1px solid var(--accent-dim)'
                        : '1px solid var(--accent-dim)',
                      color: 'var(--text-main)',
                    }}
                    dangerouslySetInnerHTML={{ __html: formatMsg(msg.text) }}
                  />
                </div>
              ))}

              {/* Typing indicator */}
              {status === 'processing' && (
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--card-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', border: '1px solid var(--accent-dim)' }}>👔</div>
                  <div style={{ padding: '14px 20px', borderRadius: '4px 18px 18px 18px', background: 'var(--bubble-ai)', border: '1px solid var(--accent-dim)', display: 'flex', gap: '6px', alignItems: 'center' }}>
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
                    background: 'var(--card-bg)',
                    border: `1px solid ${status === 'recording' ? 'var(--status-warn)' : 'var(--card-border)'}`,
                    color: 'var(--text-main)', fontSize: '0.95rem', lineHeight: 1.6,
                    fontFamily: 'Kanit,sans-serif', resize: 'none', outline: 'none',
                    backdropFilter: 'blur(8px)',
                    transition: 'border-color 0.2s ease',
                  }}
                />
                {status === 'recording' && (
                  <div style={{ position: 'absolute', top: '50%', right: '14px', transform: 'translateY(-50%)', display: 'flex', gap: '3px', alignItems: 'center' }}>
                    {[0, 1, 2, 1, 0].map((h, i) => (
                      <div key={i} style={{ width: '3px', height: `${8 + h * 6}px`, borderRadius: '2px', background: 'var(--status-warn)', animation: `wave 0.6s ease ${i * 0.1}s infinite alternate` }} />
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
                    ? 'var(--status-warn)'
                    : 'var(--card-bg)',
                  border: `1px solid ${status === 'recording' ? 'var(--status-warn)' : 'var(--card-border)'}`,
                  color: status === 'recording' ? 'var(--text-main)' : 'var(--text-sub)',
                  fontSize: '1.2rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: status === 'recording' ? '0 0 16px var(--status-warn)' : 'none',
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
                    ? 'var(--accent-color)'
                    : 'var(--card-bg)',
                  color: inputText.trim() && status !== 'processing' ? 'var(--body-bg-start)' : 'var(--text-muted)',
                  fontFamily: 'Kanit,sans-serif', fontWeight: 700, fontSize: '0.9rem',
                  display: 'flex', alignItems: 'center', gap: '8px',
                  transition: 'all 0.3s ease',
                  border: '1px solid var(--card-border)',
                }}
              >
                <i className="fa-solid fa-paper-plane" />
                ส่ง
              </button>

              {/* Voice Mode toggle */}
              <button
                onClick={() => {
                  const newMode = !voiceMode;
                  setVoiceMode(newMode);
                  if (newMode) {
                    // Start first listen
                    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                    if (recognitionRef.current) {
                      try { recognitionRef.current.start(); } catch {}
                    }
                  } else {
                    // Stop listening
                    if (recognitionRef.current) {
                      try { recognitionRef.current.stop(); } catch {}
                    }
                  }
                }}
                title={voiceMode ? 'ปิดโหมดเสียง' : 'เปิดโหมดคุยด้วยเสียงได้เลย'}
                style={{
                  height: '50px', padding: '0 16px', borderRadius: '16px', flexShrink: 0,
                  cursor: 'pointer', fontFamily: 'Kanit,sans-serif', fontWeight: 700, fontSize: '0.82rem',
                  display: 'flex', alignItems: 'center', gap: '6px',
                  transition: 'all 0.3s ease',
                  background: voiceMode ? 'rgba(255, 75, 0, 0.15)' : 'rgba(38, 222, 129, 0.1)',
                  border: `1px solid ${voiceMode ? '#ff4b00' : '#26de81'}`,
                  color: voiceMode ? '#ff4b00' : '#26de81',
                  boxShadow: voiceMode ? '0 0 12px rgba(255,75,0,0.3)' : 'none',
                  animation: voiceMode ? 'pulse 1.5s ease infinite' : 'none',
                }}
              >
                <i className={`fa-solid ${voiceMode ? 'fa-comment-slash' : 'fa-comments'}`} />
                {voiceMode ? 'กำลังฟัง...' : 'คุยแบบเสียง'}
              </button>
            </div>

            {/* Hint */}
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center', margin: 0 }}>
              {voiceMode
                ? '🟢 โหมดคุยเสียงเปิดอยู่ — พูดออกมาเลย ระบบจะส่งให้ AI ตอบแล้วเปิดไมค์ต่อเองอัตโนมัติ'
                : 'Enter เพื่อส่ง  •  Shift+Enter ขึ้นบรรทัดใหม่  •  🎤 อัดเสียง  •  💬 คุยแบบเสียง'
              }
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
        @keyframes ping {
          0%   { transform: translate(-50%,-50%) scale(1);   opacity: 0.6; }
          100% { transform: translate(-50%,-50%) scale(1.5); opacity: 0; }
        }
        @keyframes soundBar {
          from { transform: scaleY(0.5); }
          to   { transform: scaleY(1.5); }
        }
        textarea::placeholder { color: rgba(255,255,255,0.25); }
        textarea:focus { border-color: rgba(255,122,0,0.4) !important; box-shadow: 0 0 0 2px rgba(255,122,0,0.08); }
      `}</style>
    </div>
  );
}

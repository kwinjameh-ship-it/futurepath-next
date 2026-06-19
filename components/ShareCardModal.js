'use client';
import { useState, useRef } from 'react';
import html2canvas from 'html2canvas';

const THEMES = {
  cyberpunk: {
    name: 'Cyberpunk',
    bg: 'linear-gradient(135deg, #1e0b2e 0%, #3a1c71 50%, #d76d77 100%)',
    border: 'linear-gradient(135deg, #ff7a00, #a55eea)',
    textMain: '#ffffff',
    textSub: 'rgba(255,255,255,0.8)',
    accent: '#ffb347',
    titleGradient: 'linear-gradient(135deg, #ff7a00 0%, #ffb347 100%)',
    cardBg: 'rgba(255,255,255,0.05)',
  },
  dark: {
    name: 'Dark Elegance',
    bg: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    border: 'linear-gradient(135deg, #334155, #475569)',
    textMain: '#ffffff',
    textSub: '#94a3b8',
    accent: '#2bcbba',
    titleGradient: 'linear-gradient(135deg, #2bcbba 0%, #81ecec 100%)',
    cardBg: 'rgba(255,255,255,0.03)',
  },
  minimal: {
    name: 'Light Minimal',
    bg: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    border: 'linear-gradient(135deg, #cbd5e1, #94a3b8)',
    textMain: '#0f172a',
    textSub: '#475569',
    accent: '#ff7a00',
    titleGradient: 'linear-gradient(135deg, #ff7a00 0%, #ff4b00 100%)',
    cardBg: 'rgba(255,255,255,0.6)',
  }
};

export default function ShareCardModal({ isOpen, onClose, user, dna }) {
  const [theme, setTheme] = useState('cyberpunk');
  const [image, setImage] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const cardRef = useRef(null);

  if (!isOpen) return null;

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setImage(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(cardRef.current, { scale: 4, useCORS: true, backgroundColor: null, logging: false });
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `MyDNA_${user?.name || 'Profile'}.png`;
      a.click();
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการสร้างรูปภาพ');
    }
    setDownloading(false);
  };

  const t = THEMES[theme];

  const normalizePct = (val) => {
    const n = parseFloat(val) || 0;
    return (n > 0 && n <= 1) ? parseFloat((n * 100).toFixed(1)) : parseFloat(n.toFixed(1));
  };

  const getTopSkills = () => {
    if (!dna?.scores) return [];
    const labels = {
      Tech: { label: 'เทคโนโลยี', icon: 'fas fa-microchip', bg: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800' },
      Logic: { label: 'ตรรกะ', icon: 'fas fa-brain', bg: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&q=80&w=800' },
      Creative: { label: 'ความคิดสร้างสรรค์', icon: 'fas fa-palette', bg: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=800' },
      Lead: { label: 'ภาวะผู้นำ', icon: 'fas fa-flag', bg: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=800' },
      Comm: { label: 'การสื่อสาร', icon: 'fas fa-comments', bg: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&q=80&w=800' },
      Biz: { label: 'ความเข้าใจธุรกิจ', icon: 'fas fa-chart-line', bg: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800' },
      Phys: { label: 'ปฏิบัติการและวินัย', icon: 'fas fa-running', bg: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800' },
      Emp: { label: 'จิตบริการ', icon: 'fas fa-hands-helping', bg: 'https://images.unsplash.com/photo-1552508744-1696d4464960?auto=format&fit=crop&q=80&w=800' }
    };
    const sc = dna.scores;
    const mapped = [
      { key: 'Tech', val: Number(sc.Tech || sc.tech || 0) },
      { key: 'Logic', val: Number(sc.Logic || sc.logic || 0) },
      { key: 'Creative', val: Number(sc.Creative || sc.creative || 0) },
      { key: 'Lead', val: Number(sc.Lead || sc.lead || 0) },
      { key: 'Comm', val: Number(sc.Comm || sc.comm || 0) },
      { key: 'Biz', val: Number(sc.Biz || sc.biz || 0) },
      { key: 'Phys', val: Number(sc.Phys || sc.phys || 0) },
      { key: 'Emp', val: Number(sc.Emp || sc.emp || 0) },
    ];
    mapped.sort((a,b) => b.val - a.val);
    return mapped.slice(0,3).map(s => ({ ...labels[s.key], score: s.val }));
  };

  const topSkills = getTopSkills();
  const matchPct = normalizePct(dna?.matchPct || '0');
  const mainBg = topSkills.length > 0 ? topSkills[0]?.bg : null;
  
  let statusBadge = "ผู้เริ่มต้นสำรวจ (Explorer)";
  if (matchPct >= 80) statusBadge = "ดาวรุ่งพุ่งแรง (High Potential)";
  else if (matchPct >= 60) statusBadge = "ผู้พัฒนาอย่างต่อเนื่อง (Rising Star)";

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', padding: '20px' }}>
      <div style={{ background: '#1e1b26', width: '100%', maxWidth: '900px', borderRadius: '24px', display: 'flex', flexDirection: 'row', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
        
        {/* Left Side: Controls */}
        <div style={{ flex: 1, padding: '32px', display: 'flex', flexDirection: 'column', overflowY: 'auto', maxHeight: '85vh' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: '#fff' }}>📸 Card Generator</h2>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.2rem' }}>
              <i className="fas fa-times"></i>
            </button>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#cbd5e1', fontWeight: 600, fontSize: '0.95rem' }}>1. อัปโหลดรูปโปรไฟล์ของคุณ</label>
            <div style={{ background: 'rgba(255,255,255,0.05)', border: '2px dashed rgba(255,255,255,0.2)', padding: '20px', borderRadius: '16px', textAlign: 'center', cursor: 'pointer' }}>
              <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} id="photo-upload" />
              <label htmlFor="photo-upload" style={{ cursor: 'pointer', color: '#ff7a00', fontWeight: 600, display: 'block' }}>
                <i className="fas fa-camera mr-2"></i> เลือกรูปภาพ
              </label>
            </div>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#cbd5e1', fontWeight: 600, fontSize: '0.95rem' }}>2. เลือกธีมการ์ด</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
              {Object.keys(THEMES).map(k => (
                <button 
                  key={k} 
                  onClick={() => setTheme(k)}
                  style={{
                    padding: '12px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                    background: theme === k ? 'rgba(255,122,0,0.15)' : 'rgba(255,255,255,0.05)',
                    border: theme === k ? '2px solid #ff7a00' : '2px solid transparent',
                    color: theme === k ? '#ff7a00' : '#fff',
                    textAlign: 'left'
                  }}
                >
                  <i className={theme === k ? "fas fa-check-circle mr-2" : "far fa-circle mr-2"}></i>
                  {THEMES[k].name}
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={handleDownload} 
            disabled={downloading}
            style={{ 
              marginTop: 'auto', padding: '16px', borderRadius: '16px', background: 'linear-gradient(135deg, #ff7a00, #ff4b00)', 
              color: '#fff', fontWeight: 800, border: 'none', cursor: downloading ? 'not-allowed' : 'pointer', fontSize: '1.1rem',
              boxShadow: '0 8px 24px rgba(255,122,0,0.4)'
            }}
          >
            {downloading ? <><i className="fas fa-spinner fa-spin mr-2"></i>กำลังสร้างการ์ด...</> : <><i className="fas fa-download mr-2"></i>ดาวน์โหลดการ์ด (PNG)</>}
          </button>
        </div>

        {/* Right Side: Preview */}
        <div style={{ flex: 1, background: '#121016', padding: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
          
          {/* Card Container (What will be captured) */}
          <div 
            ref={cardRef}
            style={{ 
              width: '500px', minHeight: '750px', background: t.bg, borderRadius: '24px', padding: '40px 32px',
              display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden',
              boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
            }}
          >

            <div style={{ position: 'relative', zIndex: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
              {/* Header */}
              <div style={{ textAlign: 'center', marginBottom: '24px', flexShrink: 0 }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: t.textSub, letterSpacing: '2px', textTransform: 'uppercase' }}>
                  <i className="fas fa-dna mr-2"></i> FuturePath DNA
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: t.textSub, marginTop: '6px', opacity: 0.8 }}>
                  ค้นพบตัวตน สู่เส้นทางอาชีพที่ใช่
                </div>
              </div>

              {/* Photo Area */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px', flexShrink: 0 }}>
                <div style={{ 
                  width: '160px', height: '160px', borderRadius: '50%', background: t.cardBg, 
                  border: `4px solid ${t.accent}`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                  boxShadow: `0 0 30px ${t.accent}40`, flexShrink: 0
                }}>
                  {image ? (
                    <div style={{ width: '100%', height: '100%', backgroundImage: `url(${image})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                  ) : (
                    <i className="fas fa-user-astronaut" style={{ fontSize: '4rem', color: t.textSub }}></i>
                  )}
                </div>
              </div>

              {/* Identity Info */}
              <div style={{ textAlign: 'center', marginBottom: '20px', flexShrink: 0 }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 600, color: t.textSub, marginBottom: '8px' }}>
                  {user?.name || 'นักสำรวจนิรนาม'}
                </div>
                <div style={{ 
                  fontSize: '1.6rem', fontWeight: 900, color: t.accent,
                  lineHeight: 1.3, marginBottom: '16px', textShadow: '0 2px 10px rgba(0,0,0,0.3)'
                }}>
                  {dna?.aiTitle || 'กำลังค้นหาตัวตน'}
                </div>
                {/* STATUS BADGE */}
                <div style={{ display: 'inline-flex', alignItems: 'center', background: `${t.accent}20`, padding: '8px 20px 12px 20px', borderRadius: '30px', border: `1px solid ${t.accent}50` }}>
                   <i className="fas fa-medal" style={{ color: t.accent, marginRight: '8px', marginTop: '4px' }}></i>
                   <span style={{ fontSize: '0.95rem', fontWeight: 700, color: t.textMain, marginTop: '4px' }}>{statusBadge}</span>
                </div>
              </div>

              {/* Bottom Data */}
              <div style={{ marginTop: 'auto', background: t.cardBg, padding: '16px', borderRadius: '20px', backdropFilter: 'blur(10px)', flexShrink: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '12px', borderBottom: `1px solid ${t.textSub}30`, paddingBottom: '12px' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: t.textSub, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>ความแมตช์โดยรวม</div>
                    <div style={{ fontSize: '2.4rem', fontWeight: 900, color: t.textMain, lineHeight: 1 }}>{matchPct}%</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <i className="fas fa-medal" style={{ fontSize: '3.5rem', color: t.accent }}></i>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: t.textSub, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>ทักษะโดดเด่น</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {topSkills.map((skill, idx) => {
                       const pct = normalizePct(skill.score);
                       return (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', background: `${t.accent}10`, padding: '10px 16px', borderRadius: '12px', border: `1px solid ${t.accent}30` }}>
                          <div style={{ flex: '0 0 45%', display: 'flex', alignItems: 'center', fontSize: '0.85rem', fontWeight: 600, color: t.textMain }}>
                            <i className={`${skill?.icon || 'fas fa-star'}`} style={{ color: t.accent, width: '20px', textAlign: 'center', marginRight: '8px' }}></i>
                            {skill?.label || skill.key}
                          </div>
                          <div style={{ flex: 1, background: 'rgba(0,0,0,0.3)', height: '6px', borderRadius: '4px', overflow: 'hidden', margin: '0 12px' }}>
                            <div style={{ width: `${Math.min(100, Math.max(0, pct))}%`, height: '100%', background: t.accent, borderRadius: '4px' }}></div>
                          </div>
                          <div style={{ flex: '0 0 15%', textAlign: 'right', fontSize: '0.8rem', fontWeight: 800, color: t.accent }}>
                            {pct}%
                          </div>
                        </div>
                       );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

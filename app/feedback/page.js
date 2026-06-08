'use client';
import { useState } from 'react';
import GlassNav from '@/components/GlassNav';
import useAuth from '@/lib/useAuth';

const FEEDBACK_URL =
  'https://script.google.com/macros/s/AKfycbxFcPBEtvQlnPs51nwASaSkKsAWQkmgO-mLJfii3tTevoZPB_WTp4HNpE7CAbf-hwTbnQ/exec';

const surveyData = [
  { category: 'หมวดที่ 1: การออกแบบและการใช้งาน (UI/UX)', icon: 'fa-palette', items: [
    { id: '1_1', text: 'ดีไซน์การออกแบบสวยงามและทันสมัย' },
    { id: '1_2', text: 'การจัดวางเมนูและหน้าต่างใช้งานง่าย ไม่ซับซ้อน' },
    { id: '1_3', text: 'การแสดงผลบนสมาร์ตโฟนและแท็บเล็ตใช้งานได้ดี' },
    { id: '1_4', text: 'การใช้กราฟหรือแผนผังแสดงข้อมูลดูเข้าใจง่าย' },
    { id: '1_5', text: 'ความยากง่ายในการทำแบบทดสอบหรือการกรอกข้อมูล' },
  ]},
  { category: 'หมวดที่ 2: ประสิทธิภาพและความเสถียรของระบบ', icon: 'fa-server', items: [
    { id: '2_1', text: 'ความเสถียรของระบบโดยรวม ไม่มีอาการค้าง' },
    { id: '2_2', text: 'ความเร็วในการโหลดข้อมูลและการประมวลผล' },
    { id: '2_3', text: 'ระบบจดจำสถานะสมาชิกและบันทึกข้อมูลได้แม่นยำ' },
    { id: '2_4', text: 'ความปลอดภัยของการล็อกอินและข้อมูลส่วนตัว' },
    { id: '2_5', text: 'การเข้าถึงลิงก์หรือเนื้อหาภายนอกทำได้อย่างถูกต้อง' },
  ]},
  { category: 'หมวดที่ 3: คุณภาพของ AI และเนื้อหา', icon: 'fa-brain', items: [
    { id: '3_1', text: 'ความแม่นยำและการวิเคราะห์ผลของระบบ AI' },
    { id: '3_2', text: 'แชทบอทให้คำปรึกษาและข้อมูลที่เป็นประโยชน์' },
    { id: '3_3', text: 'ข้อมูลเส้นทางอาชีพและแนวโน้มมีความชัดเจน' },
    { id: '3_4', text: 'คำแนะนำการพัฒนาทักษะ (Skill) ตรงกับความต้องการ' },
    { id: '3_5', text: 'ระบบช่วยให้คุณเห็นแนวทางพัฒนาตนเองได้จริง' },
  ]},
  { category: 'หมวดที่ 4: ความพึงพอใจโดยรวม', icon: 'fa-star', items: [
    { id: '4_1', text: 'ระบบการค้นหาข้อมูลอาชีพมีประสิทธิภาพ' },
    { id: '4_2', text: 'ระบบประเมินคะแนนทักษะมีรูปแบบที่เหมาะสม' },
    { id: '4_3', text: 'ฟังก์ชันการทำงานมีความหลากหลายและตอบโจทย์' },
    { id: '4_4', text: 'ความพึงพอใจในภาพรวมต่อแพลตฟอร์ม' },
    { id: '4_5', text: 'คุณจะแนะนำระบบนี้ให้แก่เพื่อนหรือคนรู้จักใช้งานต่อ' },
  ]},
];

const ratingLabels = ['น้อยที่สุด', 'น้อย', 'ปานกลาง', 'มาก', 'มากที่สุด'];
const ratingColors = ['#ff4d4d', '#ffa502', '#fed330', '#2bcbba', '#26de81'];

export default function FeedbackPage() {
  const { user, loading } = useAuth();
  const [ratings,    setRatings]    = useState({});
  const [comment,    setComment]    = useState('');
  const [submitting, setSubmitting] = useState(false);

  function setRating(id, val) { setRatings(prev => ({ ...prev, [id]: val })); }

  async function handleSubmit(e) {
    e.preventDefault();
    for (const cat of surveyData) {
      for (const item of cat.items) {
        if (!ratings[item.id]) {
          alert(`กรุณาตอบคำถามข้อ ${item.id.replace('_', '.')} ก่อนครับ`);
          return;
        }
      }
    }
    setSubmitting(true);
    const payload = { action: 'feedback', name: user.name, email: user.email, comment };
    surveyData.forEach(cat => cat.items.forEach(item => { payload[`q${item.id}`] = ratings[item.id] || ''; }));

    try {
      const res  = await fetch(FEEDBACK_URL, { method: 'POST', body: JSON.stringify(payload) });
      const data = await res.json();
      if (data.status === 'success') {
        alert('ขอบคุณสำหรับความคิดเห็นและการประเมินระบบครับ!');
        window.location.href = '/home';
      } else { alert('บันทึกไม่สำเร็จ: ' + data.message); }
    } catch { alert('เกิดข้อผิดพลาดในการเชื่อมต่อ'); }
    setSubmitting(false);
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Kanit,sans-serif', color: 'var(--text-sub)' }}>
      <i className="fas fa-spinner fa-spin mr-3" style={{ color: 'var(--accent-color)' }} /> กำลังโหลด...
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', paddingTop: '64px' }}>
      <div className="blob blob-1" /><div className="blob blob-2" />
      <GlassNav />

      <main style={{ maxWidth: '760px', margin: '0 auto', padding: '28px 20px 80px' }}>
        {/* Header */}
        <div
          style={{
            textAlign: 'center',
            padding: '40px 32px 32px',
            borderRadius: 'var(--r-xl)',
            marginBottom: '24px',
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(16px)',
            border: '1px solid var(--glass-border)',
          }}
        >
          <div
            style={{
              width: '56px', height: '56px', borderRadius: '16px',
              background: 'var(--accent-dim)', border: '1px solid rgba(255,122,0,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <i className="fa-solid fa-star" style={{ fontSize: '1.5rem', color: 'var(--accent-color)' }} />
          </div>
          <p className="section-eyebrow" style={{ marginBottom: '8px' }}>ช่วยเราพัฒนาระบบ</p>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 900, letterSpacing: '0.05em', marginBottom: '8px' }}>
            แบบประเมินความพึงพอใจ
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-sub)', fontWeight: 400 }}>
            ความคิดเห็นของคุณช่วยให้เราพัฒนา FUTUREPATH AI ได้ดียิ่งขึ้น
          </p>

          {/* Evaluator */}
          <div
            style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '12px 18px', borderRadius: 'var(--r-md)', marginTop: '20px',
              background: 'var(--accent-dim)', border: '1px solid rgba(255,122,0,0.25)',
              justifyContent: 'center',
            }}
          >
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=ff7a00&color=0c0a22&size=100&bold=true`}
              alt="Avatar"
              style={{ width: '36px', height: '36px', borderRadius: '50%', border: '2px solid var(--accent-color)' }}
            />
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', letterSpacing: '0.06em' }}>ผู้ประเมิน</p>
              <p style={{ fontWeight: 700, color: 'var(--accent-color)', fontSize: '0.97rem' }}>{user.name}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {surveyData.map(cat => (
            <div
              key={cat.category}
              style={{
                background: 'var(--glass-bg)',
                backdropFilter: 'blur(16px)',
                border: '1px solid var(--glass-border)',
                borderRadius: 'var(--r-lg)',
                overflow: 'hidden',
              }}
            >
              {/* Category Header */}
              <div
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '18px 24px',
                  background: 'rgba(255,122,0,0.04)',
                  borderBottom: '1px solid var(--glass-border)',
                }}
              >
                <div
                  style={{
                    width: '34px', height: '34px', borderRadius: '10px',
                    background: 'var(--accent-dim)', border: '1px solid rgba(255,122,0,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}
                >
                  <i className={`fa-solid ${cat.icon}`} style={{ color: 'var(--accent-color)', fontSize: '0.85rem' }} />
                </div>
                <h2
                  style={{
                    fontSize: '0.97rem', fontWeight: 700,
                    color: 'var(--accent-color)', letterSpacing: '0.02em', margin: 0,
                  }}
                >
                  {cat.category}
                </h2>
              </div>

              {/* Questions */}
              <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {cat.items.map(item => {
                  const displayId = item.id.replace('_', '.');
                  const selected  = ratings[item.id];
                  return (
                    <div key={item.id}>
                      <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '10px', lineHeight: 1.5 }}>
                        <span style={{ color: 'var(--accent-color)', fontWeight: 800 }}>{displayId}</span>
                        {' '}{item.text}
                      </p>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {[1, 2, 3, 4, 5].map(n => {
                          const isSelected = selected === String(n);
                          return (
                            <label
                              key={n}
                              style={{
                                flex: '1 1 60px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '10px 8px',
                                borderRadius: 'var(--r-md)',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                background: isSelected ? `${ratingColors[n-1]}18` : 'rgba(0,0,0,0.25)',
                                border: isSelected ? `1.5px solid ${ratingColors[n-1]}` : '1px solid rgba(255,255,255,0.08)',
                                boxShadow: isSelected ? `0 0 10px ${ratingColors[n-1]}30` : 'none',
                              }}
                            >
                              <input
                                type="radio"
                                name={`q${item.id}`}
                                value={n}
                                style={{ display: 'none' }}
                                onChange={() => setRating(item.id, String(n))}
                              />
                              <span
                                style={{
                                  fontWeight: isSelected ? 900 : 600,
                                  fontSize: '1.1rem',
                                  color: isSelected ? ratingColors[n-1] : 'var(--text-muted)',
                                  lineHeight: 1,
                                  transition: 'color 0.2s',
                                }}
                              >{n}</span>
                              <span
                                style={{
                                  fontSize: '0.65rem',
                                  color: isSelected ? ratingColors[n-1] : 'var(--text-muted)',
                                  fontWeight: isSelected ? 700 : 400,
                                  textAlign: 'center',
                                  lineHeight: 1.2,
                                  transition: 'color 0.2s',
                                }}
                              >{ratingLabels[n-1]}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Comment */}
          <div
            style={{
              background: 'var(--glass-bg)',
              backdropFilter: 'blur(16px)',
              border: '1px solid var(--glass-border)',
              borderRadius: 'var(--r-lg)',
              padding: '24px',
            }}
          >
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '12px' }}>
              <i className="fa-solid fa-comment-dots mr-2" style={{ color: 'var(--accent-color)' }} />
              ข้อเสนอแนะเพิ่มเติม
              <span style={{ fontWeight: 400, color: 'var(--text-muted)', marginLeft: '6px', fontSize: '0.8rem' }}>(ไม่บังคับ)</span>
            </label>
            <textarea
              className="fp-input"
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="พิมพ์ข้อเสนอแนะของคุณที่นี่..."
              style={{ resize: 'vertical', minHeight: '100px' }}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary"
            style={{ width: '100%', padding: '16px', fontSize: '1.05rem' }}
          >
            {submitting
              ? <><i className="fas fa-spinner fa-spin" /> กำลังบันทึก...</>
              : <><i className="fa-solid fa-paper-plane" /> ส่งแบบประเมิน</>
            }
          </button>
        </form>
      </main>
    </div>
  );
}

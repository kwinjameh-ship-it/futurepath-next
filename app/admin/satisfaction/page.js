'use client';
import { useEffect, useState } from 'react';

const surveyMap = {
  '1.1': 'ดีไซน์การออกแบบสวยงามและทันสมัย',
  '1.2': 'การจัดวางเมนูและหน้าต่างใช้งานง่าย ไม่ซับซ้อน',
  '1.3': 'การแสดงผลบนสมาร์ตโฟนและแท็บเล็ตใช้งานได้ดี',
  '1.4': 'การใช้กราฟหรือแผนผังแสดงข้อมูลดูเข้าใจง่าย',
  '1.5': 'ความยากง่ายในการทำแบบทดสอบหรือการกรอกข้อมูล',
  '2.1': 'ความเสถียรของระบบโดยรวม ไม่มีอาการค้าง',
  '2.2': 'ความเร็วในการโหลดข้อมูลและการประมวลผล',
  '2.3': 'ระบบจดจำสถานะสมาชิกและบันทึกข้อมูลได้แม่นยำ',
  '2.4': 'ความปลอดภัยของการล็อกอินและข้อมูลส่วนตัว',
  '2.5': 'การเข้าถึงลิงก์หรือเนื้อหาภายนอกทำได้อย่างถูกต้อง',
  '3.1': 'ความแม่นยำและการวิเคราะห์ผลของระบบ AI',
  '3.2': 'แชทบอทให้คำปรึกษาและข้อมูลที่เป็นประโยชน์',
  '3.3': 'ข้อมูลเส้นทางอาชีพและแนวโน้มมีความชัดเจน',
  '3.4': 'คำแนะนำการพัฒนาทักษะ (Skill) ตรงกับความต้องการ',
  '3.5': 'ระบบช่วยให้คุณเห็นแนวทางพัฒนาตนเองได้จริง',
  '4.1': 'ระบบการค้นหาข้อมูลอาชีพมีประสิทธิภาพ',
  '4.2': 'ระบบประเมินคะแนนทักษะมีรูปแบบที่เหมาะสม',
  '4.3': 'ฟังก์ชันการทำงานมีความหลากหลายและตอบโจทย์',
  '4.4': 'ความพึงพอใจในภาพรวมต่อแพลตฟอร์ม',
  '4.5': 'คุณจะแนะนำระบบนี้ให้แก่เพื่อนหรือคนรู้จักใช้งานต่อ'
};

const categoryMap = {
  '1': { title: 'หมวดที่ 1: การออกแบบและการใช้งาน (UI/UX)', icon: 'fa-palette', color: '#3b82f6' },
  '2': { title: 'หมวดที่ 2: ประสิทธิภาพและความเสถียรของระบบ', icon: 'fa-server', color: '#10b981' },
  '3': { title: 'หมวดที่ 3: คุณภาพของ AI และเนื้อหา', icon: 'fa-brain', color: '#8b5cf6' },
  '4': { title: 'หมวดที่ 4: ความพึงพอใจโดยรวม', icon: 'fa-star', color: '#f59e0b' }
};

export default function SatisfactionSurvey() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    // using proxy to avoid CORS
    fetch('/api/sheet-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'admin_get_survey' })
    })
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          // map question code to full text if possible
          const mapped = (data.questions || []).map(q => {
            const qCode = q.question.toString().trim();
            const fullText = surveyMap[qCode];
            const catId = qCode.charAt(0);
            return {
              ...q,
              displayTitle: fullText ? `${qCode} ${fullText}` : qCode,
              categoryId: catId
            };
          });
          
          // Group by category
          const grouped = {};
          mapped.forEach(q => {
            const cat = q.categoryId || 'other';
            if (!grouped[cat]) grouped[cat] = [];
            grouped[cat].push(q);
          });
          
          setQuestions(grouped);
        } else {
          setErrorMsg(data.message || 'เกิดข้อผิดพลาดในการดึงข้อมูล');
        }
      })
      .catch(err => {
        setErrorMsg(err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <i className="fa-solid fa-circle-notch fa-spin fa-2x" style={{ color: '#0ea5e9' }}></i>
      <span style={{ marginLeft: '12px', fontSize: '1.2rem', color: '#64748b' }}>กำลังโหลดข้อมูลแบบสอบถาม...</span>
    </div>
  );

  if (errorMsg) return (
    <div style={{ padding: '24px', background: '#fee2e2', color: '#b91c1c', borderRadius: '12px', margin: '24px' }}>
      <i className="fa-solid fa-triangle-exclamation mr-2"></i> {errorMsg}
    </div>
  );

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto', fontFamily: "'Kanit', sans-serif" }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px' }}>
        <div style={{ padding: '16px', background: 'linear-gradient(135deg, #f2709c 0%, #ff9472 100%)', borderRadius: '16px', color: 'white', marginRight: '20px', boxShadow: '0 10px 15px -3px rgba(255, 148, 114, 0.3)' }}>
          <i className="fa-solid fa-star fa-2x"></i>
        </div>
        <div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>ผลการประเมินความพึงพอใจรายข้อ</h1>
          <p style={{ margin: '4px 0 0 0', color: '#64748b' }}>ดูคะแนนเฉลี่ยและการกระจายตัวของคะแนน (1-5 ดาว) ในแต่ละคำถาม</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {Object.keys(questions).sort().map(catId => {
          const catInfo = categoryMap[catId] || { title: `หมวดอื่นๆ (${catId})`, icon: 'fa-list', color: '#64748b' };
          const catQuestions = questions[catId];
          
          return (
            <div key={catId} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', padding: '12px 20px', background: `${catInfo.color}15`, borderRadius: '12px', borderLeft: `4px solid ${catInfo.color}` }}>
                <i className={`fa-solid ${catInfo.icon} fa-lg`} style={{ color: catInfo.color, marginRight: '16px' }}></i>
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>{catInfo.title}</h2>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '20px' }}>
                {catQuestions.map((q, idx) => (
                  <div key={idx} style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#1e293b', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                      <span style={{ lineHeight: 1.4 }}>{q.displayTitle || q.question}</span>
                      <span style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap', background: '#fffbeb', padding: '4px 10px', borderRadius: '20px', fontSize: '0.95rem' }}>
                        <i className="fa-solid fa-star"></i> {q.average} <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>({q.total})</span>
                      </span>
                    </h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {[5, 4, 3, 2, 1].map(star => {
                        const count = q.tallies[star.toString()] || 0;
                        const pct = q.total > 0 ? (count / q.total) * 100 : 0;
                        return (
                          <div key={star} style={{ display: 'flex', alignItems: 'center', fontSize: '0.9rem' }}>
                            <div style={{ width: '50px', display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b' }}>
                              <span>{star}</span> <i className="fa-solid fa-star" style={{ color: '#cbd5e1', fontSize: '0.8rem' }}></i>
                            </div>
                            <div style={{ flex: 1, background: '#f1f5f9', height: '10px', borderRadius: '5px', overflow: 'hidden', margin: '0 12px' }}>
                              <div style={{ width: `${pct}%`, height: '100%', background: star >= 4 ? '#10b981' : star === 3 ? '#f59e0b' : '#ef4444', borderRadius: '5px', transition: 'width 1s ease-out' }}></div>
                            </div>
                            <div style={{ width: '45px', textAlign: 'right', color: '#475569', fontWeight: 500, fontSize: '0.85rem' }}>
                              {count} คน
                            </div>
                            <div style={{ width: '40px', textAlign: 'right', color: '#94a3b8', fontSize: '0.8rem' }}>
                              {pct.toFixed(0)}%
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        
        {Object.keys(questions).length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
            ไม่พบข้อมูลคำถาม โปรดตรวจสอบว่ามีผู้ทำแบบประเมินแล้วหรือไม่
          </div>
        )}
      </div>
    </div>
  );
}

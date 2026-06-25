'use client';
import { useEffect, useState } from 'react';

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
          setQuestions(data.questions || []);
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {questions.map((q, idx) => (
          <div key={idx} style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1e293b', marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
              <span>{idx + 1}. {q.question}</span>
              <span style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <i className="fa-solid fa-star"></i> {q.average} <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>({q.total} คน)</span>
              </span>
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[5, 4, 3, 2, 1].map(star => {
                const count = q.tallies[star.toString()] || 0;
                const pct = q.total > 0 ? (count / q.total) * 100 : 0;
                return (
                  <div key={star} style={{ display: 'flex', alignItems: 'center', fontSize: '0.9rem' }}>
                    <div style={{ width: '60px', display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b' }}>
                      <span>{star}</span> <i className="fa-solid fa-star" style={{ color: '#cbd5e1', fontSize: '0.8rem' }}></i>
                    </div>
                    <div style={{ flex: 1, background: '#f1f5f9', height: '12px', borderRadius: '6px', overflow: 'hidden', margin: '0 16px' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: star >= 4 ? '#10b981' : star === 3 ? '#f59e0b' : '#ef4444', borderRadius: '6px', transition: 'width 1s ease-out' }}></div>
                    </div>
                    <div style={{ width: '60px', textAlign: 'right', color: '#475569', fontWeight: 500 }}>
                      {count} คน
                    </div>
                    <div style={{ width: '50px', textAlign: 'right', color: '#94a3b8', fontSize: '0.8rem' }}>
                      {pct.toFixed(0)}%
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        {questions.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
            ไม่พบข้อมูลคำถาม โปรดตรวจสอบว่ามีผู้ทำแบบประเมินแล้วหรือไม่
          </div>
        )}
      </div>
    </div>
  );
}

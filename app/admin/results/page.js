'use client';
import { useEffect, useState } from 'react';

const GOOGLE_SCRIPT_URL = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL;

export default function AdminResults() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'admin_get_results' })
    })
      .then(r => r.json())
      .then(d => {
        if (d.status === 'success') setResults(d.results);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>กำลังโหลดข้อมูล...</div>;

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>ผลการประเมิน (Assessment Results)</h1>
        <p style={{ color: '#64748b' }}>ข้อมูลประวัติการทำแบบทดสอบของนักเรียน (คลิกที่แต่ละแถวเพื่อดูรายละเอียดทักษะ)</p>
      </div>

      <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '16px 24px', textAlign: 'left', color: '#475569', fontWeight: 600 }}>วันที่ทดสอบ</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', color: '#475569', fontWeight: 600 }}>ชื่อ - นามสกุล</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', color: '#475569', fontWeight: 600 }}>อีเมล</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', color: '#475569', fontWeight: 600 }}>ความแมตช์</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', color: '#475569', fontWeight: 600 }}>อาชีพที่ได้รับ</th>
            </tr>
          </thead>
          <tbody>
            {results.length === 0 ? (
              <tr><td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>ยังไม่มีข้อมูลผู้ทดสอบ</td></tr>
            ) : results.map((r, i) => (
              <tr 
                key={i} 
                onClick={() => setSelectedUser(r)}
                style={{ 
                  borderBottom: '1px solid #f1f5f9',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <td style={{ padding: '16px 24px', color: '#475569' }}>
                  {r.created_at ? new Date(r.created_at).toLocaleString('th-TH') : '-'}
                </td>
                <td style={{ padding: '16px 24px', color: '#0f172a', fontWeight: 500 }}>{r.name}</td>
                <td style={{ padding: '16px 24px', color: '#475569' }}>{r.email}</td>
                <td style={{ padding: '16px 24px' }}>
                  <span style={{ 
                    background: parseInt(r.match_pct) >= 80 ? '#dcfce7' : '#fef9c3', 
                    color: parseInt(r.match_pct) >= 80 ? '#166534' : '#854d0e',
                    padding: '4px 10px', 
                    borderRadius: '12px', 
                    fontSize: '0.85rem',
                    fontWeight: 600
                  }}>
                    {r.match_pct}%
                  </span>
                </td>
                <td style={{ padding: '16px 24px', color: '#0ea5e9', fontWeight: 600 }}>{r.ai_title}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedUser && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000
        }} onClick={() => setSelectedUser(null)}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            width: '90%',
            maxWidth: '560px',
            padding: '32px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>{selectedUser.name}</h2>
                <p style={{ color: '#64748b' }}><i className="fa-regular fa-envelope mr-2" />{selectedUser.email}</p>
              </div>
              <button onClick={() => setSelectedUser(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', color: '#94a3b8', cursor: 'pointer' }}>&times;</button>
            </div>

            <div style={{ background: '#f8fafc', padding: '16px 20px', borderRadius: '12px', marginBottom: '24px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '4px' }}>สายอาชีพที่ AI แนะนำ:</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0284c7' }}>{selectedUser.ai_title} <span style={{ fontSize: '1rem', color: '#16a34a', marginLeft: '8px' }}>({selectedUser.match_pct}% Match)</span></div>
            </div>

            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#334155', marginBottom: '16px' }}>ผลคะแนน 6 ทักษะหลัก</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { label: 'Technology', val: selectedUser.scores?.tech || 0, color: '#0ea5e9' },
                { label: 'Logic', val: selectedUser.scores?.logic || 0, color: '#8b5cf6' },
                { label: 'Creative', val: selectedUser.scores?.creative || 0, color: '#f43f5e' },
                { label: 'Leadership', val: selectedUser.scores?.lead || 0, color: '#f59e0b' },
                { label: 'Communication', val: selectedUser.scores?.comm || 0, color: '#10b981' },
                { label: 'Business', val: selectedUser.scores?.biz || 0, color: '#64748b' }
              ].map((skill, idx) => (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.9rem' }}>
                    <span style={{ fontWeight: 600, color: '#475569' }}>{skill.label}</span>
                    <span style={{ color: '#64748b' }}>{skill.val}%</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${skill.val}%`, height: '100%', background: skill.color, borderRadius: '4px', transition: 'width 1s ease' }} />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '32px', textAlign: 'center' }}>
              <button onClick={() => setSelectedUser(null)} style={{ padding: '10px 24px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

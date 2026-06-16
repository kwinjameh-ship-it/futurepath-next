'use client';
import { useEffect, useState, useRef } from 'react';
import {
  Chart, RadarController, RadialLinearScale,
  PointElement, LineElement, Filler, Tooltip, Legend,
} from 'chart.js';

Chart.register(RadarController, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const GOOGLE_SCRIPT_URL = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL;

// normalize: ถ้าค่าน้อยกว่า 1 (decimal เช่น 0.78) → คูณ 100 → 78
const normalizePct = (val) => {
  const n = parseFloat(val) || 0;
  return (n > 0 && n < 1) ? parseFloat((n * 100).toFixed(1)) : parseFloat(n.toFixed(1));
};

// cleanJobTitle: ตัด prefix "อันดับ X:"
const cleanJobTitle = (raw) => {
  if (!raw) return '-';
  // ตัด prefix เช่น "อันดับ 1: "
  return raw.replace(/^\u0e2d\u0e31\u0e19\u0e14\u0e31\u0e1a\s*\d+:\s*/i, '').trim();
};

const SKILLS = [
  { key: 'tech',     label: 'เทคโนโลยี',    icon: '💻', color: '#0ea5e9' },
  { key: 'logic',    label: 'การวิเคราะห์',  icon: '🧠', color: '#8b5cf6' },
  { key: 'creative', label: 'สร้างสรรค์',    icon: '🎨', color: '#f43f5e' },
  { key: 'lead',     label: 'ภาวะผู้นำ',     icon: '🏆', color: '#f59e0b' },
  { key: 'comm',     label: 'การสื่อสาร',    icon: '💬', color: '#10b981' },
  { key: 'biz',      label: 'ธุรกิจ',        icon: '📊', color: '#64748b' },
];

const getTier = (pct) => {
  if (pct >= 85) return { label: 'ดีเยี่ยม', bg: '#dcfce7', color: '#166534' };
  if (pct >= 70) return { label: 'ดี',       bg: '#dbeafe', color: '#1e40af' };
  if (pct >= 55) return { label: 'พอใช้',    bg: '#fef9c3', color: '#854d0e' };
  return              { label: 'ต้องพัฒนา', bg: '#fee2e2', color: '#991b1b' };
};

function RadarModal({ user, onClose }) {
  const radarRef = useRef(null);
  const chartRef = useRef(null);

  const scores = SKILLS.map(s => normalizePct(user.scores?.[s.key]));
  const matchPct = normalizePct(user.match_pct);
  const tier = getTier(matchPct);
  const topSkill = SKILLS.reduce((a, s, i) => scores[i] > scores[SKILLS.indexOf(a)] ? s : a, SKILLS[0]);

  useEffect(() => {
    if (!radarRef.current) return;
    if (chartRef.current) chartRef.current.destroy();
    chartRef.current = new Chart(radarRef.current, {
      type: 'radar',
      data: {
        labels: SKILLS.map(s => s.label),
        datasets: [{
          label: 'คะแนนทักษะ (%)',
          data: scores,
          backgroundColor: 'rgba(56,189,248,0.15)',
          borderColor: '#38bdf8',
          borderWidth: 2.5,
          pointBackgroundColor: SKILLS.map(s => s.color),
          pointBorderColor: '#fff',
          pointRadius: 5,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            min: 0, max: 100,
            ticks: { stepSize: 25, color: '#94a3b8', backdropColor: 'transparent', font: { size: 10 } },
            pointLabels: { color: '#334155', font: { family: 'Kanit', size: 11, weight: '600' } },
            grid: { color: 'rgba(0,0,0,0.06)' },
            angleLines: { color: 'rgba(0,0,0,0.06)' },
          },
        },
        plugins: { legend: { display: false } },
      },
    });
    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, [user]);

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}
      onClick={onClose}
    >
      <div
        style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 32px 64px rgba(0,0,0,0.25)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg,#0f172a,#1e293b)', padding: '28px 28px 24px', borderRadius: '20px 20px 0 0', color: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', letterSpacing: '0.1em', marginBottom: '6px' }}>ผลการประเมินทักษะ</div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 4px', color: '#f1f5f9' }}>{user.name}</h2>
              <p style={{ color: '#64748b', margin: 0, fontSize: '0.88rem' }}>
                <i className="fa-regular fa-envelope" style={{ marginRight: '6px' }} />{user.email}
              </p>
            </div>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: '#94a3b8', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>✕</button>
          </div>

          {/* Match + AI Title */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '20px', flexWrap: 'wrap' }}>
            <div style={{ background: 'rgba(56,239,125,0.12)', border: '1px solid rgba(56,239,125,0.3)', borderRadius: '12px', padding: '12px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '90px' }}>
              <span style={{ fontSize: '1.8rem', fontWeight: 900, color: '#38ef7d', lineHeight: 1 }}>{matchPct}%</span>
              <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>ความแมตช์</span>
            </div>
            <div style={{ flex: 1, background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.25)', borderRadius: '12px', padding: '12px 16px' }}>
              <div style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: '4px' }}>🎯 อาชีพที่ AI แนะนำ</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#38bdf8' }} title={user.ai_title}>{cleanJobTitle(user.ai_title)}</div>
            </div>
            <div style={{ background: tier.bg, borderRadius: '12px', padding: '12px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'center', border: `1px solid ${tier.color}22` }}>
              <div style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: '4px' }}>ระดับ</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: tier.color }}>{tier.label}</div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '24px 28px 28px' }}>
          {/* Radar + Top skill highlight */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
            {/* Radar */}
            <div>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 12px' }}>แผนภูมิทักษะ</h3>
              <div style={{ height: '210px' }}>
                <canvas ref={radarRef} />
              </div>
            </div>
            {/* Highlight cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', justifyContent: 'center' }}>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 4px' }}>สรุปทักษะ</h3>
              {/* Top */}
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '12px 14px' }}>
                <div style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 700, marginBottom: '4px' }}>🏆 จุดแข็ง</div>
                <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>{topSkill.icon} {topSkill.label}</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#16a34a' }}>{normalizePct(user.scores?.[topSkill.key])}%</div>
              </div>
              {/* Bottom */}
              {(() => {
                const minIdx = scores.indexOf(Math.min(...scores));
                const lowSkill = SKILLS[minIdx];
                return (
                  <div style={{ background: '#fefce8', border: '1px solid #fde68a', borderRadius: '10px', padding: '12px 14px' }}>
                    <div style={{ fontSize: '0.72rem', color: '#854d0e', fontWeight: 700, marginBottom: '4px' }}>📈 ควรพัฒนา</div>
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>{lowSkill.icon} {lowSkill.label}</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#d97706' }}>{scores[minIdx]}%</div>
                  </div>
                );
              })()}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '10px 14px', fontSize: '0.8rem', color: '#64748b' }}>
                📅 ทดสอบเมื่อ: <strong>{user.created_at ? new Date(user.created_at).toLocaleString('th-TH') : '-'}</strong>
              </div>
            </div>
          </div>

          {/* 6 Skill Progress Bars */}
          <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 14px' }}>คะแนนรายด้าน</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {SKILLS.map((skill, idx) => {
              const pct = scores[idx];
              const t = getTier(pct);
              return (
                <div key={skill.key} style={{ background: '#f8fafc', borderRadius: '10px', padding: '12px 16px', border: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>{skill.icon} {skill.label}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ background: t.bg, color: t.color, padding: '2px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700 }}>{t.label}</span>
                      <span style={{ fontWeight: 800, color: skill.color, fontSize: '1rem', minWidth: '44px', textAlign: 'right' }}>{pct}%</span>
                    </div>
                  </div>
                  <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', background: `linear-gradient(90deg, ${skill.color}, ${skill.color}aa)`, borderRadius: '4px', transition: 'width 0.8s ease' }} />
                  </div>
                </div>
              );
            })}
          </div>

          <button onClick={onClose} style={{ width: '100%', marginTop: '24px', padding: '12px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem', fontFamily: 'Kanit, sans-serif' }}>
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminResults() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST', mode: 'cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'admin_get_results' })
    })
      .then(r => r.json())
      .then(d => { if (d.status === 'success') setResults(d.results); setLoading(false); });
  }, []);

  const filtered = results.filter(r =>
    !search || r.name?.toLowerCase().includes(search.toLowerCase()) || r.email?.toLowerCase().includes(search.toLowerCase()) || r.ai_title?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}><i className="fa-solid fa-circle-notch fa-spin" style={{ marginRight: '8px' }} />กำลังโหลดข้อมูล...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>ผลการประเมิน</h1>
          <p style={{ color: '#64748b', margin: 0 }}>คลิกที่ชื่อนักเรียนเพื่อดูผลรายละเอียด — ทั้งหมด {results.length} คน</p>
        </div>
        {/* Search */}
        <div style={{ position: 'relative' }}>
          <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '0.85rem' }} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="ค้นหาชื่อ / อีเมล / อาชีพ..."
            style={{ paddingLeft: '36px', paddingRight: '16px', paddingTop: '10px', paddingBottom: '10px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '0.9rem', width: '260px', fontFamily: 'Kanit,sans-serif', outline: 'none' }}
          />
        </div>
      </div>

      <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
              <th style={{ padding: '14px 20px', textAlign: 'left', color: '#475569', fontWeight: 700, fontSize: '0.82rem', letterSpacing: '0.05em' }}>วันที่ทดสอบ</th>
              <th style={{ padding: '14px 20px', textAlign: 'left', color: '#475569', fontWeight: 700, fontSize: '0.82rem', letterSpacing: '0.05em' }}>ชื่อ – นามสกุล</th>
              <th style={{ padding: '14px 20px', textAlign: 'left', color: '#475569', fontWeight: 700, fontSize: '0.82rem', letterSpacing: '0.05em' }}>อีเมล</th>
              <th style={{ padding: '14px 20px', textAlign: 'center', color: '#475569', fontWeight: 700, fontSize: '0.82rem', letterSpacing: '0.05em' }}>ความแมตช์</th>
              <th style={{ padding: '14px 20px', textAlign: 'left', color: '#475569', fontWeight: 700, fontSize: '0.82rem', letterSpacing: '0.05em' }}>อาชีพที่ได้รับ</th>
              <th style={{ padding: '14px 20px', textAlign: 'center', color: '#475569', fontWeight: 700, fontSize: '0.82rem', letterSpacing: '0.05em' }}>รายละเอียด</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>ไม่พบข้อมูล</td></tr>
            ) : filtered.map((r, i) => {
              const pct = normalizePct(r.match_pct);
              const tier = getTier(pct);
              return (
                <tr key={i}
                  style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '14px 20px', color: '#64748b', fontSize: '0.85rem' }}>
                    {r.created_at ? new Date(r.created_at).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' }) : '-'}
                  </td>
                  {/* ชื่อ — คลิกได้ */}
                  <td style={{ padding: '14px 20px' }}>
                    <button
                      onClick={() => setSelectedUser(r)}
                      style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontWeight: 700, color: '#0f172a', fontSize: '0.95rem', fontFamily: 'Kanit,sans-serif', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg,#0ea5e9,#8b5cf6)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>
                        {(r.name || '?').charAt(r.name?.indexOf(' ') > 0 ? r.name.indexOf(' ') + 1 : 0) || '?'}
                      </span>
                      <span style={{ borderBottom: '1.5px dashed #0ea5e9', color: '#0284c7' }}>{r.name}</span>
                    </button>
                  </td>
                  <td style={{ padding: '14px 20px', color: '#64748b', fontSize: '0.88rem' }}>{r.email}</td>
                  <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                    <span style={{ background: tier.bg, color: tier.color, padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700 }}>
                      {pct}%
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#eff6ff', color: '#1d4ed8', padding: '5px 12px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 700 }}
                    >
                      🎯 {cleanJobTitle(r.ai_title)}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                    <button
                      onClick={() => setSelectedUser(r)}
                      style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, color: '#475569', display: 'inline-flex', alignItems: 'center', gap: '4px', fontFamily: 'Kanit,sans-serif' }}
                    >
                      <i className="fa-solid fa-chart-radar" style={{ fontSize: '0.75rem' }} /> ดูผล
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selectedUser && <RadarModal user={selectedUser} onClose={() => setSelectedUser(null)} />}
    </div>
  );
}

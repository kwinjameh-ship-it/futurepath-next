'use client';
import { useEffect, useState, useRef } from 'react';
import {
  Chart, RadarController, RadialLinearScale,
  PointElement, LineElement, Filler, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement, ArcElement
} from 'chart.js';

Chart.register(RadarController, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend, CategoryScale, LinearScale, BarElement, ArcElement);

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxpQPsyzmtqFyc-VDB5LPt4UbGcsGwCzl_rFkN1ePJ_dWeWnrs40SJ9lxKkWlkKIKSo7Q/exec';

const SKILLS = [
  { key: 'tech',     label: 'เทคโนโลยี',    icon: '💻', color: '#0ea5e9' },
  { key: 'logic',    label: 'การวิเคราะห์',  icon: '🧠', color: '#8b5cf6' },
  { key: 'creative', label: 'สร้างสรรค์',    icon: '🎨', color: '#f43f5e' },
  { key: 'lead',     label: 'ภาวะผู้นำ',     icon: '🏆', color: '#f59e0b' },
  { key: 'comm',     label: 'การสื่อสาร',    icon: '💬', color: '#10b981' },
  { key: 'biz',      label: 'ธุรกิจ',        icon: '📊', color: '#64748b' },
  { key: 'phys',     label: 'ปฏิบัติการ',    icon: '🏃', color: '#14b8a6' },
  { key: 'emp',      label: 'จิตบริการ',     icon: '❤️', color: '#ec4899' },
];

const normalizePct = (val) => {
  const n = parseFloat(val) || 0;
  return (n > 0 && n <= 1) ? parseFloat((n * 100).toFixed(1)) : parseFloat(n.toFixed(1));
};

const STATUS_MAP = {
  high:     { label: 'ดาวรุ่งพุ่งแรง',     color: '#059669', bg: '#d1fae5', border: '#a7f3d0' },
  rising:   { label: 'ผู้พัฒนาต่อเนื่อง',  color: '#d97706', bg: '#fef3c7', border: '#fde68a' },
  explorer: { label: 'ผู้เริ่มต้นสำรวจ',   color: '#475569', bg: '#f1f5f9', border: '#e2e8f0' },
};

export default function SchoolCommandCenter() {
  const [studentsData, setStudentsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  const [selectedSchool, setSelectedSchool] = useState('');
  const [selectedGrade, setSelectedGrade]   = useState('all');
  const [selectedSkill, setSelectedSkill]   = useState(null);
  const [searchQuery, setSearchQuery]       = useState('');
  const [hoveredStudent, setHoveredStudent] = useState(null);
  const [activeTab, setActiveTab]           = useState('overview');
  const radarRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // ใช้ POST แบบเดียวกับหน้า admin ปกติ
        const res = await fetch(GOOGLE_SCRIPT_URL, {
          method: 'POST',
          mode: 'cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action: 'admin_get_results' })
        });
        const data = await res.json();
        
        if (data.status === 'success') {
          const formatted = (data.results || []).map(st => {
            const mp = normalizePct(st.match_pct);
            let status = 'explorer';
            if (mp >= 80) status = 'high';
            else if (mp >= 60) status = 'rising';
            
            return {
              // admin_get_results ส่ง field: id, name, email, match_pct, ai_title, scores, created_at
              // ถ้า sheet มีคอลัมน์ school_code มันจะติดมาด้วย (เช็คทั้ง school และ school_code)
              school: (st.school || st.school_code || '').toString().trim(),
              name: st.name || '-',
              email: st.email || '-',
              match_pct: mp,
              ai_title: st.ai_title || '-',
              scores: st.scores || {},
              grade: st.grade || 'ทุกชั้นเรียน',
              status: status
            };
          }).filter(st => st.school !== ''); // เอาเฉพาะคนที่มีชื่อโรงเรียน

          setStudentsData(formatted);
          if (formatted.length > 0) {
            const uniqueSchools = [...new Set(formatted.map(s => s.school))];
            setSelectedSchool(uniqueSchools[0]);
          }
        } else {
          setErrorMsg(data.message || 'เกิดข้อผิดพลาดจาก API');
        }
      } catch (err) {
        console.error("Failed to load school data:", err);
        setErrorMsg(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const schools = [...new Set(studentsData.map(s => s.school))];
  const studentsInSchool = studentsData.filter(s => s.school === selectedSchool);
  const grades = ['all', ...new Set(studentsInSchool.map(s => s.grade))];
  
  const filtered = studentsInSchool.filter(s =>
    (selectedGrade === 'all' || s.grade === selectedGrade) &&
    (!searchQuery || s.name.includes(searchQuery) || s.ai_title.includes(searchQuery))
  );

  const avgSkills = SKILLS.map(sk => {
    const avg = filtered.reduce((sum, st) => sum + normalizePct(st.scores[sk.key] || 0), 0) / (filtered.length || 1);
    return { ...sk, score: Math.round(avg) };
  });

  const totalStudents  = filtered.length;
  const avgMatch       = Math.round(filtered.reduce((s, st) => s + st.match_pct, 0) / (filtered.length || 1));
  const highCount      = filtered.filter(s => s.status === 'high').length;
  const topSkill       = [...avgSkills].sort((a, b) => b.score - a.score)[0];
  const lowSkill       = [...avgSkills].sort((a, b) => a.score - b.score)[0];

  const careerDist = filtered.reduce((acc, s) => {
    acc[s.ai_title] = (acc[s.ai_title] || 0) + 1;
    return acc;
  }, {});
  const topCareers = Object.entries(careerDist).sort((a,b) => b[1]-a[1]).slice(0,5);

  useEffect(() => {
    if (!radarRef.current || loading || totalStudents === 0) return;
    if (chartRef.current) chartRef.current.destroy();
    chartRef.current = new Chart(radarRef.current, {
      type: 'radar',
      data: {
        labels: avgSkills.map(s => s.label),
        datasets: [{
          label: 'ค่าเฉลี่ยทั้งกลุ่ม (%)',
          data: avgSkills.map(s => s.score),
          backgroundColor: 'rgba(99, 102, 241, 0.15)',
          borderColor: '#6366f1', borderWidth: 2.5,
          pointBackgroundColor: avgSkills.map(s => s.color),
          pointBorderColor: '#fff', pointBorderWidth: 2, pointRadius: 5,
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        scales: {
          r: {
            min: 0, max: 100, beginAtZero: true,
            ticks: { stepSize: 25, color: '#64748b', backdropColor: 'transparent', font: { size: 10 } },
            pointLabels: { color: '#475569', font: { family: 'Kanit', size: 12, weight: '600' } },
            grid: { color: '#e2e8f0' }, angleLines: { color: '#e2e8f0' },
          },
        },
        plugins: { legend: { display: false } },
      },
    });
    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, [filtered, selectedGrade, loading]);

  const S = {
    card: { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' },
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', fontFamily: "'Kanit', sans-serif" }}>
        <i className="fas fa-circle-notch fa-spin" style={{ fontSize: '3rem', color: '#6366f1', marginBottom: '16px' }}></i>
        <h2 style={{ color: '#0f172a', fontWeight: 700 }}>กำลังดึงข้อมูล School Command Center...</h2>
        <p style={{ color: '#64748b' }}>กรุณารอสักครู่</p>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', fontFamily: "'Kanit', sans-serif" }}>
        <div style={{ width: '64px', height: '64px', background: '#fee2e2', color: '#ef4444', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', marginBottom: '16px' }}>⚠️</div>
        <h2 style={{ color: '#0f172a', fontWeight: 700 }}>เกิดข้อผิดพลาด</h2>
        <p style={{ color: '#ef4444', fontWeight: 600, textAlign: 'center', maxWidth: '500px' }}>{errorMsg}</p>
      </div>
    );
  }

  if (schools.length === 0) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', fontFamily: "'Kanit', sans-serif" }}>
        <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🏫</div>
        <h2 style={{ color: '#0f172a', fontWeight: 700 }}>ยังไม่มีข้อมูลโรงเรียนในระบบ</h2>
        <p style={{ color: '#64748b', textAlign: 'center', maxWidth: '400px' }}>
          ดูเหมือนว่ายังไม่มีนักเรียนที่ระบุชื่อโรงเรียนมาในระบบ<br/>
          ลองให้นักเรียนสมัครและทำแบบทดสอบโดยกรอกชื่อโรงเรียนด้วยครับ
        </p>
      </div>
    );
  }

  return (
    <div className="admin-container" style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'Kanit', sans-serif", color: '#0f172a' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '40px 24px' }}>

        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '36px', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', color: 'white', boxShadow: '0 4px 10px rgba(99,102,241,0.3)' }}>🏫</div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#6366f1', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>FuturePath DNA</div>
                <h1 style={{ fontSize: '1.9rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>School Command Center</h1>
              </div>
            </div>
            <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0 }}>ศูนย์บัญชาการข้อมูลโรงเรียน — วิเคราะห์ศักยภาพนักเรียนแบบเรียลไทม์</p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#e0e7ff', border: '1px solid #c7d2fe', borderRadius: '12px', padding: '4px 12px' }}>
              <i className="fas fa-building" style={{ color: '#4f46e5' }}></i>
              <select value={selectedSchool} onChange={e => { setSelectedSchool(e.target.value); setSelectedGrade('all'); }}
                style={{ background: 'transparent', border: 'none', color: '#4f46e5', fontWeight: 700, fontSize: '0.95rem', outline: 'none', cursor: 'pointer', padding: '6px 4px' }}>
                {schools.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div style={{ position: 'relative' }}>
              <i className="fas fa-search" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '0.85rem' }}></i>
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="ค้นหานักเรียน..."
                style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '10px 16px 10px 36px', color: '#0f172a', fontSize: '0.9rem', outline: 'none', width: '200px' }} />
            </div>
          </div>
        </div>

        {/* STAT CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
          {[
            { icon: '👨‍🎓', label: 'นักเรียนทั้งหมด', value: totalStudents, unit: 'คน', grad: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', shadow: 'rgba(99,102,241,0.3)' },
            { icon: '🎯', label: 'แมตช์เฉลี่ย', value: `${avgMatch}%`, unit: '', grad: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)', shadow: 'rgba(168,85,247,0.3)' },
            { icon: '⭐', label: 'ดาวรุ่งพุ่งแรง', value: highCount, unit: 'คน', grad: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)', shadow: 'rgba(20,184,166,0.3)' },
            { icon: '🏆', label: 'ทักษะโดดเด่น', value: topSkill?.label || '-', unit: `${topSkill?.score || 0}%`, grad: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', shadow: 'rgba(245,158,11,0.3)' },
          ].map((c, i) => (
            <div key={i} style={{ background: c.grad, borderRadius: '18px', padding: '22px', color: 'white', boxShadow: `0 10px 15px -3px ${c.shadow}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 500, opacity: 0.9, marginBottom: '8px' }}>{c.label}</div>
                  <div style={{ fontSize: c.value?.toString().length > 6 ? '1.5rem' : '2.5rem', fontWeight: 800, lineHeight: 1 }}>{c.value}</div>
                  {c.unit && <div style={{ fontSize: '0.85rem', opacity: 0.9, marginTop: '4px' }}>{c.unit}</div>}
                </div>
                <div style={{ padding: '12px', background: 'rgba(255,255,255,0.2)', borderRadius: '12px', fontSize: '1.2rem' }}>{c.icon}</div>
              </div>
            </div>
          ))}
        </div>

        {/* TABS */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', background: '#e2e8f0', borderRadius: '12px', padding: '4px', width: 'fit-content' }}>
          {[
            { id: 'overview', icon: 'fa-chart-pie', label: 'ภาพรวม' },
            { id: 'students', icon: 'fa-users', label: 'รายบุคคล' },
            { id: 'skills',   icon: 'fa-dna',   label: 'ทักษะ DNA' },
          ].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              style={{ background: activeTab === t.id ? '#fff' : 'transparent', border: 'none', color: activeTab === t.id ? '#6366f1' : '#64748b', borderRadius: '8px', padding: '8px 20px', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: "'Kanit', sans-serif", boxShadow: activeTab === t.id ? '0 2px 4px rgba(0,0,0,0.05)' : 'none' }}>
              <i className={`fas ${t.icon}`}></i> {t.label}
            </button>
          ))}
        </div>

        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
            <div style={S.card}>
              <h3 style={{ fontWeight: 700, marginBottom: '4px', fontSize: '1.1rem', color: '#0f172a' }}>🧬 School DNA — ทักษะเฉลี่ย</h3>
              <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '16px' }}>
                จุดแข็ง: <span style={{ color: '#0ea5e9', fontWeight: 700 }}>{topSkill?.icon} {topSkill?.label} ({topSkill?.score}%)</span>
                &nbsp;·&nbsp; พัฒนา: <span style={{ color: '#f59e0b', fontWeight: 700 }}>{lowSkill?.icon} {lowSkill?.label} ({lowSkill?.score}%)</span>
              </p>
              <div style={{ height: '280px' }}>
                {totalStudents > 0 ? <canvas ref={radarRef} /> : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>ไม่มีข้อมูล</div>}
              </div>
            </div>
            <div style={S.card}>
              <h3 style={{ fontWeight: 700, marginBottom: '16px', fontSize: '1.1rem', color: '#0f172a' }}>🏆 กลุ่มอาชีพยอดนิยม</h3>
              {topCareers.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {topCareers.map(([career, count], i) => {
                    const pct = Math.round((count / totalStudents) * 100);
                    const colors = ['#6366f1','#8b5cf6','#ec4899','#f43f5e','#f59e0b'];
                    return (
                      <div key={i}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#334155' }}>{career}</span>
                          <span style={{ fontSize: '0.85rem', color: colors[i], fontWeight: 700 }}>{count} คน ({pct}%)</span>
                        </div>
                        <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: colors[i], borderRadius: '4px' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : <div style={{ color: '#94a3b8', textAlign: 'center', padding: '40px 0' }}>ไม่มีข้อมูลอาชีพ</div>}
              {totalStudents > 0 && (
                <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
                  <h4 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '12px', color: '#475569' }}>🎖️ การกระจายระดับนักเรียน</h4>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {Object.entries(STATUS_MAP).map(([key, s]) => {
                      const cnt = filtered.filter(st => st.status === key).length;
                      return (
                        <div key={key} style={{ flex: 1, background: s.bg, border: `1px solid ${s.border}`, borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
                          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: s.color }}>{cnt}</div>
                          <div style={{ fontSize: '0.75rem', color: s.color, fontWeight: 600, marginTop: '4px' }}>{s.label}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STUDENTS */}
        {activeTab === 'students' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filtered.length > 0 ? filtered.map((st, i) => {
              const sv = STATUS_MAP[st.status];
              const isHovered = hoveredStudent === i;
              return (
                <div key={i} onMouseEnter={() => setHoveredStudent(i)} onMouseLeave={() => setHoveredStudent(null)}
                  style={{ ...S.card, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap', cursor: 'pointer', transition: 'all 0.25s', transform: isHovered ? 'translateX(6px)' : 'none', borderColor: isHovered ? '#6366f1' : '#e2e8f0' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: sv.bg, color: sv.color, border: `1px solid ${sv.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 700, flexShrink: 0 }}>
                    {st.name.charAt(0)}
                  </div>
                  <div style={{ flex: 1, minWidth: '180px' }}>
                    <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#0f172a' }}>{st.name}</div>
                    <div style={{ fontSize: '0.85rem', color: '#6366f1', fontWeight: 600 }}>{st.ai_title}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>{st.grade}</div>
                  </div>
                  <div style={{ textAlign: 'center', minWidth: '70px', padding: '0 16px', borderLeft: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: st.match_pct >= 80 ? '#059669' : st.match_pct >= 60 ? '#d97706' : '#64748b', lineHeight: 1 }}>{st.match_pct}%</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>ความเข้ากันได้</div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '8px', minWidth: '220px' }}>
                    {SKILLS.map(sk => {
                      const v = normalizePct(st.scores[sk.key] || 0);
                      return (
                        <div key={sk.key} title={`${sk.label}: ${v}%`}>
                          <div style={{ fontSize: '0.7rem', color: '#64748b', textAlign: 'center', marginBottom: '4px' }}>{sk.icon}</div>
                          <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${v}%`, height: '100%', background: sk.color, borderRadius: '3px' }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ background: sv.bg, border: `1px solid ${sv.border}`, color: sv.color, borderRadius: '20px', padding: '6px 14px', fontSize: '0.8rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
                    {sv.label}
                  </div>
                </div>
              );
            }) : (
              <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                <i className="fas fa-users-slash" style={{ fontSize: '2rem', marginBottom: '16px', display: 'block' }}></i>
                ไม่พบข้อมูลนักเรียน
              </div>
            )}
          </div>
        )}

        {/* SKILLS DNA */}
        {activeTab === 'skills' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {avgSkills.map((sk, i) => {
              const students = filtered.map(st => ({ name: st.name, score: normalizePct(st.scores[sk.key] || 0) })).sort((a,b) => b.score - a.score);
              const isSelected = selectedSkill === sk.key;
              return (
                <div key={i} onClick={() => setSelectedSkill(isSelected ? null : sk.key)}
                  style={{ ...S.card, cursor: 'pointer', transition: 'all 0.25s', borderColor: isSelected ? sk.color : '#e2e8f0', transform: isSelected ? 'translateY(-4px)' : 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div>
                      <div style={{ fontSize: '1.8rem', marginBottom: '6px' }}>{sk.icon}</div>
                      <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#0f172a' }}>{sk.label}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '2rem', fontWeight: 800, color: sk.color, lineHeight: 1 }}>{sk.score}%</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>ค่าเฉลี่ย</div>
                    </div>
                  </div>
                  <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden', marginBottom: '16px' }}>
                    <div style={{ width: `${sk.score}%`, height: '100%', background: sk.color, borderRadius: '4px', transition: 'width 1s ease' }} />
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#475569', marginBottom: '10px', fontWeight: 700 }}>🏆 TOP 3 นักเรียนเด่น</div>
                  {students.slice(0, 3).map((st, j) => (
                    <div key={j} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', padding: '6px 10px', background: j === 0 ? `${sk.color}15` : '#f8fafc', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: j === 0 ? '#fbbf24' : j === 1 ? '#94a3b8' : '#b45309', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800 }}>{j+1}</div>
                        <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#334155' }}>{st.name}</span>
                      </div>
                      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: sk.color }}>{st.score}%</span>
                    </div>
                  ))}
                  {students.length === 0 && <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>ไม่มีข้อมูล</div>}
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
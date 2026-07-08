'use client';
import { useEffect, useState } from 'react';
import { Bar, Pie, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, RadialLinearScale, PointElement, LineElement, Filler
} from 'chart.js';

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxoZo8hs8SKeVF7mnEQYWoxbZSJRL9Fe9h_Tcz0Bwsd6h_UA1JPjaKPqKdyL5mBEHHWHg/exec";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, RadialLinearScale, PointElement, LineElement, Filler);

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiInsight, setAiInsight] = useState('');
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState('all');

  useEffect(() => {
    fetch('/api/sheet-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'getDashboardData' })
    })
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>กำลังโหลดข้อมูล...</div>;
  if (data?.status !== 'success') return <div>เกิดข้อผิดพลาดในการดึงข้อมูล</div>;

  const { totalViews, totalAssessments, viewsByPath, popularJobs, recentUsers = [], recentFeedback = [], avgSatisfaction, avgSkills } = data;

  const getInsight = async () => {
    setLoadingInsight(true);
    try {
      let targetPopularJobs = popularJobs;
      let targetAvgSkills = skillsData;
      let targetTotalAssessments = totalAssessments;

      if (selectedSchool !== 'all') {
        const resSchool = await fetch('/api/sheet-proxy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'admin_get_school_data' })
        });
        const schoolData = await resSchool.json();
        if (schoolData.status === 'success') {
          const formatted = (schoolData.results || []).map(st => ({
            school: (st.school || '').toString().trim(),
            ai_title: st.ai_title || '-',
            scores: st.scores || {}
          })).filter(st => st.school === selectedSchool);

          targetTotalAssessments = formatted.length;
          
          const careerDist = formatted.reduce((acc, s) => {
            if (s.ai_title && s.ai_title !== '-') {
              acc[s.ai_title] = (acc[s.ai_title] || 0) + 1;
            }
            return acc;
          }, {});
          targetPopularJobs = Object.entries(careerDist).sort((a,b) => b[1]-a[1]).slice(0,10).map(x => ({ ai_title: x[0], count: x[1] }));

          const baseSkills = [
            { key: 'tech', label: 'เทคโนโลยี', icon: '💻', color: '#38ef7d' },
            { key: 'logic', label: 'การวิเคราะห์', icon: '🧠', color: '#6366f1' },
            { key: 'creative', label: 'สร้างสรรค์', icon: '🎨', color: '#f59e0b' },
            { key: 'lead', label: 'ภาวะผู้นำ', icon: '🏆', color: '#f43f5e' },
            { key: 'comm', label: 'การสื่อสาร', icon: '💬', color: '#0ea5e9' },
            { key: 'biz', label: 'ธุรกิจ', icon: '📊', color: '#06b6d4' },
            { key: 'phys', label: 'ปฏิบัติการ', icon: '🏃', color: '#10b981' },
            { key: 'emp', label: 'จิตบริการ', icon: '❤️', color: '#a78bfa' },
          ];

          targetAvgSkills = baseSkills.map(sk => {
            const avg = formatted.reduce((sum, st) => {
              const n = parseFloat(st.scores[sk.key]) || 0;
              return sum + (n > 0 && n <= 1 ? n * 100 : n);
            }, 0) / (formatted.length || 1);
            return { label: sk.label, score: Math.round(avg), icon: sk.icon, color: sk.color };
          });
        }
      }

      const res = await fetch('/api/admin-insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ popularJobs: targetPopularJobs, avgSatisfaction, totalAssessments: targetTotalAssessments, avgSkills: targetAvgSkills })
      });
      const d = await res.json();
      try {
        const parsed = typeof d.insight === 'string' ? JSON.parse(d.insight) : d.insight;
        setAiInsight(parsed);
      } catch (e) {
        setAiInsight({ overall: d.insight, strengths: 'ไม่สามารถแยกข้อมูลได้', recommendation: 'ไม่สามารถแยกข้อมูลได้' });
      }
    } catch {
      setAiInsight({ overall: 'เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง', strengths: '', recommendation: '' });
    }
    setLoadingInsight(false);
  };

  const chartOptions = {
    indexAxis: 'y', // ทำให้เป็นกราฟแนวนอน
    responsive: true,
    maintainAspectRatio: false,
    color: '#475569',
    plugins: {
      legend: { display: false }
    },
    scales: {
      x: { ticks: { color: '#64748b', font: { family: "'Kanit', sans-serif" } }, grid: { color: 'rgba(0,0,0,0.05)' } },
      y: { ticks: { color: '#64748b', font: { family: "'Kanit', sans-serif" } }, grid: { display: false } }
    }
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    color: '#475569',
    plugins: {
      legend: { position: 'bottom', labels: { color: '#475569', font: { family: "'Kanit', sans-serif" } } }
    }
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        min: 0,
        max: 100,
        angleLines: { color: 'rgba(0,0,0,0.05)' },
        grid: { color: 'rgba(0,0,0,0.05)' },
        pointLabels: { font: { family: "'Kanit', sans-serif", size: 13 }, color: '#475569' },
        ticks: { backdropColor: 'transparent', color: '#94a3b8', display: false, stepSize: 20 }
      }
    },
    plugins: { legend: { display: false } }
  };

  const jobChartData = {
    labels: popularJobs.map(j => j.ai_title),
    datasets: [{
      label: 'จำนวนนักเรียนที่ได้อาชีพนี้',
      data: popularJobs.map(j => j.count),
      backgroundColor: [
        '#ff9a9e', '#fecfef', '#a1c4fd', '#c2e9fb', '#d4fc79',
        '#96e6a1', '#84fab0', '#8fd3f4', '#fccb90', '#d57eeb'
      ],
      borderColor: 'transparent',
      borderWidth: 0,
      borderRadius: 6
    }]
  };

  const viewChartData = {
    labels: viewsByPath.map(v => v.path === '/' ? '/home (หน้าหลัก)' : v.path),
    datasets: [{
      label: 'จำนวนครั้งที่เปิดดู',
      data: viewsByPath.map(v => v.count),
      backgroundColor: [
        '#ff0080', '#ff7a00', '#fed330', '#26de81', '#a55eea', '#fd9644', '#fc5c65', '#2bcbba', '#45aaf2', '#4b7bec'
      ],
      borderWidth: 0,
    }]
  };

  // Radar chart data (use avgSkills if provided, otherwise mock)
  const mockSkills = [
    { label: 'การวิเคราะห์', score: 81.2, icon: '🧠', color: '#6366f1' },
    { label: 'การสื่อสาร',    score: 74.4, icon: '💬', color: '#0ea5e9' },
    { label: 'เทคโนโลยี',  score: 92.0, icon: '💻', color: '#38ef7d' },
    { label: 'สร้างสรรค์',    score: 78.8, icon: '🎨', color: '#f59e0b' },
    { label: 'ภาวะผู้นำ',    score: 68.4, icon: '🏆', color: '#f43f5e' },
    { label: 'ธุรกิจ',      score: 72.0, icon: '📊', color: '#06b6d4' },
    { label: 'ปฏิบัติการ',   score: 80.0, icon: '🏃', color: '#10b981' },
    { label: 'จิตบริการ', score: 75.5, icon: '❤️', color: '#a78bfa' }
  ];
  // iconMap และ colorMap สำหรับเติมให้ข้อมูลจริงจาก Apps Script ที่ไม่มี icon/color
  const metaMap = {
    'เทคโนโลยี':  { icon: '💻', color: '#38ef7d' },
    'การวิเคราะห์': { icon: '🧠', color: '#6366f1' },
    'สร้างสรรค์':    { icon: '🎨', color: '#f59e0b' },
    'ภาวะผู้นำ':    { icon: '🏆', color: '#f43f5e' },
    'การสื่อสาร':    { icon: '💬', color: '#0ea5e9' },
    'ธุรกิจ':      { icon: '📊', color: '#06b6d4' },
    'ปฏิบัติการ':   { icon: '🏃', color: '#10b981' },
    'จิตบริการ': { icon: '❤️', color: '#a78bfa' }
  };
  
  let rawSkills = (avgSkills && avgSkills.length > 0) ? avgSkills : mockSkills;
  // ถ้า backend ส่งมาไม่ครบ 8 ให้เติม phys/emp จาก mockSkills แทนที่จะเป็น 0
  if (rawSkills.length < 8) {
    const physMock = mockSkills.find(s => s.label === 'ปฏิบัติการและวินัย');
    const empMock  = mockSkills.find(s => s.label === 'จิตบริการและการดูแล');
    if (!rawSkills.find(s => s.label === 'ปฏิบัติการและวินัย') && physMock) rawSkills = [...rawSkills, physMock];
    if (!rawSkills.find(s => s.label === 'จิตบริการและการดูแล') && empMock)  rawSkills = [...rawSkills, empMock];
  }
  // normalize: แปลง score เป็น number เสมอ และเติม icon/color ถ้าไม่มี
  const skillsData = rawSkills.map(s => ({
    ...s,
    score: parseFloat(s.score) || 0,
    icon:  s.icon  || metaMap[s.label]?.icon  || '⭐',
    color: s.color || metaMap[s.label]?.color || '#38ef7d',
  }));
  const topSkill = [...skillsData].sort((a, b) => b.score - a.score)[0];
  const lowSkill = [...skillsData].sort((a, b) => a.score - b.score)[0];
  const avgAll = (skillsData.reduce((s, x) => s + x.score, 0) / skillsData.length).toFixed(1);

  const radarChartData = {
    labels: skillsData.map(s => s.label),
    datasets: [{
      label: 'คะแนนเฉลี่ยระดับโรงเรียน (%)',
      data: skillsData.map(s => s.score),
      backgroundColor: 'rgba(56, 239, 125, 0.15)',
      borderColor: 'rgba(56, 239, 125, 0.9)',
      borderWidth: 2.5,
      pointBackgroundColor: skillsData.map(s => s.color || 'rgba(56, 239, 125, 1)'),
      pointBorderColor: '#fff',
      pointRadius: 5,
      pointHoverRadius: 7,
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(56, 239, 125, 1)'
    }]
  };

  const getSentiment = (comment) => {
    if (!comment || typeof comment !== 'string') {
      return <span style={{ background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, marginLeft: '8px' }}>🟡 ทั่วไป</span>;
    }
    const positiveWords = ['ดี', 'ชอบ', 'เยี่ยม', 'เจ๋ง', 'เข้าใจง่าย', 'มีประโยชน์', 'สวย', 'สุดยอด', 'แม่น', 'สุด'];
    const isPositive = positiveWords.some(w => comment.includes(w));
    if (isPositive) return <span style={{ background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, marginLeft: '8px' }}>🟢 เชิงบวก</span>;
    return <span style={{ background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, marginLeft: '8px' }}>🟡 ทั่วไป</span>;
  };

  const handleExportPDF = () => {
    const win = window.open('', '_blank');
    const skillRows = skillsData.map(s => `
      <tr>
        <td>${s.icon || ''} ${s.label}</td>
        <td>
          <div style="background:#e2e8f0;border-radius:4px;height:10px;width:100%">
            <div style="background:${s.color};width:${s.score}%;height:100%;border-radius:4px"></div>
          </div>
        </td>
        <td style="text-align:right;font-weight:700">${s.score}%</td>
      </tr>`).join('');

    const jobRows = popularJobs.slice(0, 10).map((j, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${j.ai_title || '-'}</td>
        <td style="text-align:center">${j.count}</td>
      </tr>`).join('');

    const viewRows = viewsByPath.map(v => `
      <tr>
        <td>${v.path === '/' ? '/home (หน้าหลัก)' : v.path}</td>
        <td style="text-align:center">${v.count}</td>
      </tr>`).join('');

    const insightHTML = aiInsight ? `
      <div class="section">
        <h2>🤖 AI Executive Summary</h2>
        ${aiInsight.overall ? `<p><strong>ภาพรวม:</strong> ${aiInsight.overall}</p>` : ''}
        ${aiInsight.strengths ? `<p><strong>⭐ จุดเด่น:</strong> ${aiInsight.strengths}</p>` : ''}
        ${aiInsight.weaknesses ? `<p><strong>⚠️ ทักษะที่ต้องพัฒนา:</strong> ${aiInsight.weaknesses}</p>` : ''}
        ${aiInsight.career_trend ? `<p><strong>📈 แนวโน้มอาชีพ:</strong> ${aiInsight.career_trend}</p>` : ''}
        ${aiInsight.action_plan_short ? `<p><strong>🚀 แผนระยะสั้น:</strong> ${aiInsight.action_plan_short}</p>` : ''}
        ${aiInsight.action_plan_mid ? `<p><strong>📅 แผนระยะกลาง:</strong> ${aiInsight.action_plan_mid}</p>` : ''}
        ${aiInsight.action_plan_long ? `<p><strong>🏆 แผนระยะยาว:</strong> ${aiInsight.action_plan_long}</p>` : ''}
        ${aiInsight.kpi_suggestion ? `<p><strong>📊 KPI ที่แนะนำ:</strong> ${aiInsight.kpi_suggestion}</p>` : ''}
        ${aiInsight.satisfaction_note ? `<p><strong>❤️ ความพึงพอใจ:</strong> ${aiInsight.satisfaction_note}</p>` : ''}
      </div>` : '';

    const html = `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <title>Executive Dashboard Report - FUTUREPATH AI</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;600;700;800&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Kanit', sans-serif; background: #fff; color: #0f172a; font-size: 11pt; padding: 20mm; }
    @page { size: A4; margin: 15mm; }
    h1 { font-size: 20pt; font-weight: 800; color: #0f172a; margin-bottom: 4px; }
    h2 { font-size: 13pt; font-weight: 700; color: #0f172a; margin: 0 0 12px; padding-bottom: 6px; border-bottom: 2px solid #e2e8f0; }
    p { font-size: 10pt; line-height: 1.7; color: #334155; margin-bottom: 8px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 3px solid #0f172a; }
    .header-meta { font-size: 9pt; color: #64748b; text-align: right; }
    .section { margin-bottom: 24px; page-break-inside: avoid; }
    .stat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 24px; }
    .stat-card { padding: 16px; border-radius: 10px; color: white; }
    .stat-card.blue { background: linear-gradient(135deg,#00c6ff,#0072ff); }
    .stat-card.green { background: linear-gradient(135deg,#11998e,#38ef7d); }
    .stat-card.pink { background: linear-gradient(135deg,#f2709c,#ff9472); }
    .stat-card h3 { font-size: 9pt; font-weight: 500; opacity: 0.9; margin-bottom: 4px; }
    .stat-card .num { font-size: 22pt; font-weight: 800; line-height: 1; }
    table { width: 100%; border-collapse: collapse; font-size: 10pt; }
    th { background: #f1f5f9; color: #475569; font-weight: 700; padding: 8px 12px; text-align: left; }
    td { padding: 7px 12px; border-bottom: 1px solid #f1f5f9; color: #334155; }
    tr:last-child td { border-bottom: none; }
    .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .box { border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; }
    .badge { display: inline-block; padding: 2px 10px; border-radius: 20px; font-size: 8.5pt; font-weight: 600; margin-right: 6px; }
    .badge.green { background: #dcfce7; color: #166534; }
    .badge.yellow { background: #fef9c3; color: #854d0e; }
    .footer { margin-top: 32px; padding-top: 12px; border-top: 1px solid #e2e8f0; font-size: 8.5pt; color: #94a3b8; text-align: center; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1>📊 ภาพรวมระบบ (Executive Dashboard)</h1>
      <p style="color:#64748b;font-size:9.5pt">FUTUREPATH AI — รายงานสถิติและข้อมูลสรุปการใช้งานสำหรับผู้บริหาร</p>
    </div>
    <div class="header-meta">
      <div style="font-weight:700;font-size:10pt">รายงาน ณ วันที่</div>
      <div>${new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
    </div>
  </div>

  ${insightHTML}

  <div class="section">
    <h2>📈 สถิติภาพรวม</h2>
    <div class="stat-grid">
      <div class="stat-card blue">
        <h3>ยอดเข้าชมทั้งหมด</h3>
        <div class="num">${totalViews}</div>
      </div>
      <div class="stat-card green">
        <h3>ผู้เข้ารับการประเมิน</h3>
        <div class="num">${totalAssessments}</div>
      </div>
      <div class="stat-card pink">
        <h3>ความพึงพอใจเฉลี่ย</h3>
        <div class="num">${avgSatisfaction} <span style="font-size:14pt">/ 5</span></div>
      </div>
    </div>
  </div>

  <div class="two-col section">
    <div class="box">
      <h2>🧬 School DNA (ศักยภาพรวม)</h2>
      <div style="margin-bottom:10px">
        <span class="badge green">🏆 จุดแข็ง: ${topSkill?.label} (${topSkill?.score}%)</span>
        <span class="badge yellow">📈 พัฒนา: ${lowSkill?.label} (${lowSkill?.score}%)</span>
      </div>
      <table>
        <thead><tr><th>ทักษะ</th><th>คะแนน</th><th>%</th></tr></thead>
        <tbody>${skillRows}</tbody>
      </table>
    </div>
    <div class="box">
      <h2>🏆 อาชีพยอดนิยม 10 อันดับ</h2>
      <table>
        <thead><tr><th>#</th><th>อาชีพ</th><th style="text-align:center">จำนวน</th></tr></thead>
        <tbody>${jobRows}</tbody>
      </table>
    </div>
  </div>

  <div class="section" style="margin-top:20px">
    <h2>🔗 สถิติการเข้าชมรายหน้า</h2>
    <table>
      <thead><tr><th>หน้า</th><th style="text-align:center">จำนวนครั้ง</th></tr></thead>
      <tbody>${viewRows}</tbody>
    </table>
  </div>

  <div class="footer">
    FUTUREPATH AI — ระบบวิเคราะห์ศักยภาพและแนะแนวอาชีพด้วยปัญญาประดิษฐ์ | รายงานสร้างอัตโนมัติ
  </div>
</body>
</html>`;

    win.document.write(html);
    win.document.close();
    win.onload = () => win.print();
  };


  return (
    <div className="admin-container">
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          /* ซ่อนปุ่มและ nav */
          .no-print, nav, header { display: none !important; }

          /* รีเซ็ต background และสี */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }

          body, html {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
            font-size: 11pt !important;
          }

          .admin-container {
            background: white !important;
            padding: 12px !important;
            max-width: 100% !important;
          }

          /* ปรับ Card / Box ให้แสดงบนหน้ากระดาษ */
          div[style*="background: linear-gradient"],
          div[style*="background:linear-gradient"] {
            -webkit-print-color-adjust: exact !important;
          }

          /* ตัดขอบหน้า */
          @page {
            size: A4 landscape;
            margin: 12mm;
          }

          /* ป้องกัน Content ถูกตัดกลางหน้า */
          .print-break { page-break-before: always; }
          table, tr, td, th { page-break-inside: avoid; }
          h1, h2, h3, h4 { page-break-after: avoid; }

          /* Chart.js canvas — บังคับให้แสดง */
          canvas {
            max-width: 100% !important;
            height: auto !important;
          }

          /* Grid layout ที่ใช้ใน Dashboard — จัดให้พอดีหน้า */
          div[style*="grid-template-columns"] {
            display: grid !important;
          }
        }
      `}} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>ภาพรวมระบบ (Executive Dashboard)</h1>
          <p style={{ color: '#64748b' }}>สถิติและข้อมูลสรุปการใช้งานสำหรับผู้บริหาร</p>
        </div>
        <button className="no-print" onClick={handleExportPDF} style={{ background: '#0f172a', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
          <i className="fa-solid fa-download"></i> Export PDF
        </button>
      </div>

      {/* AI Insight Box */}
      <div style={{ marginBottom: '32px', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', borderRadius: '20px', color: 'white', boxShadow: '0 10px 40px rgba(15,23,42,0.4)', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '24px 28px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#38ef7d', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
              <i className="fa-solid fa-brain"></i> AI Executive Summary
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.82rem', marginTop: '4px', margin: '4px 0 0' }}>วิเคราะห์โดย AI — ผลการประเมินทักษะนักเรียนเชิงลึกสำหรับผู้บริหาร</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {data?.schools?.length > 0 && (
              <select
                value={selectedSchool}
                onChange={(e) => setSelectedSchool(e.target.value)}
                style={{ background: 'rgba(255,255,255,0.05)', color: '#cbd5e1', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px 12px', fontSize: '0.85rem', outline: 'none', cursor: 'pointer' }}
              >
                <option value="all">ทุกโรงเรียน</option>
                {data.schools.map((s, idx) => (
                  <option key={idx} value={s}>{s}</option>
                ))}
              </select>
            )}
            {!aiInsight && (
              <button className="no-print" onClick={getInsight} disabled={loadingInsight}
                style={{ background: 'linear-gradient(135deg,#38ef7d,#11998e)', color: '#0f172a', border: 'none', padding: '10px 22px', borderRadius: '10px', cursor: loadingInsight ? 'not-allowed' : 'pointer', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
                {loadingInsight ? <><i className="fa-solid fa-circle-notch fa-spin"></i> กำลังวิเคราะห์...</> : <><i className="fa-solid fa-wand-magic-sparkles"></i> ประมวลผล</>}
              </button>
            )}
            {aiInsight && (
              <button className="no-print" onClick={() => { setAiInsight(null); }}
                style={{ background: 'rgba(255,255,255,0.08)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.12)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem' }}>
                <i className="fa-solid fa-rotate-right mr-1"></i> วิเคราะห์ใหม่
              </button>
            )}
          </div>
        </div>

        {!aiInsight && !loadingInsight && (
          <div style={{ padding: '40px 28px', textAlign: 'center' }}>
            <i className="fa-solid fa-chart-pie" style={{ fontSize: '3rem', color: '#334155', marginBottom: '16px', display: 'block' }}></i>
            <p style={{ color: '#64748b', fontSize: '0.95rem' }}>กดปุ่ม <strong style={{color:'#38ef7d'}}>"ประมวลผล"</strong> เพื่อให้ AI วิเคราะห์ข้อมูลนักเรียนทั้งโรงเรียน<br/>และสร้างรายงานเชิงลึกพร้อมแผนพัฒนาให้อัตโนมัติ</p>
          </div>
        )}
        {loadingInsight && (
          <div style={{ padding: '40px 28px', textAlign: 'center' }}>
            <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: '2.5rem', color: '#38ef7d', marginBottom: '16px', display: 'block' }}></i>
            <p style={{ color: '#94a3b8' }}>
              {selectedSchool === 'all' 
                ? `AI กำลังวิเคราะห์ข้อมูลนักเรียนทั้งหมด ${totalAssessments} คน...`
                : `AI กำลังวิเคราะห์ข้อมูลนักเรียนของ ${selectedSchool}...`}
            </p>
          </div>
        )}

        {aiInsight && (
          <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Row 1: ภาพรวม + จุดแข็ง */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ background: 'rgba(56,239,125,0.08)', border: '1px solid rgba(56,239,125,0.25)', borderRadius: '14px', padding: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(56,239,125,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="fa-solid fa-bullseye" style={{ color: '#38ef7d', fontSize: '0.9rem' }}></i>
                  </div>
                  <h4 style={{ color: '#38ef7d', fontWeight: 700, fontSize: '0.95rem', margin: 0 }}>ภาพรวมศักยภาพ</h4>
                </div>
                <p style={{ fontSize: '0.88rem', lineHeight: 1.75, color: '#cbd5e1', margin: 0 }}>{aiInsight.overall}</p>
              </div>
              <div style={{ background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.25)', borderRadius: '14px', padding: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(14,165,233,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="fa-solid fa-star" style={{ color: '#0ea5e9', fontSize: '0.9rem' }}></i>
                  </div>
                  <h4 style={{ color: '#0ea5e9', fontWeight: 700, fontSize: '0.95rem', margin: 0 }}>จุดแข็งที่ค้นพบ</h4>
                </div>
                <p style={{ fontSize: '0.88rem', lineHeight: 1.75, color: '#cbd5e1', margin: 0 }}>{aiInsight.strengths}</p>
              </div>
            </div>

            {/* Row 2: ทักษะที่ต้องพัฒนา + แนวโน้มอาชีพ */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.25)', borderRadius: '14px', padding: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(251,191,36,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="fa-solid fa-triangle-exclamation" style={{ color: '#fbbf24', fontSize: '0.9rem' }}></i>
                  </div>
                  <h4 style={{ color: '#fbbf24', fontWeight: 700, fontSize: '0.95rem', margin: 0 }}>ทักษะที่ต้องพัฒนา</h4>
                </div>
                <p style={{ fontSize: '0.88rem', lineHeight: 1.75, color: '#cbd5e1', margin: 0 }}>{aiInsight.weakness_analysis || aiInsight.recommendation}</p>
              </div>
              <div style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.25)', borderRadius: '14px', padding: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(168,85,247,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="fa-solid fa-chart-line" style={{ color: '#a855f7', fontSize: '0.9rem' }}></i>
                  </div>
                  <h4 style={{ color: '#a855f7', fontWeight: 700, fontSize: '0.95rem', margin: 0 }}>แนวโน้มอาชีพ</h4>
                </div>
                <p style={{ fontSize: '0.88rem', lineHeight: 1.75, color: '#cbd5e1', margin: 0 }}>{aiInsight.career_trend || '-'}</p>
              </div>
            </div>

            {/* Row 3: แผนพัฒนา 3 ระยะ */}
            {aiInsight.action_steps && Array.isArray(aiInsight.action_steps) && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                  <i className="fa-solid fa-list-check" style={{ color: '#f43f5e' }}></i>
                  <h4 style={{ color: '#f43f5e', fontWeight: 700, fontSize: '0.95rem', margin: 0 }}>แผนพัฒนานักเรียน (3 ระยะ)</h4>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  {aiInsight.action_steps.map((step, i) => {
                    const colors = ['#f43f5e','#f59e0b','#06b6d4'];
                    const bgColors = ['rgba(244,63,94,0.08)','rgba(245,158,11,0.08)','rgba(6,182,212,0.08)'];
                    const borderColors = ['rgba(244,63,94,0.3)','rgba(245,158,11,0.3)','rgba(6,182,212,0.3)'];
                    const icons = ['fa-bolt','fa-clock','fa-rocket'];
                    return (
                      <div key={i} style={{ background: bgColors[i], border: `1px solid ${borderColors[i]}`, borderRadius: '12px', padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                          <i className={`fa-solid ${icons[i]}`} style={{ color: colors[i], fontSize: '0.8rem' }}></i>
                          <span style={{ color: colors[i], fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{step.priority}</span>
                        </div>
                        <p style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '0.88rem', marginBottom: '8px', margin: '0 0 8px' }}>{step.title}</p>
                        <p style={{ color: '#94a3b8', fontSize: '0.82rem', lineHeight: 1.7, margin: 0 }}>{step.detail}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Row 4: KPI + ความพึงพอใจ */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {aiInsight.kpi_suggestion && (
                <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '14px', padding: '18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <i className="fa-solid fa-gauge-high" style={{ color: '#10b981', fontSize: '0.9rem' }}></i>
                    </div>
                    <h4 style={{ color: '#10b981', fontWeight: 700, fontSize: '0.95rem', margin: 0 }}>KPI ที่ควรติดตาม</h4>
                  </div>
                  <p style={{ fontSize: '0.88rem', lineHeight: 1.75, color: '#cbd5e1', margin: 0 }}>{aiInsight.kpi_suggestion}</p>
                </div>
              )}
              {aiInsight.satisfaction_note && (
                <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '14px', padding: '18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <i className="fa-solid fa-heart" style={{ color: '#ef4444', fontSize: '0.9rem' }}></i>
                    </div>
                    <h4 style={{ color: '#ef4444', fontWeight: 700, fontSize: '0.95rem', margin: 0 }}>ความพึงพอใจ {avgSatisfaction}/5</h4>
                  </div>
                  <p style={{ fontSize: '0.88rem', lineHeight: 1.75, color: '#cbd5e1', margin: 0 }}>{aiInsight.satisfaction_note}</p>
                </div>
              )}
            </div>

          </div>
        )}
      </div>
      
      {/* Stat Cards with Gradients */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        <div style={{ padding: '24px', background: 'linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)', borderRadius: '16px', color: 'white', boxShadow: '0 10px 15px -3px rgba(0, 114, 255, 0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 500, marginBottom: '8px', opacity: 0.9 }}>ยอดเข้าชมทั้งหมด</h3>
              <p style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1 }}>{totalViews}</p>
            </div>
            <div style={{ padding: '12px', background: 'rgba(255,255,255,0.2)', borderRadius: '12px' }}><i className="fa-solid fa-eye fa-lg"></i></div>
          </div>
        </div>
        
        <div style={{ padding: '24px', background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', borderRadius: '16px', color: 'white', boxShadow: '0 10px 15px -3px rgba(56, 239, 125, 0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 500, marginBottom: '8px', opacity: 0.9 }}>ผู้เข้ารับการประเมิน</h3>
              <p style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1 }}>{totalAssessments}</p>
            </div>
            <div style={{ padding: '12px', background: 'rgba(255,255,255,0.2)', borderRadius: '12px' }}><i className="fa-solid fa-clipboard-check fa-lg"></i></div>
          </div>
        </div>

        <div 
          onClick={() => setShowFeedbackModal(true)}
          style={{ padding: '24px', background: 'linear-gradient(135deg, #f2709c 0%, #ff9472 100%)', borderRadius: '16px', color: 'white', boxShadow: '0 10px 15px -3px rgba(255, 148, 114, 0.3)', cursor: 'pointer', transition: 'transform 0.2s', ':hover': { transform: 'scale(1.02)' } }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 500, marginBottom: '8px', opacity: 0.9 }}>ความพึงพอใจเฉลี่ย</h3>
              <p style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1 }}>{avgSatisfaction} <span style={{fontSize:'1.2rem'}}>/ 5</span></p>
              <div style={{ marginTop: '12px', fontSize: '0.85rem', background: 'rgba(255,255,255,0.2)', display: 'inline-block', padding: '2px 8px', borderRadius: '12px' }}>
                <i className="fa-solid fa-star"></i> ดูข้อเสนอแนะรายบุคคล
              </div>
            </div>
            <div style={{ padding: '12px', background: 'rgba(255,255,255,0.2)', borderRadius: '12px' }}><i className="fa-solid fa-star fa-lg"></i></div>
          </div>
        </div>
      </div>

      {/* Charts Level 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr', gap: '24px', marginBottom: '24px' }}>
        <div style={{ padding: '24px', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <h3 style={{ marginBottom: '24px', color: '#334155', fontWeight: 600 }}>แนวโน้มอาชีพในโรงเรียนที่ได้รับความนิยม 10 อันดับ</h3>
          <div style={{ height: '350px' }}>
            <Bar data={jobChartData} options={chartOptions} />
          </div>
        </div>

        <div style={{ padding: '24px', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
            <div>
              <h3 style={{ color: '#0f172a', fontWeight: 700, fontSize: '1.05rem', margin: 0 }}>🧬 School DNA (ศักยภาพรวม)</h3>
              <p style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '4px' }}>ค่าเฉลี่ยทักษะของนักเรียนทั้งโรงเรียน</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{avgAll}%</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>คะแนนเฉลี่ยรวม</div>
            </div>
          </div>

          {/* Summary badges */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
            <span style={{ background: '#dcfce7', color: '#166534', padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }}>
              🏆 จุดแข็ง: {topSkill?.label} ({topSkill?.score}%)
            </span>
            <span style={{ background: '#fef9c3', color: '#854d0e', padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }}>
              📈 พัฒนา: {lowSkill?.label} ({lowSkill?.score}%)
            </span>
          </div>

          {/* Radar Chart */}
          <div style={{ height: '240px' }}>
            <Radar data={radarChartData} options={radarOptions} />
          </div>

          {/* Legend grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginTop: '12px' }}>
            {skillsData.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 8px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '0.95rem' }}>{s.icon || '⭐'}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.label}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                    <div style={{ flex: 1, height: '4px', background: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ width: `${s.score}%`, height: '100%', background: s.color || '#38ef7d', borderRadius: '2px', transition: 'width 0.6s ease' }} />
                    </div>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#0f172a', minWidth: '32px', textAlign: 'right' }}>{s.score}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Level 2 */}
      <div className="print-break" style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '24px', marginTop: '24px' }}>
        <div style={{ padding: '24px', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <h3 style={{ marginBottom: '24px', color: '#334155', fontWeight: 600 }}>สถิติการเข้าชมรายหน้า</h3>
          <div style={{ height: '300px' }}>
            <Pie data={viewChartData} options={pieOptions} />
          </div>
        </div>

        <div style={{ padding: '24px', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          <h3 style={{ marginBottom: '20px', color: '#334155', fontWeight: 600 }}><i className="fa-solid fa-comments mr-2" style={{color:'#f43f5e'}}></i> ข้อเสนอแนะล่าสุด (Sentiment Analysis)</h3>
          <div style={{ overflowX: 'auto', maxHeight: '320px', overflowY: 'auto' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {recentFeedback.map((f, i) => (
                <div key={i} style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 600, color: '#0f172a' }}>{f.name} {getSentiment(f.comment)}</span>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{f.created_at ? new Date(f.created_at).toLocaleDateString('th-TH') : '-'}</span>
                  </div>
                  <p style={{ color: '#475569', fontSize: '0.95rem', fontStyle: 'italic' }}>"{f.comment}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div style={{ marginTop: '24px' }}>
        {/* Recent Users Table */}
        <div style={{ padding: '24px', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          <h3 style={{ marginBottom: '20px', color: '#334155', fontWeight: 600 }}><i className="fa-solid fa-users mr-2" style={{color:'#0ea5e9'}}></i> สมาชิกที่สมัครล่าสุด</h3>
          <div style={{ overflowX: 'auto', maxHeight: '300px', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', color: '#64748b', fontWeight: 600 }}>วันที่สมัคร</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', color: '#64748b', fontWeight: 600 }}>ชื่อ-นามสกุล</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', color: '#64748b', fontWeight: 600 }}>อีเมล</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((u, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 16px', color: '#475569' }}>{u.created_at ? new Date(u.created_at).toLocaleDateString('th-TH') : '-'}</td>
                    <td style={{ padding: '12px 16px', color: '#0f172a', fontWeight: 500 }}>{u.name}</td>
                    <td style={{ padding: '12px 16px', color: '#475569' }}>{u.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ background: '#fff', borderRadius: '16px', width: '90%', maxWidth: '600px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                <i className="fa-solid fa-comments" style={{ color: '#f2709c', marginRight: '8px' }}></i> ข้อเสนอแนะรายบุคคล
              </h2>
              <button onClick={() => setShowFeedbackModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', color: '#64748b', cursor: 'pointer', padding: '0 8px' }}>&times;</button>
            </div>
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1, backgroundColor: '#fdfdfd' }}>
              {recentFeedback && recentFeedback.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {recentFeedback.map((fb, idx) => (
                    <div key={idx} style={{ padding: '16px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <div>
                          <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.95rem' }}>{fb.name || 'ไม่ระบุชื่อ'}</div>
                          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{fb.email || '-'} &bull; {fb.created_at ? new Date(fb.created_at).toLocaleString('th-TH') : ''}</div>
                        </div>
                        {fb.score ? (
                          <div style={{ display: 'flex', gap: '2px', color: '#f59e0b' }}>
                            {[1,2,3,4,5].map(s => (
                              <i key={s} className={`fa-solid fa-star`} style={{ opacity: s <= fb.score ? 1 : 0.3, fontSize: '0.85rem' }}></i>
                            ))}
                          </div>
                        ) : null}
                      </div>
                      <div style={{ fontSize: '0.9rem', color: '#334155', lineHeight: 1.5, background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', borderLeft: '3px solid #cbd5e1' }}>
                        {fb.comment || '-'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', color: '#64748b', padding: '40px 0' }}>ยังไม่มีข้อเสนอแนะในขณะนี้</div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

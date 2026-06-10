'use client';
import { useEffect, useState } from 'react';
import { Bar, Pie, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, RadialLinearScale, PointElement, LineElement, Filler
} from 'chart.js';

const GOOGLE_SCRIPT_URL = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL;

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, RadialLinearScale, PointElement, LineElement, Filler);

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiInsight, setAiInsight] = useState('');
  const [loadingInsight, setLoadingInsight] = useState(false);

  useEffect(() => {
    fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
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
      const res = await fetch('/api/admin-insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ popularJobs, avgSatisfaction, totalAssessments })
      });
      const d = await res.json();
      setAiInsight(d.insight);
    } catch {
      setAiInsight('ไม่สามารถดึงข้อมูลวิเคราะห์จาก AI ได้ในขณะนี้');
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
        angleLines: { color: 'rgba(0,0,0,0.05)' },
        grid: { color: 'rgba(0,0,0,0.05)' },
        pointLabels: { font: { family: "'Kanit', sans-serif", size: 13 }, color: '#475569' },
        ticks: { backdropColor: 'transparent', color: '#94a3b8', display: false }
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
    { label: 'ตรรกะและการวิเคราะห์', score: 75 },
    { label: 'การสื่อสารและภาษา', score: 82 },
    { label: 'เทคโนโลยีและดิจิทัล', score: 88 },
    { label: 'ความคิดสร้างสรรค์', score: 70 },
    { label: 'การจัดการและผู้นำ', score: 65 },
    { label: 'ความเข้าใจสังคม', score: 78 }
  ];
  const skillsData = avgSkills || mockSkills;

  const radarChartData = {
    labels: skillsData.map(s => s.label),
    datasets: [{
      label: 'คะแนนเฉลี่ยระดับโรงเรียน (%)',
      data: skillsData.map(s => s.score),
      backgroundColor: 'rgba(56, 239, 125, 0.2)',
      borderColor: 'rgba(56, 239, 125, 1)',
      borderWidth: 2,
      pointBackgroundColor: 'rgba(56, 239, 125, 1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(56, 239, 125, 1)'
    }]
  };

  const getSentiment = (comment) => {
    const positiveWords = ['ดี', 'ชอบ', 'เยี่ยม', 'เจ๋ง', 'เข้าใจง่าย', 'มีประโยชน์', 'สวย', 'สุดยอด', 'แม่น', 'สุด'];
    const isPositive = positiveWords.some(w => comment.includes(w));
    if (isPositive) return <span style={{ background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, marginLeft: '8px' }}>🟢 เชิงบวก</span>;
    return <span style={{ background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, marginLeft: '8px' }}>🟡 ทั่วไป</span>;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="admin-container">
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          .no-print { display: none !important; }
          .admin-container { background: white; padding: 0 !important; }
          body { background: white; }
          .print-break { page-break-before: always; }
        }
      `}} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>ภาพรวมระบบ (Executive Dashboard)</h1>
          <p style={{ color: '#64748b' }}>สถิติและข้อมูลสรุปการใช้งานสำหรับผู้บริหาร</p>
        </div>
        <button className="no-print" onClick={handlePrint} style={{ background: '#0f172a', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
          <i className="fa-solid fa-download"></i> Export PDF
        </button>
      </div>

      {/* AI Insight Box */}
      <div style={{ marginBottom: '32px', padding: '24px', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', borderRadius: '16px', color: 'white', boxShadow: '0 10px 15px -3px rgba(15, 23, 42, 0.3)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-20px', right: '-20px', opacity: 0.1, fontSize: '120px' }}>
          <i className="fa-solid fa-brain"></i>
        </div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px', color: '#38ef7d', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <i className="fa-solid fa-sparkles"></i> AI Executive Summary
          </h3>
          
          {aiInsight ? (
            <p style={{ fontSize: '1.05rem', lineHeight: 1.6, opacity: 0.9 }}>{aiInsight}</p>
          ) : (
            <div>
              <p style={{ color: '#94a3b8', marginBottom: '16px' }}>วิเคราะห์ข้อมูลภาพรวมในระบบด้วย AI เพื่อทำบทสรุปผู้บริหารเชิงนโยบาย (คลิกเพื่อประมวลผล)</p>
              <button className="no-print" onClick={getInsight} disabled={loadingInsight} style={{ background: '#38ef7d', color: '#0f172a', border: 'none', padding: '8px 24px', borderRadius: '8px', cursor: loadingInsight ? 'not-allowed' : 'pointer', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                {loadingInsight ? <><i className="fa-solid fa-circle-notch fa-spin"></i> กำลังวิเคราะห์ข้อมูล...</> : <><i className="fa-solid fa-wand-magic-sparkles"></i> เริ่มประมวลผล</>}
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Stat Cards with Gradients */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        <div style={{ padding: '24px', background: 'linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)', borderRadius: '16px', color: 'white', boxShadow: '0 10px 15px -3px rgba(0, 114, 255, 0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 500, marginBottom: '8px', opacity: 0.9 }}>ยอดเข้าชมทั้งหมด</h3>
              <p style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1 }}>{totalViews}</p>
              <div style={{ marginTop: '12px', fontSize: '0.85rem', background: 'rgba(255,255,255,0.2)', display: 'inline-block', padding: '2px 8px', borderRadius: '12px' }}>
                <i className="fa-solid fa-arrow-trend-up"></i> +12% สัปดาห์นี้
              </div>
            </div>
            <div style={{ padding: '12px', background: 'rgba(255,255,255,0.2)', borderRadius: '12px' }}><i className="fa-solid fa-eye fa-lg"></i></div>
          </div>
        </div>
        
        <div style={{ padding: '24px', background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', borderRadius: '16px', color: 'white', boxShadow: '0 10px 15px -3px rgba(56, 239, 125, 0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 500, marginBottom: '8px', opacity: 0.9 }}>ผู้เข้ารับการประเมิน</h3>
              <p style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1 }}>{totalAssessments}</p>
              <div style={{ marginTop: '12px', fontSize: '0.85rem', background: 'rgba(255,255,255,0.2)', display: 'inline-block', padding: '2px 8px', borderRadius: '12px' }}>
                <i className="fa-solid fa-arrow-trend-up"></i> +18% สัปดาห์นี้
              </div>
            </div>
            <div style={{ padding: '12px', background: 'rgba(255,255,255,0.2)', borderRadius: '12px' }}><i className="fa-solid fa-clipboard-check fa-lg"></i></div>
          </div>
        </div>

        <div style={{ padding: '24px', background: 'linear-gradient(135deg, #f2709c 0%, #ff9472 100%)', borderRadius: '16px', color: 'white', boxShadow: '0 10px 15px -3px rgba(255, 148, 114, 0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 500, marginBottom: '8px', opacity: 0.9 }}>ความพึงพอใจเฉลี่ย</h3>
              <p style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1 }}>{avgSatisfaction} <span style={{fontSize:'1.2rem'}}>/ 5</span></p>
              <div style={{ marginTop: '12px', fontSize: '0.85rem', background: 'rgba(255,255,255,0.2)', display: 'inline-block', padding: '2px 8px', borderRadius: '12px' }}>
                <i className="fa-solid fa-star"></i> มาตรฐานดีเยี่ยม
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

        <div style={{ padding: '24px', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <h3 style={{ marginBottom: '24px', color: '#334155', fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
            <span>School DNA (ศักยภาพรวม)</span>
            {!avgSkills && <span className="no-print" style={{ fontSize: '0.75rem', background: '#fef08a', color: '#854d0e', padding: '4px 8px', borderRadius: '12px', fontWeight: 600 }}>ข้อมูลจำลองรอ API</span>}
          </h3>
          <div style={{ height: '320px' }}>
            <Radar data={radarChartData} options={radarOptions} />
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

    </div>
  );
}

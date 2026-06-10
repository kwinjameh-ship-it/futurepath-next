'use client';
import { useEffect, useState } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement
} from 'chart.js';

const GOOGLE_SCRIPT_URL = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL;

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const { totalViews, totalAssessments, viewsByPath, popularJobs, recentUsers = [], recentFeedback = [], avgSatisfaction } = data;

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

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>ภาพรวมระบบ (Dashboard)</h1>
        <p style={{ color: '#64748b' }}>สถิติและข้อมูลสรุปการใช้งาน</p>
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

        <div style={{ padding: '24px', background: 'linear-gradient(135deg, #f2709c 0%, #ff9472 100%)', borderRadius: '16px', color: 'white', boxShadow: '0 10px 15px -3px rgba(255, 148, 114, 0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 500, marginBottom: '8px', opacity: 0.9 }}>ความพึงพอใจเฉลี่ย</h3>
              <p style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1 }}>{avgSatisfaction} <span style={{fontSize:'1.2rem'}}>/ 5</span></p>
            </div>
            <div style={{ padding: '12px', background: 'rgba(255,255,255,0.2)', borderRadius: '12px' }}><i className="fa-solid fa-star fa-lg"></i></div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <div style={{ padding: '24px', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <h3 style={{ marginBottom: '24px', color: '#334155', fontWeight: 600 }}>แนวโน้มอาชีพในโรงเรียนที่ได้รับความนิยม 10 อันดับ</h3>
          <div style={{ height: '350px' }}>
            <Bar data={jobChartData} options={chartOptions} />
          </div>
        </div>

        <div style={{ padding: '24px', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <h3 style={{ marginBottom: '24px', color: '#334155', fontWeight: 600 }}>สถิติการเข้าชมรายหน้า</h3>
          <div style={{ height: '350px' }}>
            <Pie 
              data={viewChartData} 
              options={pieOptions} 
            />
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '24px' }}>
        {/* Recent Users Table */}
        <div style={{ padding: '24px', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          <h3 style={{ marginBottom: '20px', color: '#334155', fontWeight: 600 }}><i className="fa-solid fa-users mr-2" style={{color:'#0ea5e9'}}></i> สมาชิกที่สมัครล่าสุด</h3>
          <div style={{ overflowX: 'auto' }}>
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

        {/* Recent Feedback Table */}
        <div style={{ padding: '24px', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          <h3 style={{ marginBottom: '20px', color: '#334155', fontWeight: 600 }}><i className="fa-solid fa-comments mr-2" style={{color:'#f43f5e'}}></i> ข้อเสนอแนะล่าสุด (Feedback)</h3>
          <div style={{ overflowX: 'auto', maxHeight: '400px', overflowY: 'auto' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {recentFeedback.map((f, i) => (
                <div key={i} style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 600, color: '#0f172a' }}>{f.name}</span>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{f.created_at ? new Date(f.created_at).toLocaleDateString('th-TH') : '-'}</span>
                  </div>
                  <p style={{ color: '#475569', fontSize: '0.95rem', fontStyle: 'italic' }}>"{f.comment}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

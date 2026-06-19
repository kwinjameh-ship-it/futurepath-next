'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import GlassNav from '@/components/GlassNav';
import useAuth from '@/lib/useAuth';
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend
} from 'chart.js';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const SHEET_WEBAPP_URL = 'https://script.google.com/macros/s/AKfycby-qewa8CfMVp1V5GimbZtprRKDTPlRBNxa2siekCfM8mdKAXo1MAE9htIjidMlei2fqQ/exec';

export default function UserDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSim, setSelectedSim] = useState(null);

  useEffect(() => {
    if (!authLoading && user?.email) {
      fetch(SHEET_WEBAPP_URL, {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ action: 'getUserDashboard', email: user.email })
      })
      .then(res => res.json())
      .then(d => {
        console.log("Dashboard Data Fetch Result:", d);
        setData(d);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
    }
  }, [user, authLoading]);

  if (authLoading || loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Kanit', sans-serif", color: 'rgba(255,255,255,0.7)', background: '#120c0a' }}>
        <i className="fas fa-spinner fa-spin mr-3" style={{ fontSize: '24px', color: '#ff7a00' }} /> กำลังโหลดข้อมูลแดชบอร์ด...
      </div>
    );
  }

  const { dna, simulations } = data || {};
  
  // normalize: ถ้าค่าน้อยกว่า 1 (decimal เช่น 0.78) → คูณ 100 → 78
  const normalizePct = (val) => {
    const n = parseFloat(val) || 0;
    return (n > 0 && n <= 1) ? parseFloat((n * 100).toFixed(1)) : parseFloat(n.toFixed(1));
  };

  // ตรวจสอบว่าเคยทำแบบทดสอบหรือไม่
  const hasDNA = !!dna;
  const matchPct = hasDNA ? normalizePct(dna.matchPct) : 0;
  
  // ฉายาตามคะแนน MatchPct
  let statusBadge = "ผู้เริ่มต้นสำรวจ (Explorer)";
  let badgeColor = "#94a3b8"; // gray
  if (matchPct >= 80) { statusBadge = "ดาวรุ่งพุ่งแรง (High Potential)"; badgeColor = "#2bcbba"; }
  else if (matchPct >= 60) { statusBadge = "ผู้พัฒนาอย่างต่อเนื่อง (Rising Star)"; badgeColor = "#fed330"; }

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: { color: 'rgba(255,255,255,0.1)' },
        grid: { color: 'rgba(255,255,255,0.1)' },
        pointLabels: { font: { family: "'Kanit', sans-serif", size: 12 }, color: '#e2e8f0' },
        ticks: { backdropColor: 'transparent', display: false, min: 0, max: 100 }
      }
    },
    plugins: { legend: { display: false } }
  };

  const parsedResultData = typeof dna?.resultData === 'string' ? JSON.parse(dna.resultData) : (dna?.resultData || {});
  const actualScores = parsedResultData.scores || dna?.scores || {};

  const radarData = {
    labels: ['เทคโนโลยี', 'ตรรกะ', 'สร้างสรรค์', 'ผู้นำ', 'สื่อสาร', 'ธุรกิจ', 'ปฏิบัติการ', 'จิตบริการ'],
    datasets: [{
      label: 'คะแนนทักษะ',
      data: hasDNA ? [
        normalizePct(actualScores.Tech || actualScores.tech || 0), 
        normalizePct(actualScores.Logic || actualScores.logic || 0), 
        normalizePct(actualScores.Creative || actualScores.creative || 0),
        normalizePct(actualScores.Lead || actualScores.lead || 0), 
        normalizePct(actualScores.Comm || actualScores.comm || 0), 
        normalizePct(actualScores.Biz || actualScores.biz || 0),
        normalizePct(actualScores.Phys || actualScores.phys || 0), 
        normalizePct(actualScores.Emp || actualScores.emp || 0)
      ] : [0,0,0,0,0,0,0,0],
      backgroundColor: 'rgba(255, 122, 0, 0.2)',
      borderColor: '#ff7a00',
      pointBackgroundColor: '#ff7a00',
      borderWidth: 2,
    }]
  };

  // ดึง Top Job และ Education จาก resultData (ที่เก็บเป็น JSON)
  const jobs = dna?.resultData?.Jobs || [];
  const edu = dna?.resultData?.Edu || [];
  const devPlan = dna?.resultData?.Dev || [];

  return (
    <div style={{ minHeight: '100vh', paddingTop: '80px', paddingBottom: '60px', fontFamily: "'Kanit', sans-serif", color: '#fff', background: '#120c0a' }}>
      {/* Image Background & Corner Gradients */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ 
          position: 'absolute', inset: 0, 
          backgroundImage: "url('/img/bg-room.jpg')", 
          backgroundSize: 'cover', 
          backgroundPosition: 'center',
          opacity: 0.8
        }} />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(18, 12, 10, 0.65)' }} />
        <div style={{ position: 'absolute', top: '-20%', left: '-15%', width: '60vw', height: '60vw', background: 'radial-gradient(circle, rgba(255,122,0,0.35) 0%, transparent 70%)', filter: 'blur(80px)', mixBlendMode: 'screen' }} />
        <div style={{ position: 'absolute', bottom: '-20%', right: '-15%', width: '70vw', height: '70vw', background: 'radial-gradient(circle, rgba(255,75,0,0.3) 0%, transparent 70%)', filter: 'blur(100px)', mixBlendMode: 'screen' }} />
      </div>

      <GlassNav />

      <div className="relative z-10" style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 20px' }}>
        
        {/* 1. Welcome & Status Banner */}
        <div className="glass-panel" style={{ padding: '30px', borderRadius: '16px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: '800', margin: '0 0 8px 0', background: 'linear-gradient(135deg, #fff 0%, #ff7a00 55%, #fff 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              ยินดีต้อนรับกลับมา, {user?.name}! 🚀
            </h1>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '1.1rem' }}>
              นี่คือศูนย์บัญชาการส่วนตัว เพื่อติดตามพัฒนาการสู่เส้นทางอาชีพในฝันของคุณ
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.9rem', color: '#cbd5e1', marginBottom: '4px' }}>สถานะปัจจุบัน</div>
            <div style={{ display: 'inline-block', background: `${badgeColor}20`, color: badgeColor, padding: '8px 16px', borderRadius: '30px', fontWeight: '700', border: `1px solid ${badgeColor}50` }}>
              <i className="fas fa-medal mr-2"></i> {statusBadge}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '24px' }}>
          
          {/* 2. My DNA Profile */}
          <div className="glass-panel hover-glow" style={{ padding: '24px', borderRadius: '28px', display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
              <i className="fas fa-dna mr-3" style={{ color: '#ff7a00' }}></i> My DNA Profile
            </h2>
            
            {hasDNA ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px' }}>
                  <div>
                    <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)' }}>ความแมตช์โดยรวม</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#fff', lineHeight: 1 }}>{matchPct}%</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)' }}>ทักษะโดดเด่น</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#ffb347' }}>{dna.aiTitle}</div>
                  </div>
                </div>
                
                <div style={{ height: '220px', width: '100%', position: 'relative' }}>
                  <Radar data={radarData} options={radarOptions} />
                </div>
                
                <button onClick={() => router.push('/assessment')} style={{ width: '100%', marginTop: '20px', textAlign: 'center', background: 'rgba(255,122,0,0.15)', border: '1px solid #ff7a00', color: '#ffb347', padding: '12px', borderRadius: '16px', fontWeight: 600, cursor: 'pointer' }}>
                  ทำแบบประเมินใหม่ <i className="fas fa-arrow-right ml-2"></i>
                </button>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ fontSize: '3rem', color: 'rgba(255,255,255,0.2)', marginBottom: '16px' }}><i className="fas fa-clipboard-question"></i></div>
                <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '20px' }}>คุณยังไม่ได้ทำแบบประเมินค้นหาตัวตน</p>
                <button onClick={() => router.push('/assessment')} style={{ margin: '0 auto', background: 'linear-gradient(135deg, #ff7a00, #ff4b00)', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '30px', fontWeight: 700, boxShadow: '0 8px 32px rgba(255,107,0,0.4)', cursor: 'pointer' }}>
                  เริ่มต้นทำแบบประเมิน
                </button>
              </div>
            )}
          </div>

          {/* 3. My Career Targets */}
          <div className="glass-panel hover-glow" style={{ padding: '24px', borderRadius: '28px', display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
              <i className="fas fa-bullseye mr-3" style={{ color: '#a55eea' }}></i> My Career Targets
            </h2>
            
            {hasDNA && jobs.length > 0 ? (
              <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.8)', marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>🎯 3 อาชีพที่แนะนำสำหรับคุณ</h3>
                  {jobs.slice(0, 3).map((job, idx) => {
                    const icons = ['fa-briefcase', 'fa-rocket', 'fa-lightbulb'];
                    return (
                      <div key={idx} style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '12px', marginBottom: '8px', borderLeft: '3px solid #a55eea' }}>
                        <div style={{ fontWeight: '700', color: '#fff', display: 'flex', alignItems: 'center' }}>
                          <i className={`fas ${icons[idx] || 'fa-briefcase'} mr-2`} style={{ color: '#a55eea' }}></i> 
                          {job.t.replace(/อันดับ \d+: /, '')}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', marginTop: '6px' }}>{job.d}</div>
                      </div>
                    );
                  })}
                </div>
                
                <div style={{ marginTop: 'auto' }}>
                  <h3 style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.8)', marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>🎓 คณะ/สาขาที่สอดคล้อง</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {edu.slice(0, 2).map((ed, idx) => (
                      <div key={idx} style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '12px', borderLeft: '3px solid #ff7a00' }}>
                        <div style={{ fontWeight: '700', color: '#fff', fontSize: '0.95rem' }}>{ed.t.replace(/อันดับ \d+: /, '')}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : hasDNA ? (
              <div style={{ textAlign: 'center', padding: '40px 0', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <i className="fas fa-tools mb-3" style={{ fontSize: '2rem', color: 'rgba(255,255,255,0.3)' }}></i>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem', marginBottom: '16px' }}>
                  ระบบมีการอัปเกรดใหม่!<br/>ไม่พบข้อมูลอาชีพเจาะลึกจากประวัติเก่าของคุณ
                </p>
                <button onClick={() => router.push('/assessment')} style={{ margin: '0 auto', fontSize: '0.9rem', background: 'rgba(255,122,0,0.15)', border: '1px solid #ff7a00', color: '#ffb347', padding: '8px 16px', borderRadius: '16px', cursor: 'pointer' }}>
                  อัปเดตข้อมูล (ทำประเมินใหม่)
                </button>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <p style={{ color: 'rgba(255,255,255,0.6)' }}>ทำแบบประเมินเพื่อดูอาชีพที่เหมาะสมกับคุณ</p>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          
          {/* 4. Work Simulation History */}
          <div className="glass-panel hover-glow" style={{ padding: '24px', borderRadius: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center' }}>
                <i className="fas fa-gamepad mr-3" style={{ color: '#fed330' }}></i> ประวัติทดลองงาน
              </h2>
              <div style={{ background: 'rgba(254, 211, 48, 0.15)', color: '#fed330', padding: '4px 12px', borderRadius: '20px', fontSize: '0.9rem', fontWeight: '700' }}>
                ทำไปแล้ว {simulations?.length || 0} ครั้ง
              </div>
            </div>

            {simulations && simulations.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflowY: 'auto', paddingRight: '10px' }}>
                {simulations.slice(0, 5).map((sim, idx) => {
                  const score = Number(sim.score) || 0;
                  const scoreColor = score >= 80 ? '#2bcbba' : score >= 60 ? '#fed330' : '#ff4b00';
                  return (
                    <div 
                      key={idx} 
                      onClick={() => setSelectedSim(sim)}
                      className="sim-card hover-glow"
                      style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', transition: 'all 0.2s', border: '1px solid rgba(255,255,255,0.1)' }}
                    >
                      <div>
                        <div style={{ fontWeight: '700', color: '#fff' }}>{sim.jobTitle}</div>
                        <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', marginTop: '4px' }}>
                          <i className="far fa-clock mr-1"></i> {new Date(sim.timestamp).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: '800', color: scoreColor, lineHeight: 1 }}>{score}</div>
                        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)' }}>คะแนน</div>
                      </div>
                    </div>
                  );
                })}
                {simulations.length > 5 && (
                  <div style={{ textAlign: 'center', fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', marginTop: '8px' }}>และอีก {simulations.length - 5} รายการ...</div>
                )}
              </div>
            ) : (
               <div style={{ textAlign: 'center', padding: '30px 0' }}>
                 <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '16px' }}>คุณยังไม่เคยทดลองงานใดๆ เลย</p>
                 <button onClick={() => router.push('/simulation')} style={{ background: 'rgba(255,122,0,0.15)', border: '1px solid #ff7a00', color: '#ffb347', padding: '10px 20px', borderRadius: '16px', fontWeight: 600, cursor: 'pointer' }}>
                   เริ่มทดลองงานครั้งแรก <i className="fas fa-rocket ml-2"></i>
                 </button>
               </div>
            )}
          </div>

          {/* 5. AI Action Plan */}
          <div className="glass-panel hover-glow" style={{ padding: '24px', borderRadius: '28px' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
              <i className="fas fa-clipboard-list mr-3" style={{ color: '#2bcbba' }}></i> AI Action Plan
            </h2>
            
            {hasDNA && devPlan.length > 0 ? (
              <div>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.95rem', marginBottom: '16px' }}>เป้าหมายการพัฒนาตัวเองของคุณ (แนะนำโดย AI):</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {devPlan.map((dev, idx) => (
                    <div key={idx} className="hover-glow" style={{ display: 'flex', gap: '16px', background: 'rgba(255,255,255,0.03)', padding: '16px 20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', transition: 'all 0.3s', cursor: 'pointer' }}>
                      <div style={{ color: '#2bcbba', paddingTop: '2px', fontSize: '1.2rem' }}>
                        <i className="fa-regular fa-circle-check"></i>
                      </div>
                      <div>
                        <div style={{ fontWeight: '700', color: '#fff', marginBottom: '6px', fontSize: '1.05rem' }}>{dev.t}</div>
                        <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', lineHeight: '1.5' }}>{dev.d}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : hasDNA ? (
              <div style={{ textAlign: 'center', padding: '30px 0' }}>
                 <p style={{ color: 'rgba(255,255,255,0.6)' }}>ระบบมีการอัปเกรด โปรดทำประเมินใหม่เพื่อรับ AI Action Plan</p>
                 <button onClick={() => router.push('/assessment')} style={{ marginTop: '12px', fontSize: '0.85rem', background: 'rgba(255,122,0,0.15)', border: '1px solid #ff7a00', color: '#ffb347', padding: '8px 16px', borderRadius: '16px', cursor: 'pointer' }}>
                   ทำประเมินใหม่
                 </button>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '30px 0' }}>
                 <p style={{ color: 'rgba(255,255,255,0.6)' }}>ทำแบบประเมินเพื่อให้ AI วางแผนการพัฒนาให้คุณ</p>
              </div>
            )}
          </div>
          
        </div>
      </div>
      
      {/* Simulation Details Modal */}
      {selectedSim && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto', borderRadius: '20px', padding: '30px', position: 'relative' }}>
            <button 
              onClick={() => setSelectedSim(null)}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(255,255,255,0.1)', border: 'none', width: '36px', height: '36px', borderRadius: '50%', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <i className="fas fa-times"></i>
            </button>
            
            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px', marginBottom: '20px' }}>
              <div style={{ color: '#38bdf8', fontSize: '0.9rem', fontWeight: '600', marginBottom: '4px' }}>รายงานผลการทดลองงาน</div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '0 0 8px 0' }}>{selectedSim.jobTitle}</h2>
              <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
                <i className="far fa-clock mr-2"></i> วันที่ทำแบบทดสอบ: {new Date(selectedSim.timestamp).toLocaleString('th-TH')}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '20px', marginBottom: '24px', flexWrap: 'wrap' }}>
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '16px 24px', borderRadius: '20px', textAlign: 'center', flexGrow: 1, border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', marginBottom: '4px' }}>คะแนนรวม</div>
                <div style={{ fontSize: '2.5rem', fontWeight: '800', color: Number(selectedSim.score) >= 80 ? '#2bcbba' : Number(selectedSim.score) >= 60 ? '#fed330' : '#ff4b00', lineHeight: 1 }}>
                  {selectedSim.score} <span style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.4)' }}>/100</span>
                </div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '20px', flexGrow: 2, border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: '0.9rem', color: '#ff7a00', fontWeight: '700', marginBottom: '8px' }}><i className="fas fa-bolt mr-2"></i> Executive Summary</div>
                <div style={{ fontSize: '0.95rem', color: '#fff', lineHeight: 1.6 }}>
                  {selectedSim.evaluation?.executive_summary || selectedSim.evaluation?.feedback || 'ไม่มีข้อมูลสรุป'}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '24px' }}>
               <div style={{ background: 'rgba(43, 203, 186, 0.05)', border: '1px solid rgba(43, 203, 186, 0.2)', padding: '16px', borderRadius: '20px' }}>
                  <div style={{ color: '#2bcbba', fontWeight: '700', marginBottom: '12px' }}><i className="fas fa-check-circle mr-2"></i> สิ่งที่ทำได้ยอดเยี่ยม</div>
                  <ul style={{ margin: 0, paddingLeft: '20px', color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                     {(selectedSim.evaluation?.strengths || []).map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
               </div>
               <div style={{ background: 'rgba(255, 75, 0, 0.05)', border: '1px solid rgba(255, 75, 0, 0.2)', padding: '16px', borderRadius: '20px' }}>
                  <div style={{ color: '#ff4b00', fontWeight: '700', marginBottom: '12px' }}><i className="fas fa-arrow-up mr-2"></i> สิ่งที่ต้องพัฒนาเพิ่ม</div>
                  <ul style={{ margin: 0, paddingLeft: '20px', color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                     {(selectedSim.evaluation?.improvements || []).map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
               </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '20px', marginBottom: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
               <div style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.6)', fontWeight: '700', marginBottom: '8px' }}>โจทย์ที่ได้รับ:</div>
               <div style={{ fontSize: '0.95rem', color: '#fff', background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '12px', lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: (selectedSim.task || '').replace(/\\n/g, '<br>') }} />
               
               <div style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.6)', fontWeight: '700', marginBottom: '8px', marginTop: '20px' }}>คำตอบของคุณ:</div>
               <div style={{ fontSize: '0.95rem', color: '#fff', background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '12px', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                 {selectedSim.userWork || '-'}
               </div>
            </div>
            
            {selectedSim.evaluation?.next_action && (
              <div style={{ background: 'linear-gradient(90deg, rgba(255, 122, 0, 0.1), transparent)', borderLeft: '3px solid #ff7a00', padding: '16px', borderRadius: '0 12px 12px 0' }}>
                 <div style={{ color: '#ffb347', fontWeight: '700', marginBottom: '6px' }}><i className="fas fa-compass mr-2"></i> Next Action (ก้าวต่อไปของคุณ)</div>
                 <div style={{ fontSize: '0.95rem', color: '#fff' }}>{selectedSim.evaluation.next_action}</div>
              </div>
            )}
            
          </div>
        </div>
      )}
      
      {/* Add inline CSS for glassmorphism and animations */}
      <style dangerouslySetInnerHTML={{__html: `
        .glass-panel {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(40px);
          -webkit-backdrop-filter: blur(40px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 24px 64px rgba(0, 0, 0, 0.4);
          transition: all 0.3s ease-out;
        }
        .hover-glow:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 40px rgba(255, 122, 0, 0.2);
          border-color: rgba(255, 122, 0, 0.4);
        }
        .sim-card:hover {
          background: rgba(255,255,255,0.12) !important;
          border-color: rgba(255, 122, 0, 0.4);
        }
      `}} />
    </div>
  );
}

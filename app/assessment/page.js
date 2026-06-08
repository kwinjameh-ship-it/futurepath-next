'use client';
import { useState, useEffect, useRef } from 'react';
import GlassNav from '@/components/GlassNav';
import UserBar from '@/components/UserBar';
import useAuth from '@/lib/useAuth';
import {
  Chart, RadarController, RadialLinearScale,
  PointElement, LineElement, Filler, Tooltip, Legend,
} from 'chart.js';

Chart.register(RadarController, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const SHEET_WEBAPP_URL =
  'https://script.google.com/macros/s/AKfycbzu9Jv7aaKSJf9JcqWn9FWM3XLEXuATwtCfysr0cw7lzEX5L_KShNTmjmAhZl4-d2t1dw/exec';

const levelConfig = {
  1: { label: 'น้อยที่สุด', color: '#ff4d4d' },
  2: { label: 'น้อย',       color: '#ffa502' },
  3: { label: 'ปานกลาง',   color: '#fed330' },
  4: { label: 'มาก',        color: '#2bcbba' },
  5: { label: 'มากที่สุด',  color: '#26de81' },
};

const skillsData = [
  { id: 'Tech',     title: 'Technology',    th: 'เทคโนโลยี',    icon: 'fa-microchip',          questions: [
    {en:'AI Collaboration',th:'สามารถใช้ AI (เช่น ChatGPT) ช่วยให้ทำงานเสร็จไวขึ้นได้'},
    {en:'Digital Security',th:'รู้วิธีตั้งรหัสผ่านให้ปลอดภัยและระวังตัวจากภัยไซเบอร์'},
    {en:'Cloud Tools',th:'ใช้งาน Google Workspace, OneDrive หรือ Notion ได้คล่องแคล่ว'},
    {en:'Coding Logic',th:'เข้าใจหลักการคิดแบบเป็นระบบและมีเหตุผลเป็นขั้นตอน'},
    {en:'No-code Tools',th:'เคยสร้างเว็บไซต์หรืองานง่ายๆ โดยไม่ต้องเขียนโค้ด'},
    {en:'Tech Adapt',th:'เรียนรู้การใช้โปรแกรมหรือแอปพลิเคชันใหม่ๆ ได้รวดเร็ว'},
    {en:'Data Viz',th:'นำข้อมูลตัวเลขมาแปลงเป็นกราฟหรือแผนภาพให้ดูเข้าใจง่ายได้'},
    {en:'Automation',th:'ชอบหาวิธีตั้งค่าให้ระบบทำงานซ้ำๆ แทนคนอัตโนมัติ'},
    {en:'Hardware',th:'เข้าใจการทำงานของคอมพิวเตอร์และอุปกรณ์ไอทีเบื้องต้น'},
    {en:'Future Trends',th:'ติดตามข่าวสารเรื่องเทคโนโลยีและนวัตกรรมใหม่ๆ อยู่เสมอ'},
  ]},
  { id: 'Logic',    title: 'Analytical',    th: 'การวิเคราะห์', icon: 'fa-brain',               questions: [
    {en:'Critical Thinking',th:'แยกแยะข้อเท็จจริง และไม่เชื่ออะไรทันทีที่เห็น'},
    {en:'Pattern Search',th:'มองเห็นความเชื่อมโยงของข้อมูลที่ซับซ้อนได้รวดเร็ว'},
    {en:'Statistics',th:'เข้าใจการคิดเปอร์เซ็นต์และอ่านค่าทางสถิติเบื้องต้นได้'},
    {en:'Optimization',th:'ชอบหาวิธีทำให้การทำงานใช้เวลาน้อยลงแต่ได้ผลดีขึ้น'},
    {en:'Root Cause',th:'เมื่อเกิดปัญหา จะพยายามสืบหาต้นตอที่แท้จริงให้เจอ'},
    {en:'Data Logic',th:'ตัดสินใจเรื่องสำคัญโดยใช้ข้อมูล มากกว่าใช้ความรู้สึก'},
    {en:'Strategy',th:'มักจะวางแผนและคิดล่วงหน้าก่อนลงมือทำเสมอ'},
    {en:'Hypothesis',th:'ชอบตั้งคำถามและหาข้อมูลมาพิสูจน์สมมติฐาน'},
    {en:'Details',th:'ใส่ใจในรายละเอียดเล็กๆ น้อยๆ และมีความรอบคอบสูง'},
    {en:'Priority',th:'สามารถจัดลำดับความสำคัญของงานที่เข้ามาพร้อมกันได้ดี'},
  ]},
  { id: 'Creative', title: 'Creative',      th: 'สร้างสรรค์',   icon: 'fa-wand-magic-sparkles', questions: [
    {en:'Idea Gen',th:'มักจะคิดไอเดียใหม่ๆ ออกมาได้รวดเร็วและแตกต่างจากคนอื่น'},
    {en:'Visual Design',th:'มีเซนส์ด้านความสวยงามและการเลือกจับคู่สีที่ลงตัว'},
    {en:'Storytelling',th:'สามารถเล่าเรื่องราวธรรมดาให้น่าสนใจและดึงดูดใจได้'},
    {en:'Lateral Think',th:'ชอบคิดนอกกรอบและมองมุมต่างในปัญหาเดิมๆ'},
    {en:'Content',th:'สนุกกับการสร้างคอนเทนต์ เช่น วิดีโอ รูปภาพ หรือบทความ'},
    {en:'Empathy',th:'สามารถเข้าใจความรู้สึกและมุมมองของผู้อื่นได้ดี'},
    {en:'Prototyping',th:'ชอบสร้างแบบจำลองหรือสเก็ตช์ภาพร่างให้เห็นภาพรวมไวๆ'},
    {en:'Aesthetics',th:'ให้ความสำคัญกับความสวยงามของการออกแบบทุกชนิด'},
    {en:'Improv',th:'แก้ปัญหาเฉพาะหน้าและพลิกแพลงตามสถานการณ์ได้ดี'},
    {en:'Branding',th:'เข้าใจวิธีสร้างเอกลักษณ์ให้ผลงานหรือแบรนด์เป็นที่จดจำ'},
  ]},
  { id: 'Lead',     title: 'Leadership',    th: 'ภาวะผู้นำ',    icon: 'fa-crown',               questions: [
    {en:'Orchestration',th:'สามารถจัดสรรคนและบริหารงานหลายอย่างให้ลงตัวได้'},
    {en:'Conflict',th:'เป็นคนกลางไกล่เกลี่ยเมื่อเกิดข้อขัดแย้งในกลุ่มได้ดี'},
    {en:'Vision',th:'มองเห็นเป้าหมายระยะยาวและชี้แนะทิศทางให้ทีมได้'},
    {en:'Responsibility',th:'กล้ารับผิดชอบทั้งในยามที่สำเร็จและเมื่อเกิดข้อผิดพลาด'},
    {en:'Mentoring',th:'ชอบที่จะสอนและให้คำแนะนำเพื่อพัฒนาศักยภาพของคนอื่น'},
    {en:'Resilience',th:'สามารถดึงตัวเองกลับมาได้เร็วเมื่อเจอกับความผิดหวัง'},
    {en:'Diversity',th:'เปิดใจรับฟังความคิดเห็นจากคนที่มีมุมมองต่างจากเรา'},
    {en:'Delegation',th:'รู้จักแบ่งงานให้เหมาะสมกับความสามารถของแต่ละคน'},
    {en:'Motivation',th:'รู้ว่าควรใช้คำพูดแบบไหนเพื่อกระตุ้นและให้กำลังใจทีม'},
    {en:'Ethics',th:'ยึดมั่นในความถูกต้อง โปร่งใส และยุติธรรมในการทำงาน'},
  ]},
  { id: 'Comm',     title: 'Communication', th: 'การสื่อสาร',   icon: 'fa-comments',            questions: [
    {en:'Active Listen',th:'ตั้งใจฟังจนจบและสามารถจับประเด็นสำคัญของคนพูดได้'},
    {en:'Speaking',th:'สามารถพูดนำเสนอต่อหน้าคนเยอะๆ ได้อย่างมั่นใจ'},
    {en:'Persuasion',th:'มีวาทศิลป์ในการโน้มน้าวใจให้คนอื่นคล้อยตามได้ดี'},
    {en:'Writing',th:'สามารถเขียนข้อความหรืออีเมลสื่อสารได้กระชับและเข้าใจง่าย'},
    {en:'Body Lang',th:'ใช้สีหน้า น้ำเสียง และท่าทางประกอบการอธิบายได้อย่างดี'},
    {en:'Networking',th:'กล้าเข้าสังคมและทำความรู้จักกับเพื่อนใหม่ๆ ได้เก่ง'},
    {en:'Negotiation',th:'สามารถพูดคุยต่อรองเพื่อให้ได้ประโยชน์ร่วมกันทั้งสองฝ่าย'},
    {en:'Feedback',th:'พร้อมรับฟังคำติชมและนำมาปรับปรุงตัวเองโดยไม่โกรธ'},
    {en:'Media Mix',th:'รู้ว่าสถานการณ์แบบไหนควรใช้แชท โทรศัพท์ หรือนัดเจอ'},
    {en:'Social Pulse',th:'สามารถอ่านบรรยากาศในวงสนทนาและกาลเทศะออก'},
  ]},
  { id: 'Biz',      title: 'Business',      th: 'ธุรกิจ',        icon: 'fa-chart-line',          questions: [
    {en:'Market Pulse',th:'มองเห็นเทรนด์และความต้องการใหม่ๆ ของตลาดเสมอ'},
    {en:'Financials',th:'เข้าใจเรื่องรายรับ รายจ่าย และการคำนวณกำไรเบื้องต้น'},
    {en:'ROI Mindset',th:'มักจะคิดถึงความคุ้มค่าก่อนที่จะลงเงินหรือลงแรงทำอะไร'},
    {en:'Customer Exp',th:'เอาใจใส่และให้ความสำคัญกับความรู้สึกของลูกค้าเป็นอันดับต้นๆ'},
    {en:'Owner Mindset',th:'ทำงานด้วยความรู้สึกรับผิดชอบเหมือนตัวเองเป็นเจ้าของกิจการ'},
    {en:'Resource',th:'สามารถบริหารงบประมาณและเวลาที่มีอยู่อย่างจำกัดให้เกิดประโยชน์สุด'},
    {en:'Sales Psych',th:'เข้าใจว่าปัจจัยอะไรที่ทำให้ลูกค้าตัดสินใจซื้อหรือใช้บริการ'},
    {en:'Competitor',th:'ชอบสังเกตและวิเคราะห์ว่าคู่แข่งในตลาดกำลังทำอะไรอยู่'},
    {en:'Risk',th:'มักจะประเมินความเสี่ยงและเตรียมแผนสำรองไว้เสมอ'},
    {en:'Global View',th:'สนใจข่าวสารเศรษฐกิจ ทิศทางธุรกิจ และความเคลื่อนไหวรอบโลก'},
  ]},
];

export default function AssessmentPage() {
  const { user, loading } = useAuth();
  const [currentTab, setCurrentTab]   = useState(0);
  const [values, setValues]           = useState(() => {
    const init = {};
    skillsData.forEach(s => s.questions.forEach((_, qi) => { init[`${s.id}_${qi}`] = 3; }));
    return init;
  });
  const [apiStatus, setApiStatus]     = useState('loading');
  const [showResult, setShowResult]   = useState(false);
  const [resultData, setResultData]   = useState(null);
  const [scores, setScores]           = useState({});
  const [submitting, setSubmitting]   = useState(false);
  const radarRef   = useRef(null);
  const radarChart = useRef(null);

  useEffect(() => { checkAPI(); }, []);

  useEffect(() => {
    if (showResult && resultData && radarRef.current) {
      if (radarChart.current) radarChart.current.destroy();
      Chart.defaults.color       = 'rgba(220,230,255,0.7)';
      Chart.defaults.font.family = "'Kanit', sans-serif";
      radarChart.current = new Chart(radarRef.current, {
        type: 'radar',
        data: {
          labels: skillsData.map(s => s.th),
          datasets: [{
            label: 'คะแนนทักษะ',
            data: skillsData.map(s => scores[s.id] || 0),
            backgroundColor: 'rgba(255,122,0,0.15)',
            borderColor: '#ff7a00',
            borderWidth: 2,
            pointBackgroundColor: '#ff4b00',
            pointRadius: 5,
          }],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          scales: { r: { min: 0, max: 100, ticks: { stepSize: 20, font: { family: 'Kanit' } }, grid: { color: 'rgba(255,255,255,0.10)' }, angleLines: { color: 'rgba(255,255,255,0.10)' } } },
          plugins: { legend: { display: false } },
        },
      });
    }
  }, [showResult, resultData]);

  async function checkAPI() {
    try {
      const res = await fetch('/api/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ping' }),
      });
      if (!res.ok) throw new Error();
      setApiStatus('success');
      setTimeout(() => setApiStatus('hidden'), 3000);
    } catch {
      setApiStatus('error');
    }
  }

  function handleSlider(id, val) { setValues(prev => ({ ...prev, [id]: Number(val) })); }

  async function calculateDNA() {
    setSubmitting(true);
    const newScores = {};
    let totalSum = 0;
    skillsData.forEach(s => {
      let sum = 0;
      s.questions.forEach((_, qi) => { sum += values[`${s.id}_${qi}`]; });
      newScores[s.id] = Math.round((sum / 50) * 100);
      totalSum += newScores[s.id];
    });
    const matchPct = Math.round(totalSum / 6);
    setScores(newScores);

    const fallback = {
      Title: 'ผู้นำแห่งนวัตกรรมและการพัฒนา',
      Desc: 'ทักษะของคุณมีความโดดเด่นหลากหลาย สามารถประยุกต์ใช้ได้ทั้งสายงานการศึกษา การพัฒนาสังคม และธุรกิจเทคโนโลยี',
      AnalysisDetail: 'จากคะแนนของคุณ แสดงให้เห็นถึงความสมดุลระหว่างการคิดวิเคราะห์เชิงตรรกะและความคิดสร้างสรรค์ คุณสามารถทำงานที่ต้องใช้ความละเอียดรอบคอบ ควบคู่ไปกับการทำงานร่วมกับผู้อื่นได้อย่างมีประสิทธิภาพ ทักษะเหล่านี้เป็นที่ต้องการสูงในตลาดยุคดิจิทัล',
      Edu: [
        {t:'อันดับ 1: คณะครุศาสตร์ สาขาวิทยาศาสตร์และเทคโนโลยี',d:'ใช้ตรรกะและเทคโนโลยีเพื่อยกระดับคุณภาพผู้เรียน'},
        {t:'อันดับ 2: คณะครุศาสตร์ สาขาการศึกษาปฐมวัย',d:'บูรณาการกิจกรรมพัฒนาการหลักทั้ง 6 ด้าน'},
        {t:'อันดับ 3: คณะสังคมสงเคราะห์ศาสตร์',d:'ใช้ทักษะด้านการสื่อสารเพื่อสนับสนุนนโยบายรัฐ'},
        {t:'อันดับ 4: คณะวิศวกรรมศาสตร์ คอมพิวเตอร์',d:'รองรับทักษะด้าน Tech ที่สามารถสร้างระบบด้วยโปรแกรมมิ่ง'},
        {t:'อันดับ 5: คณะบริหารธุรกิจ การจัดการดิจิทัล',d:'นำระบบคณิตศาสตร์มาประยุกต์ใช้ในการจัดการสมัยใหม่'},
      ],
      Jobs: [
        {t:'อันดับ 1: ครูผู้สอนวิทยาศาสตร์และเทคโนโลยี',d:'พัฒนากระบวนการเรียนรู้ใหม่ๆ'},
        {t:'อันดับ 2: ครูประจำศูนย์พัฒนาเด็กเล็ก',d:'จัดประสบการณ์และประเมินพัฒนาการ'},
        {t:'อันดับ 3: นักพัฒนาสังคม',d:'ทำงานเพื่อพัฒนาคุณภาพชีวิตประชาชน'},
        {t:'อันดับ 4: นักเขียนโปรแกรม (Programmer)',d:'สร้างสรรค์แอปพลิเคชัน'},
        {t:'อันดับ 5: นักวิเคราะห์ข้อมูลธุรกิจ',d:'ใช้สถิติช่วยองค์กรตัดสินใจ'},
      ],
      Dev: [{t:'Data Visualization & Analysis',d:'ฝึกแปลงข้อมูลซับซ้อนให้เป็นภาพ'}],
      Refs: [
        {t:'World Economic Forum',d:'รายงานทักษะแห่งอนาคต (Future of Jobs Report)'},
        {t:'O*NET Online',d:'ฐานข้อมูลทักษะและอาชีพมาตรฐานสากล'}
      ]
    };

    let aiResult = fallback;
    if (apiStatus === 'success' || apiStatus === 'hidden') {
      try {
        const promptText = `วิเคราะห์คะแนนทักษะต่อไปนี้: ${JSON.stringify(newScores)}. ตอบกลับเป็นออบเจกต์ JSON เท่านั้น โครงสร้างนี้: {"Title": "ชื่อสไตล์จุดแข็ง", "Desc": "คำอธิบายสั้นๆ", "AnalysisDetail": "รายละเอียดเชิงลึกของการวิเคราะห์ ทิศทางแนวโน้มตลาดแรงงาน และคำแนะนำเชิงลึก", "Edu": [{"t": "อันดับ 1: สาขา", "d": "เหตุผล"}...ถึง 5], "Jobs": [{"t": "อันดับ 1: อาชีพ", "d": "เหตุผล"}...ถึง 5], "Dev": [{"t": "ทักษะที่ควรฝึก", "d": "คำแนะนำ"}...ถึง 3], "Refs": [{"t": "ชื่อแหล่งข้อมูลอ้างอิง", "d": "เนื้อหาอ้างอิงที่เกี่ยวข้องกับทักษะนี้"}]}`;
        const res = await fetch('/api/proxy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'generate', prompt: promptText }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
            let txt = data.candidates[0].content.parts[0].text
              .replace(/```json/g, '').replace(/```/g, '').trim();
            let parsed = JSON.parse(txt);
            let extracted = parsed.Profile || parsed.profile || parsed;
            
            if (extracted && (extracted.Title || extracted.title)) {
              const formatArr = (arr) => {
                if (!Array.isArray(arr)) return null;
                return arr.map(e => ({
                  t: e.t || e.type || e.name || e.Title || e.title || '',
                  d: e.d || e.description || e.desc || e.Desc || e.Description || ''
                })).filter(e => e.t && e.d);
              };

              aiResult = {
                Title: extracted.Title || extracted.title || fallback.Title,
                Desc: extracted.Desc || extracted.Description || extracted.desc || extracted.description || fallback.Desc,
                AnalysisDetail: extracted.AnalysisDetail || extracted.analysisDetail || extracted.Analysis || fallback.AnalysisDetail,
                Edu: formatArr(extracted.Edu || extracted.Education || extracted.edu || extracted.education) || fallback.Edu,
                Jobs: formatArr(extracted.Jobs || extracted.jobs) || fallback.Jobs,
                Dev: formatArr(extracted.Dev || extracted.Development || extracted.dev || extracted.development) || fallback.Dev,
                Refs: formatArr(extracted.Refs || extracted.References || extracted.refs || extracted.references) || fallback.Refs
              };
              
              if (aiResult.Edu.length === 0) aiResult.Edu = fallback.Edu;
              if (aiResult.Jobs.length === 0) aiResult.Jobs = fallback.Jobs;
              if (aiResult.Dev.length === 0) aiResult.Dev = fallback.Dev;
              if (aiResult.Refs.length === 0) aiResult.Refs = fallback.Refs;
            } else {
              aiResult = fallback;
            }
          }
        }
      } catch { aiResult = fallback; }
    }

    try {
      await fetch(SHEET_WEBAPP_URL, {
        method: 'POST', mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ action: 'assessment', name: user.name, email: user.email, matchPct, scores: newScores, aiTitle: aiResult.Title }),
      });
    } catch {}

    setResultData({ ...aiResult, matchPct });
    setShowResult(true);
    setSubmitting(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Kanit,sans-serif', color: 'var(--text-sub)' }}>
      <i className="fas fa-spinner fa-spin mr-3" style={{ color: 'var(--accent-color)' }} /> กำลังโหลด...
    </div>
  );

  const s        = skillsData[currentTab];
  const progress = ((currentTab + 1) / skillsData.length) * 100;

  /* ─── RESULT VIEW ─── */
  if (showResult && resultData) return (
    <div style={{ minHeight: '100vh', background: '#120c0a', color: '#fff', fontFamily: "'Kanit', sans-serif" }}>
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
      <main style={{ position: 'relative', zIndex: 10,  maxWidth: '1000px', margin: '0 auto', padding: '80px 24px 80px'  }}>
        <UserBar name={user.name} email={user.email} />

        {/* Match Score */}
        <div
          className="hover-lift"
          style={{
            textAlign: 'center',
            padding: '52px 40px',
            borderRadius: 'var(--r-xl)',
            marginBottom: '24px',
            background: 'linear-gradient(135deg, rgba(255,122,0,0.08), rgba(255,75,0,0.08))',
            border: '1.5px solid var(--accent-color)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <p className="section-eyebrow" style={{ marginBottom: '16px' }}>ผลการวิเคราะห์ DNA ของคุณ</p>
          <div
            className="hover-lift"
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: '110px', height: '110px', borderRadius: '50%',
              border: '4px solid var(--accent-color)',
              background: 'var(--card-bg)',
              boxShadow: '0 0 28px var(--accent-glow)',
              marginBottom: '20px',
              flexDirection: 'column',
            }}
          >
            <div style={{ fontSize: '2.6rem', fontWeight: 900, color: 'var(--accent-color)', lineHeight: 1 }}>
              {resultData.matchPct}%
            </div>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.08em' }}>MATCH</span>
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '10px' }}>{resultData.Title}</h2>
          <p style={{ fontSize: '0.97rem', color: 'var(--text-sub)', maxWidth: '580px', margin: '0 auto' }}>{resultData.Desc}</p>
        </div>

        {/* Charts + Score Bars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" style={{ marginBottom: '24px' }}>
          <div
            className="hover-lift"
            style={{
              padding: '36px', borderRadius: 'var(--r-lg)',
              background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
              textAlign: 'center',
            }}
          >
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-sub)', marginBottom: '20px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              แผนภูมิเรดาร์ทักษะ
            </h3>
            <div style={{ height: '280px', position: 'relative' }}><canvas ref={radarRef} /></div>
          </div>
          <div
            className="hover-lift"
            style={{
              padding: '36px', borderRadius: 'var(--r-lg)',
              background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
            }}
          >
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-sub)', marginBottom: '24px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              คะแนนสรุปรายหมวด
            </h3>
            {skillsData.map(sk => (
              <div key={sk.id} style={{ marginBottom: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: '7px', fontWeight: 500 }}>
                  <span style={{ color: 'var(--text-sub)' }}>{sk.th}</span>
                  <span style={{ color: 'var(--accent-color)', fontWeight: 700 }}>{scores[sk.id]}%</span>
                </div>
                <div style={{ height: '7px', borderRadius: '8px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: '8px',
                    width: `${scores[sk.id]}%`,
                    background: 'linear-gradient(90deg, var(--accent-color), var(--secondary-color))',
                    transition: 'width 0.8s var(--ease-out)',
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Analysis Detail */}
        {resultData.AnalysisDetail && (
          <div
            className="hover-lift"
            style={{
              padding: '36px', borderRadius: 'var(--r-xl)',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))', 
              border: '1px solid var(--glass-border)',
              marginBottom: '24px',
              textAlign: 'center'
            }}
          >
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-color)', marginBottom: '16px' }}>
              <i className="fa-solid fa-magnifying-glass-chart mr-2" /> บทวิเคราะห์เชิงลึก
            </h3>
            <p style={{ fontSize: '1rem', color: 'var(--text-main)', lineHeight: 1.8, maxWidth: '800px', margin: '0 auto' }}>
              {resultData.AnalysisDetail}
            </p>
          </div>
        )}

        {/* AI Suggestions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6" style={{ marginBottom: '24px' }}>
          {[
            { title: '🎓 คณะ/สาขาที่แนะนำ', items: resultData.Edu, accent: 'var(--accent-color)' },
            { title: '💼 อาชีพที่เหมาะสม',   items: resultData.Jobs, accent: '#ff4b00'            },
            { title: '📈 ทักษะที่ควรพัฒนา',  items: resultData.Dev,  accent: '#fed330'            },
          ].map(sec => (
            <div
              key={sec.title}
              className="hover-lift"
              style={{
                padding: '32px 28px', borderRadius: 'var(--r-xl)',
                background: 'var(--card-bg)', border: '1px solid var(--card-border)',
                boxShadow: '0 4px 12px var(--shadow-color)', 
              }}
            >
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: sec.accent, marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {sec.title}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {sec.items?.map((item, i) => {
                  const cleanTitle = item.t.replace(/^อันดับ\s*\d+\s*:\s*/, '');
                  return (
                    <div key={i} style={{ paddingBottom: i !== sec.items.length - 1 ? '20px' : '0', marginBottom: i !== sec.items.length - 1 ? '20px' : '0', borderBottom: i !== sec.items.length - 1 ? '1px dashed rgba(255,255,255,0.07)' : 'none' }}>
                      <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                        <div
                          style={{
                            width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
                            background: `${sec.accent}15`, color: sec.accent,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 800, fontSize: '0.85rem', border: `1px solid ${sec.accent}40`,
                            marginTop: '2px'
                          }}
                        >
                          {i + 1}
                        </div>
                        <div>
                          <p style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px', lineHeight: 1.45 }}>
                            {cleanTitle}
                          </p>
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)', lineHeight: 1.7 }}>
                            {item.d}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* References */}
        {resultData.Refs && resultData.Refs.length > 0 && (
          <div
            className="hover-lift"
            style={{
              padding: '32px 28px', borderRadius: 'var(--r-xl)',
              background: 'var(--card-bg)', border: '1px dashed var(--glass-border)',
              marginBottom: '32px'
            }}
          >
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-sub)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fa-solid fa-book-bookmark" /> ข้อมูลอ้างอิงและบรรณานุกรม
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              {resultData.Refs.map((ref, i) => (
                <li key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <i className="fa-solid fa-link" style={{ color: 'var(--accent-color)', marginTop: '4px', fontSize: '0.85rem' }} />
                  <div>
                    <strong style={{ display: 'block', color: 'var(--text-main)', fontSize: '0.95rem', marginBottom: '6px' }}>{ref.t}</strong>
                    <span style={{ color: 'var(--text-sub)', fontSize: '0.85rem', lineHeight: 1.6, display: 'block' }}>{ref.d}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '24px' }}>
          <a href="/home" className="btn-outline" style={{ textDecoration: 'none' }}>
            <i className="fa-solid fa-house" /> หน้าหลัก
          </a>
          <button onClick={() => window.print()} className="btn-primary" style={{ background: '#fff', color: '#000', boxShadow: 'none' }}>
            <i className="fa-solid fa-print" /> พิมพ์ PDF
          </button>
          <button onClick={() => { setShowResult(false); setCurrentTab(0); }} className="btn-outline">
            <i className="fa-solid fa-rotate-right" /> ทำใหม่
          </button>
        </div>
      </main>
    </div>
  );

  /* ─── ASSESSMENT VIEW ─── */
  return (
    <div style={{ minHeight: '100vh', background: '#120c0a', color: '#fff', fontFamily: "'Kanit', sans-serif" }}>
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

      <main style={{ position: 'relative', zIndex: 10,  maxWidth: '1000px', margin: '0 auto', padding: '80px 24px 80px'  }}>
        <UserBar name={user.name} email={user.email} />

        {/* API Status */}
        {apiStatus === 'loading' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 18px', borderRadius: 'var(--r-md)', marginBottom: '20px', fontSize: '0.87rem', fontWeight: 600, background: 'rgba(254,211,48,0.08)', color: '#fed330', border: '1px solid rgba(254,211,48,0.3)' }}>
            <i className="fas fa-spinner fa-spin" /> กำลังตรวจสอบการเชื่อมต่อระบบ AI...
          </div>
        )}
        {apiStatus === 'success' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 18px', borderRadius: 'var(--r-md)', marginBottom: '20px', fontSize: '0.87rem', fontWeight: 600, background: 'var(--accent-dim)', color: 'var(--accent-color)', border: '1px solid rgba(255,122,0,0.3)' }}>
            <i className="fas fa-check-circle" /> เชื่อมต่อระบบ AI สำเร็จ
          </div>
        )}
        {apiStatus === 'error' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 18px', borderRadius: 'var(--r-md)', marginBottom: '20px', fontSize: '0.87rem', fontWeight: 600, background: 'rgba(255,77,77,0.08)', color: '#ff4d4d', border: '1px solid rgba(255,77,77,0.3)' }}>
            <i className="fas fa-exclamation-triangle" /> ไม่สามารถเชื่อมต่อ AI ได้ — ระบบจะใช้โหมดสำรอง (Fallback)
          </div>
        )}

        {/* Header + Progress */}
        <div 
          className="fade-in-scale"
          style={{ 
            textAlign: 'center', 
            marginBottom: '36px',
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '32px',
            padding: '40px 32px',
            boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.2), 0 24px 64px rgba(0, 0, 0, 0.4)'
          }}
        >
          <p style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#ffb347', opacity: 0.9, marginBottom: '12px' }}>
            แบบทดสอบทักษะ {currentTab + 1} / {skillsData.length}
          </p>
          <h1
            style={{
              fontSize: 'clamp(1.8rem, 4.5vw, 2.5rem)',
              fontWeight: 900,
              letterSpacing: '0.12em',
              background: 'linear-gradient(135deg, #fff 0%, #ffb347 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              marginBottom: '28px',
              textShadow: '0 4px 24px rgba(255,122,0,0.3)',
            }}
          >
            FUTUREPATH AI ASSESSMENT
          </h1>

          {/* Progress Bar */}
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '12px', fontWeight: 600 }}>
              {skillsData.map((sk, i) => (
                <span key={sk.id} style={{ 
                  color: i <= currentTab ? '#fff' : 'rgba(255,255,255,0.4)', 
                  fontWeight: i === currentTab ? 800 : 500,
                  textShadow: i === currentTab ? '0 0 12px rgba(255,122,0,0.8)' : 'none',
                  transition: 'color 0.3s ease'
                }}>
                  {sk.th}
                </span>
              ))}
            </div>
            <div style={{ height: '8px', borderRadius: '8px', background: 'rgba(0,0,0,0.4)', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{
                height: '100%', borderRadius: '8px',
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #ff7a00, #ffb347)',
                boxShadow: '0 0 10px rgba(255,122,0,0.8)',
                transition: 'width 0.6s cubic-bezier(0.65, 0, 0.35, 1)',
              }} />
            </div>
          </div>
        </div>

        {/* Skill Card */}
        <div
          style={{
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(16px)',
            border: '1px solid var(--glass-border)',
            borderRadius: 'var(--r-xl)',
            padding: '36px',
            marginBottom: '24px',
          }}
        >
          {/* Category Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px', paddingBottom: '20px', borderBottom: '1px solid var(--glass-border)' }}>
            <div
              style={{
                width: '52px', height: '52px', borderRadius: '14px',
                background: 'var(--accent-dim)', border: '1px solid var(--glass-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}
            >
              <i className={`fa-solid ${s.icon}`} style={{ fontSize: '1.4rem', color: 'var(--accent-color)' }} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-color)', marginBottom: '2px' }}>{s.th}</h2>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{s.title} Group</span>
            </div>
          </div>

          {/* Questions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {s.questions.map((q, qi) => {
              const key = `${s.id}_${qi}`;
              const v   = values[key];
              const cfg = levelConfig[v];
              return (
                <div
                  key={key}
                  style={{
                    padding: '20px 22px',
                    borderRadius: 'var(--r-md)',
                    background: 'var(--card-bg)',
                    border: '1px solid var(--card-border)',
                  }}
                >
                  <div style={{ marginBottom: '12px' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.97rem', color: 'var(--text-main)' }}>
                      {qi + 1}. {q.en}
                    </span>
                    <span style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {q.th}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <input
                      type="range" min="1" max="5" value={v}
                      onChange={e => handleSlider(key, e.target.value)}
                      style={{ flex: 1, height: '4px', cursor: 'pointer' }}
                    />
                    <div
                      style={{
                        minWidth: '100px',
                        padding: '6px 14px',
                        borderRadius: 'var(--r-pill)',
                        textAlign: 'center',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        color: '#000',
                        background: cfg.color,
                        flexShrink: 0,
                        letterSpacing: '0.03em',
                      }}
                    >
                      {cfg.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Nav Buttons */}
        <div style={{ display: 'flex', gap: '16px' }}>
          {currentTab > 0 && (
            <button
              onClick={() => {
                setCurrentTab(t => t - 1);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              style={{
                padding: '13px 28px', borderRadius: 'var(--r-pill)',
                background: 'transparent', border: '1px solid var(--glass-border)',
                color: 'var(--text-main)', cursor: 'pointer', fontFamily: 'Kanit,sans-serif',
                fontWeight: 600, fontSize: '0.97rem', transition: 'all 0.25s ease',
              }}
              onMouseEnter={e => { e.target.style.background = 'var(--glass-bg-hover)'; e.target.style.borderColor = 'var(--glass-border-hover)'; }}
              onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.borderColor = 'var(--glass-border)'; }}
            >
              <i className="fa-solid fa-arrow-left mr-2" /> ย้อนกลับ
            </button>
          )}

          {currentTab < skillsData.length - 1 ? (
            <button
              onClick={() => {
                setCurrentTab(t => t + 1);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover-glow-btn"
              style={{ 
                flex: 1, padding: '15px', fontSize: '1.05rem', borderRadius: '30px',
                background: 'rgba(255, 122, 0, 0.05)',
                border: '2px solid #ff7a00',
                color: '#ffb347',
                boxShadow: '0 0 15px rgba(255, 122, 0, 0.2), inset 0 0 10px rgba(255, 122, 0, 0.1)',
                fontWeight: 700, cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #ff7a00, #ff4b00)';
                e.currentTarget.style.color = '#fff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 122, 0, 0.05)';
                e.currentTarget.style.color = '#ffb347';
              }}
            >
              ถัดไป <i className="fa-solid fa-arrow-right ml-2" />
            </button>
          ) : (
            <button
              onClick={calculateDNA}
              disabled={submitting}
              className="hover-glow-btn"
              style={{ 
                flex: 1, padding: '15px', fontSize: '1.05rem', borderRadius: '30px',
                background: 'rgba(255, 122, 0, 0.05)',
                border: '2px solid #ff7a00',
                color: '#ffb347',
                boxShadow: '0 0 15px rgba(255, 122, 0, 0.2), inset 0 0 10px rgba(255, 122, 0, 0.1)',
                fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.7 : 1,
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                if (!submitting) {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #ff7a00, #ff4b00)';
                  e.currentTarget.style.color = '#fff';
                }
              }}
              onMouseLeave={(e) => {
                if (!submitting) {
                  e.currentTarget.style.background = 'rgba(255, 122, 0, 0.05)';
                  e.currentTarget.style.color = '#ffb347';
                }
              }}
            >
              {submitting
                ? <><i className="fas fa-spinner fa-spin mr-2" />กำลังวิเคราะห์ DNA ของคุณ...</>
                : <><i className="fa-solid fa-wand-magic-sparkles mr-2" />วิเคราะห์ผลลัพธ์</>
              }
            </button>
          )}
        </div>
      </main>
    </div>
  );
}

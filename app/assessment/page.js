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
  'https://script.google.com/macros/s/AKfycbxoZo8hs8SKeVF7mnEQYWoxbZSJRL9Fe9h_Tcz0Bwsd6h_UA1JPjaKPqKdyL5mBEHHWHg/exec';

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
  { id: 'Phys',     title: 'Physical',      th: 'ปฏิบัติการ',        icon: 'fa-person-running',      questions: [
    {en:'Stamina',th:'สามารถทำงานที่ต้องใช้พละกำลัง หรือต้องยืน/เดิน เป็นเวลานานได้'},
    {en:'Discipline',th:'สามารถรักษากฎระเบียบและวินัยได้อย่างเคร่งครัดไม่บิดพลิ้ว'},
    {en:'Pressure',th:'สามารถควบคุมสติและตัดสินใจได้เด็ดขาดเมื่อเกิดเหตุฉุกเฉิน'},
    {en:'Hand-eye',th:'มีการทำงานประสานกันของสายตาและมือที่แม่นยำ (เช่น งานช่าง งานฝีมือ)'},
    {en:'Risk',th:'กล้าเผชิญหน้ากับความเสี่ยงหรือสถานการณ์ที่ท้าทายความสามารถทางกาย'},
    {en:'Endurance',th:'ไม่ย่อท้อต่อความเหนื่อยล้าทางร่างกายเมื่อเป้าหมายยังไม่สำเร็จ'},
    {en:'Reaction',th:'มีปฏิกิริยาตอบสนองต่อสิ่งรอบตัวได้อย่างรวดเร็วและฉับไว'},
    {en:'Fieldwork',th:'ชอบการลงพื้นที่ปฏิบัติงานจริง มากกว่าการนั่งทำงานในออฟฟิศ'},
    {en:'Team Drill',th:'สามารถปฏิบัติตามคำสั่งของหัวหน้าหรือครูฝึกได้อย่างเป๊ะๆ'},
    {en:'Spatial',th:'กะระยะพื้นที่หรือจินตนาการภาพ 3 มิติในหัวได้แม่นยำ'},
  ]},
  { id: 'Emp',      title: 'Empathy',       th: 'จิตบริการ',       icon: 'fa-hand-holding-heart',  questions: [
    {en:'Caregiving',th:'รู้สึกมีคุณค่าและมีความสุขที่ได้ดูแลช่วยเหลือผู้ที่กำลังเดือดร้อน'},
    {en:'Patience',th:'มีความอดทนสูงมากเมื่อต้องรับมือกับผู้คนที่มีอารมณ์หลากหลาย'},
    {en:'Listening',th:'มักจะเป็นที่พักพิงและรับฟังปัญหาความทุกข์ใจของผู้อื่นเสมอ'},
    {en:'Service',th:'พร้อมที่จะให้บริการและทำให้ผู้คนประทับใจโดยไม่รู้สึกเหนื่อย'},
    {en:'Social Cue',th:'จับความรู้สึกของคนอื่นได้ไวแม้เขาจะไม่ได้พูดออกมาตรงๆ'},
    {en:'Teaching',th:'ชอบที่จะสอนหรืออธิบายเรื่องยากๆ ให้คนอื่นเข้าใจด้วยความใจเย็น'},
    {en:'Inclusion',th:'มักจะให้ความสำคัญและดูแลคนชายขอบหรือคนที่ถูกลืมในกลุ่มเสมอ'},
    {en:'Healing',th:'รู้จักวิธีปลอบประโลมและทำให้คนที่กำลังเศร้าหรือเครียดรู้สึกดีขึ้น'},
    {en:'Sacrifice',th:'ยินดีเสียสละความสุขส่วนตัวเล็กๆ น้อยๆ เพื่อให้ส่วนรวมมีความสุข'},
    {en:'Harmony',th:'หลีกเลี่ยงการทำร้ายความรู้สึกคนอื่นและมุ่งสร้างความสมานฉันท์'},
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
  const [expandedJob, setExpandedJob] = useState(null);
  const [displayPct, setDisplayPct]   = useState(0);
  const radarRef   = useRef(null);
  const radarChart = useRef(null);
  const printRadarRef   = useRef(null);
  const printRadarChart = useRef(null);

  useEffect(() => { checkAPI(); }, []);

  // Animated counter for match %
  useEffect(() => {
    if (!showResult || !resultData) return;
    let start = 0;
    const target = resultData.matchPct || 0;
    const step = Math.max(1, Math.floor(target / 40));
    const timer = setInterval(() => {
      start = Math.min(start + step, target);
      setDisplayPct(start);
      if (start >= target) clearInterval(timer);
    }, 30);
    return () => clearInterval(timer);
  }, [showResult, resultData]);

  useEffect(() => {
    if (showResult && resultData) {
      Chart.defaults.color       = '#ffb347'; // Use light orange globally
      Chart.defaults.font.family = "'Kanit', sans-serif";
      
      const config = {
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
          scales: { 
            r: { 
              min: 0, max: 100, 
              ticks: { stepSize: 20, font: { family: 'Kanit' }, color: 'rgba(255,179,71,0.6)', backdropColor: 'transparent' }, 
              pointLabels: { color: '#ffb347', font: { family: 'Kanit', size: 12, weight: '700' } },
              grid: { color: 'rgba(255,122,0,0.15)' }, 
              angleLines: { color: 'rgba(255,122,0,0.15)' } 
            } 
          },
          plugins: { legend: { display: false } },
        },
      };

      if (radarRef.current) {
        if (radarChart.current) radarChart.current.destroy();
        radarChart.current = new Chart(radarRef.current, config);
      }
      if (printRadarRef.current) {
        if (printRadarChart.current) printRadarChart.current.destroy();
        const printConfig = JSON.parse(JSON.stringify(config));
        printConfig.options.scales.r.pointLabels.font.size = 10;
        printRadarChart.current = new Chart(printRadarRef.current, printConfig);
      }
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
    const matchPct = Math.round(totalSum / skillsData.length);
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
      ],
      Roadmap: [
        {step: 1, title: 'ประเมินศักยภาพ', desc: 'คุณมีทักษะพื้นฐานที่ระบบวิเคราะห์แล้ว พร้อมเดินหน้าสู่เป้าหมาย'},
        {step: 2, title: 'พัฒนาทักษะ', desc: 'เริ่มฝึกฝนทักษะที่จำเป็นเพิ่มเติม เพื่อต่อยอดศักยภาพ'},
        {step: 3, title: 'เส้นทางการศึกษา', desc: 'เข้าศึกษาต่อในคณะและสาขาที่สอดคล้องกับจุดแข็ง'},
        {step: 4, title: 'อาชีพเป้าหมาย', desc: 'มุ่งหน้าสู่อาชีพที่ใช่และเตรียมความพร้อมในการทำงาน'},
        {step: 5, title: 'ความสำเร็จ', desc: 'บรรลุเป้าหมายในสายอาชีพที่ตรงกับศักยภาพที่แท้จริงของคุณ'}
      ],
      MarketData: {
        salary: '25,000 - 45,000 บาท/เดือน',
        demand: 'แนวโน้มการเติบโตสูงมากในยุค AI และอุตสาหกรรมดิจิทัล (+15% ต่อปี) เป็นที่ต้องการขององค์กรชั้นนำ'
      }
    };

    let aiResult = fallback;
    if (apiStatus === 'success' || apiStatus === 'hidden') {
      try {
        const scoreLabels = {
          Tech: 'เทคโนโลยี (Technology)',
          Logic: 'ตรรกะและการวิเคราะห์ (Logic & Analysis)',
          Creative: 'ความคิดสร้างสรรค์ (Creativity)',
          Lead: 'ภาวะผู้นำ (Leadership)',
          Comm: 'การสื่อสาร (Communication)',
          Biz: 'ความเข้าใจธุรกิจ (Business)',
          Phys: 'สมรรถนะทางกายและวินัย (Physical & Resilience)',
          Emp: 'ความเห็นอกเห็นใจและจิตบริการ (Empathy & Care)'
        };
        const mappedScores = Object.fromEntries(
          Object.entries(newScores).map(([k, v]) => [scoreLabels[k] || k, `${v} / 100`])
        );

        // เรียงทักษะจากมากไปน้อย ใช้เฉพาะ Top 3 สำหรับแนะนำอาชีพ
        const sortedKeys = Object.keys(newScores).sort((a, b) => newScores[b] - newScores[a]);
        const top3Keys = sortedKeys.slice(0, 3);
        const highestSkill = scoreLabels[sortedKeys[0]];
        const secondHighestSkill = scoreLabels[sortedKeys[1]];
        const thirdHighestSkill = scoreLabels[sortedKeys[2]];
        const lowestSkill = scoreLabels[sortedKeys[sortedKeys.length - 1]];

        // ส่งเฉพาะ Top 3 ทักษะสูงสุดให้ AI คิดอาชีพ
        const top3Scores = Object.fromEntries(
          top3Keys.map(k => [scoreLabels[k] || k, `${newScores[k]} / 100`])
        );

        const promptText = `ผู้ทำแบบประเมินมีทักษะที่โดดเด่นที่สุด 3 อันดับแรก ดังนี้: ${JSON.stringify(top3Scores)}
(ทักษะที่เหลือได้คะแนนต่ำกว่า ห้ามนำมาแนะนำอาชีพหรือคณะโดยเด็ดขาด)
จุดแข็งอันดับ 1: ${highestSkill}
จุดแข็งอันดับ 2: ${secondHighestSkill}
จุดแข็งอันดับ 3: ${thirdHighestSkill}
จุดที่ควรพัฒนา (คะแนนต่ำสุด): ${lowestSkill}

กฎเหล็กที่ต้องปฏิบัติอย่างเคร่งครัด:
1. [สอดคล้องกับทักษะจริง] อาชีพ (Jobs) และ คณะ (Edu) ทั้ง 5 ข้อ ต้องมาจาก Top 3 ทักษะข้างต้น เท่านั้น เช่น ถ้าอันดับ 1 คือ "${highestSkill}" คณะและอาชีพส่วนใหญ่ต้องใช้ทักษะนั้นโดยตรง
2. [จับคู่คณะกับอาชีพ 1-ต่อ-1] อาชีพอันดับที่ X ต้องเป็นอาชีพที่เรียนจบมาจากคณะอันดับที่ X โดยตรง (ห้ามข้ามสาย) เช่น ถ้าคณะอันดับ 1 คือแพทย์ อาชีพอันดับ 1 ก็ต้องเป็นแพทย์
3. [ห้ามซ้ำสายงาน] คณะและอาชีพทั้ง 5 อันดับ ต้องเป็นคนละสายงานกันทั้งหมด เพื่อให้ผู้ใช้มีทางเลือกหลากหลาย (ห้ามแนะนำคณะคล้ายๆ กันรวดเดียว 5 อันดับ)
4. [ห้ามคัดลอกประโยค] คำอธิบาย (d) ของแต่ละข้อ ต้องเขียนใหม่ทั้งหมดด้วยมุมมองที่ต่างกัน ห้ามใช้ประโยคซ้ำหรือโครงสร้างคล้ายกัน
5. [เขียนธรรมชาติ] เล่าให้เห็นภาพว่าทักษะ ${highestSkill} หรือ ${secondHighestSkill} หรือ ${thirdHighestSkill} ช่วยให้เก่งด้านนั้นยังไงโดยเฉพาะ ไม่พูดกว้างๆ และห้ามใช้คำว่า อาจจะ, น่าจะ, คงจะ, อาจ, บางที, พวกเขา (ให้ใช้คำว่า "คุณ" แทน)
6. [คณะและสาขาต้องสมจริง] หัวข้อ (t) ต้องเป็น "อันดับ X: คณะ(ชื่อ) สาขา(ชื่อ) (ความเข้ากันได้: XX%)" ห้ามตั้งชื่อคณะซ้ำกับสาขากำปั้นทุบดิน ต้องระบุสาขาเฉพาะทางที่มีอยู่จริงให้ชัดเจน ห้ามใส่ชื่อมหาวิทยาลัยในหัวข้อ ให้ระบุที่ท้าย (d) ว่า "มหาวิทยาลัยชั้นนำที่แนะนำ: ..."
7. [Dev] แนะนำทักษะที่ควรฝึกจาก ${lowestSkill} โดยเฉพาะ ไม่ใช่ทักษะทั่วไป

ตอบกลับเป็นออบเจกต์ JSON เท่านั้น โครงสร้าง: {"Title": "ชื่อสไตล์จุดแข็ง (สั้น ไม่เกิน 5 คำ)", "Desc": "คำอธิบาย 1-2 ประโยคที่ฟันธงและไม่ใช้คำไม่แน่นอน", "AnalysisDetail": "วิเคราะห์เชิงลึก 5-6 ประโยค แต่ละประโยคเริ่มต้นต่างกัน ห้ามซ้ำโครงสร้าง", "MarketData": {"salary": "ช่วงเงินเดือนเริ่มต้นจบใหม่ในไทย (เช่น 18,000–28,000 บาท)", "demand": "สรุปสั้น 1–2 ประโยคเกี่ยวกับความต้องการตลาด"}, "Roadmap": [{"step": 1, "title": "ชื่อก้าว", "desc": "2–3 ประโยคที่เจาะจงเรื่องนี้โดยเฉพาะ"}...5 ก้าว], "Edu": [{"t": "อันดับ 1: คณะ(ชื่อคณะจริงๆ) สาขา(ชื่อสาขาจริงๆ) (ความเข้ากันได้: XX%)", "d": "เขียนคำอธิบาย 2–3 ประโยคที่อธิบายเฉพาะคณะนี้ว่าเหมาะกับ ${highestSkill} ยังไง ห้ามคัดลอกจากข้ออื่น จบด้วย 'มหาวิทยาลัยชั้นนำที่แนะนำ: ...'"}...5 คณะที่ต่างกันทั้งหมด], "Jobs": [{"t": "อันดับ 1: ชื่ออาชีพ", "d": "ประโยคแรกให้พิมพ์ว่า '(ต่อยอดจากคณะ...)' โดยระบุชื่อคณะให้ตรงกับคณะอันดับเดียวกัน จากนั้นตามด้วยคำอธิบาย 2–3 ประโยคว่าอาชีพนี้ใช้ทักษะ Top 3 ของคุณให้เกิดประโยชน์ยังไง (ห้ามมีวงเล็บอธิบายต่อท้ายชื่ออาชีพในหัวข้อเด็ดขาด)"}...5 อาชีพให้ตรงกับคณะแต่ละอันดับ], "Dev": [{"t": "ชื่อทักษะที่ควรฝึก", "d": "แนะนำวิธีฝึกเฉพาะเรื่อง ${lowestSkill} 2–3 ประโยค"}...3 ข้อ], "Refs": [{"t": "ชื่อแหล่งอ้างอิง", "d": "เนื้อหาอ้างอิง"}...2 ข้อ]}`;
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
                Refs: formatArr(extracted.Refs || extracted.References || extracted.refs || extracted.references) || fallback.Refs,
                Roadmap: extracted.Roadmap || fallback.Roadmap,
                MarketData: extracted.MarketData || fallback.MarketData
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

    // บันทึกชื่ออาชีพอันดับ 1 จาก Jobs[0] แทนชื่อสไตล์ DNA
    const topJobTitle = aiResult.Jobs?.[0]?.t
      ? aiResult.Jobs[0].t.replace(/^\u0e2d\u0e31\u0e19\u0e14\u0e31\u0e1a\s*\d+:\s*/i, '').trim()
      : aiResult.Title;
    try {
      await fetch(SHEET_WEBAPP_URL, {
        method: 'POST', mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ action: 'assessment', name: user.name, email: user.email, schoolCode: user.schoolCode, matchPct, scores: newScores, aiTitle: topJobTitle, resultData: { ...aiResult, matchPct, scores: newScores } }),
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
  if (showResult && resultData) {
    const skillNameMap = {
      Tech: 'เทคโนโลยีดิจิทัล',
      Logic: 'การคิดวิเคราะห์',
      Creative: 'ความคิดสร้างสรรค์',
      Lead: 'ภาวะผู้นำ',
      Comm: 'การสื่อสาร',
      Biz: 'ธุรกิจและการจัดการ',
      Phys: 'ปฏิบัติการและวินัย',
      Emp: 'จิตบริการและการดูแล',
    };
    const sortedSkills = skillsData
      .map(sk => ({ id: sk.id, pct: scores[sk.id] || 0, score: scores[sk.id] || 0, title: sk.title, th: sk.th, icon: sk.icon }))
      .sort((a, b) => b.pct - a.pct);

    const handleExportPDF = () => {
      const win = window.open('', '_blank');
      
      const skillRows = sortedSkills.map(s => `
        <tr>
          <td>${s.th} (${s.title})</td>
          <td>
            <div style="background:#e2e8f0;border-radius:4px;height:10px;width:100%">
              <div style="background:${s.pct >= 80 ? '#10b981' : s.pct >= 60 ? '#f59e0b' : '#ef4444'};width:${s.pct}%;height:100%;border-radius:4px"></div>
            </div>
          </td>
          <td style="text-align:right;font-weight:700">${s.pct}%</td>
        </tr>`).join('');

      const jobList = (resultData.Jobs || []).map(j => `<li style="margin-bottom:8px"><strong>${j.t}</strong>: ${j.d}</li>`).join('');
      const eduList = (resultData.Edu || []).map(e => `<li style="margin-bottom:8px"><strong>${e.t}</strong>: ${e.d}</li>`).join('');
      const devList = (resultData.Dev || []).map(d => `<li style="margin-bottom:8px"><strong>${d.t}</strong>: ${d.d}</li>`).join('');

      const html = `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <title>Assessment Report - ${user?.name || 'User'}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;600;700;800&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Kanit', sans-serif; background: #fff; color: #111827; font-size: 11pt; padding: 20mm; }
    @page { size: A4; margin: 15mm; }
    h1 { font-size: 22pt; font-weight: 900; color: #0f172a; margin-bottom: 4px; }
    h2 { font-size: 14pt; font-weight: 700; color: #0f172a; margin-bottom: 12px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; }
    h3 { font-size: 11pt; font-weight: 700; color: #334155; margin-bottom: 6px; }
    p { font-size: 10pt; line-height: 1.7; color: #334155; margin-bottom: 12px; }
    .header { border-bottom: 4px solid #ff7a00; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-end; }
    .score-box { text-align: center; background: #fff7ed; border: 2px solid #fed7aa; border-radius: 12px; padding: 16px; margin-bottom: 24px; }
    .score-box .score { font-size: 32pt; font-weight: 900; color: #ff7a00; line-height: 1; }
    .box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; margin-bottom: 20px; page-break-inside: avoid; }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; font-size: 10pt; margin-bottom: 16px; }
    th { background: #f1f5f9; color: #475569; font-weight: 700; padding: 8px 12px; text-align: left; }
    td { padding: 7px 12px; border-bottom: 1px solid #f1f5f9; color: #334155; }
    .footer { margin-top: 32px; padding-top: 12px; border-top: 1px solid #e2e8f0; font-size: 8.5pt; color: #94a3b8; text-align: center; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1>FUTUREPATH AI</h1>
      <p style="color:#ff7a00;font-weight:700;font-size:12pt;margin:0">รายงานผลการประเมินค้นหาตัวตน (DNA Analysis Portfolio)</p>
    </div>
    <div style="text-align:right;font-size:10pt">
      <div style="font-weight:700;color:#0f172a">ชื่อผู้รับการประเมิน: ${user?.name || 'ไม่ระบุ'}</div>
      <div>อีเมล: ${user?.email || '-'}</div>
      <div>วันที่ประเมิน: ${new Date().toLocaleDateString('th-TH')}</div>
    </div>
  </div>

  <div class="score-box">
    <h3>ความเหมาะสมกับอาชีพเป้าหมาย (MATCH SCORE)</h3>
    <div class="score">${displayPct}%</div>
    <div style="margin-top:8px;font-weight:700;color:#c2410c">
      ทักษะโดดเด่น: ${sortedSkills[0]?.th}
    </div>
  </div>

  <div class="box">
    <h2>🧬 สรุปสมรรถนะ (Competency Summary)</h2>
    <table>
      <thead><tr><th>ทักษะ</th><th>ระดับ</th><th style="text-align:right">คะแนน</th></tr></thead>
      <tbody>${skillRows}</tbody>
    </table>
  </div>

  <div class="box">
    <h2>📊 บทวิเคราะห์เชิงลึก (AI Analysis)</h2>
    <p><strong>ผลการวิเคราะห์:</strong> ${resultData.AnalysisDetail}</p>
  </div>

  <div class="grid-2">
    <div class="box" style="border-top:3px solid #00f2fe">
      <h3 style="color:#0284c7">💼 อาชีพที่เหมาะสม (Top Jobs)</h3>
      <ul style="padding-left:20px;font-size:9.5pt">${jobList}</ul>
    </div>
    <div class="box" style="border-top:3px solid #8b5cf6">
      <h3 style="color:#6d28d9">🎓 คณะที่แนะนำ (Top Education)</h3>
      <ul style="padding-left:20px;font-size:9.5pt">${eduList}</ul>
    </div>
  </div>

  <div class="box" style="border-top:3px solid #f59e0b">
    <h3 style="color:#d97706">📈 ทักษะที่ควรพัฒนาเพิ่มเติม</h3>
    <ul style="padding-left:20px;font-size:9.5pt">${devList}</ul>
  </div>

  <div class="footer">
    ประเมินโดยระบบปัญญาประดิษฐ์ FUTUREPATH AI | เอกสารนี้สามารถใช้เป็นส่วนหนึ่งของแฟ้มสะสมผลงาน (Portfolio)
  </div>
</body>
</html>`;
      win.document.write(html);
      win.document.close();
      win.onload = () => win.print();
    };

    return (
      <div style={{ minHeight: '100vh', background: '#120c0a', color: 'var(--text-main)', fontFamily: "'Kanit', sans-serif" }}>
      {/* Image Background & Corner Gradients */}
      <div className="no-print" style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ 
          position: 'absolute', inset: 0, 
          backgroundImage: "url('/img/bg-room1.png')", 
          backgroundSize: 'cover', 
          backgroundPosition: 'center',
          opacity: 0.8
        }} />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(18, 12, 10, 0.65)' }} />
        <div style={{ position: 'absolute', top: '-20%', left: '-15%', width: '60vw', height: '60vw', background: 'radial-gradient(circle, rgba(255,122,0,0.35) 0%, transparent 70%)', filter: 'blur(80px)', mixBlendMode: 'screen' }} />
        <div style={{ position: 'absolute', bottom: '-20%', right: '-15%', width: '70vw', height: '70vw', background: 'radial-gradient(circle, rgba(255,75,0,0.3) 0%, transparent 70%)', filter: 'blur(100px)', mixBlendMode: 'screen' }} />
      </div>
      <GlassNav />
      <main className="no-print" style={{ position: 'relative', zIndex: 10, maxWidth: '1000px', margin: '0 auto', padding: '24px 16px 120px', paddingTop: '80px' }}>
        <UserBar name={user.name} email={user.email} />

        {/* Action Bar (Export) */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
          <button 
            onClick={handleExportPDF}
            className="btn-primary hover-glow-btn"
            style={{ padding: '12px 24px', fontSize: '0.95rem' }}
          >
            <i className="fa-solid fa-file-pdf mr-2" /> ดาวน์โหลด Portfolio (TCAS)
          </button>
        </div>

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
          {/* Animated SVG Ring */}
          <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
            <svg width="130" height="130" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="65" cy="65" r="56" fill="none" stroke="rgba(255,122,0,0.12)" strokeWidth="8" />
              <circle
                cx="65" cy="65" r="56" fill="none"
                stroke="url(#ringGrad)" strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 56}`}
                strokeDashoffset={`${2 * Math.PI * 56 * (1 - displayPct / 100)}`}
                style={{ transition: 'stroke-dashoffset 0.05s linear' }}
              />
              <defs>
                <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ff4b00" />
                  <stop offset="100%" stopColor="#ff7a00" />
                </linearGradient>
              </defs>
            </svg>
            <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: '2.4rem', fontWeight: 900, color: 'var(--accent-color)', lineHeight: 1 }}>{displayPct}%</span>
              <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', letterSpacing: '0.1em', marginTop: '2px' }}>MATCH</span>
            </div>
          </div>
          <div style={{ marginBottom: '20px' }}>
            {(() => {
              const skillDescMap = {
                Tech:     'คุณมีความสามารถด้านเทคโนโลยีสูง เหมาะกับสายงานดิจิทัลและนวัตกรรม',
                Logic:    'คุณคิดวิเคราะห์ได้แม่นยำ เหมาะกับงานที่ต้องใช้ข้อมูลประกอบการตัดสินใจ',
                Creative: 'คุณมีความคิดสร้างสรรค์ที่โดดเด่น เหมาะกับสายงานออกแบบและสร้างสรรค์เนื้อหา',
                Lead:     'คุณมีภาวะผู้นำที่ชัดเจน เหมาะกับบทบาทที่ต้องบริหารทีมและชี้นำทิศทาง',
                Comm:     'คุณสื่อสารได้อย่างมีประสิทธิภาพ เหมาะกับงานประสานงาน เจรจา และนำเสนอ',
                Biz:      'คุณมีความเข้าใจธุรกิจและการจัดการที่ดี เหมาะกับสายงานบริหารและกลยุทธ์',
                Phys:     'คุณมีสมรรถนะทางกายและวินัยที่ยอดเยี่ยม เหมาะกับงานภาคสนามและการปฏิบัติการ',
                Emp:      'คุณมีความเห็นอกเห็นใจและจิตบริการสูง เหมาะกับสายงานบริการ ให้คำปรึกษา และดูแลผู้คน',
              };
              const tierColor = (pct) =>
                pct >= 85 ? '#26de81' : pct >= 70 ? '#2bcbba' : pct >= 55 ? '#fed330' : pct >= 40 ? '#ffa502' : '#ff4d4d';

              // Show only the top 1-2 clearly dominant skills
              const best = sortedSkills[0];
              const second = sortedSkills[1] && sortedSkills[1].pct >= sortedSkills[0].pct - 5 ? sortedSkills[1] : null;
              const highlights = second ? [best, second] : [best];

              return (
                <>
                  {/* Top skill label */}
                  <p style={{ fontSize: '0.72rem', color: 'var(--accent-color)', letterSpacing: '0.12em', fontWeight: 700, textTransform: 'uppercase', marginBottom: '16px' }}>
                    ทักษะที่โดดเด่น
                  </p>

                  {/* Icon + name only */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '28px', justifyContent: 'center', marginBottom: '16px' }}>
                    {highlights.map(s => {
                      const c = tierColor(s.pct);
                      const icon = skillsData.find(sk => sk.id === s.id)?.icon;
                      return (
                        <div key={s.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                          <i className={`fa-solid ${icon}`} style={{ fontSize: '2.4rem', color: 'var(--text-main)' }} />
                          <span style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.01em' }}>
                            {skillNameMap[s.id]}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Assertive description */}
                  <p style={{ fontSize: '0.97rem', color: 'var(--text-sub)', maxWidth: '580px', margin: '0 auto', lineHeight: 1.8 }}>
                    {skillDescMap[best.id]}{second ? ` และ${skillDescMap[second.id].replace(/^คุณ/, '').trim()}` : ''}
                  </p>
                </>
              );
            })()}
          </div>
        </div>

        {/* Charts + Score Bars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" style={{ marginBottom: '24px' }}>
          <div
            className="hover-lift"
            style={{
              padding: '36px', borderRadius: 'var(--r-lg)',
              background: 'linear-gradient(135deg, rgba(255, 122, 0, 0.1), rgba(255, 75, 0, 0.05))', 
              border: '1px solid rgba(255, 122, 0, 0.4)',
              boxShadow: '0 12px 32px rgba(255, 75, 0, 0.15)',
              backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
              textAlign: 'center',
              display: 'flex', flexDirection: 'column', height: '100%'
            }}
          >
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-color)', marginBottom: '20px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              แผนภูมิเรดาร์ทักษะ
            </h3>
            <div style={{ flex: 1, position: 'relative', minHeight: '280px' }}><canvas ref={radarRef} /></div>
          </div>
          <div
            className="hover-lift"
            style={{
              padding: '36px', borderRadius: 'var(--r-lg)',
              background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
              backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
            }}
          >
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-sub)', marginBottom: '24px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              ผลสรุปสมรรถนะรายด้าน (Competency Summary)
            </h3>
            {skillsData.map(sk => {
              const pct = scores[sk.id] || 0;
              // Formal tier labels with colors
              const tier = pct >= 85
                ? { label: 'ดีเยี่ยม', en: 'Excellent', color: '#26de81', bg: 'rgba(38,222,129,0.12)', border: 'rgba(38,222,129,0.3)' }
                : pct >= 70
                ? { label: 'ดี', en: 'Good', color: '#2bcbba', bg: 'rgba(43,203,186,0.12)', border: 'rgba(43,203,186,0.3)' }
                : pct >= 55
                ? { label: 'พอใช้', en: 'Fair', color: '#fed330', bg: 'rgba(254,211,48,0.12)', border: 'rgba(254,211,48,0.3)' }
                : pct >= 40
                ? { label: 'ต้องพัฒนา', en: 'Developing', color: '#ffa502', bg: 'rgba(255,165,2,0.12)', border: 'rgba(255,165,2,0.3)' }
                : { label: 'ต้องเสริม', en: 'Needs Attention', color: '#ff4d4d', bg: 'rgba(255,77,77,0.12)', border: 'rgba(255,77,77,0.3)' };

              // Formal descriptions per skill dimension
              const descMap = {
                Tech:     'สมรรถนะด้านเทคโนโลยีและระบบดิจิทัล รวมถึงการประยุกต์ใช้เครื่องมือในยุคอุตสาหกรรม 4.0',
                Logic:    'สมรรถนะด้านการคิดวิเคราะห์และการใช้เหตุผลเชิงตรรกะในการแก้ปัญหาและตัดสินใจ',
                Creative: 'สมรรถนะด้านความคิดสร้างสรรค์ การออกแบบ และการนำเสนอแนวคิดใหม่เชิงนวัตกรรม',
                Lead:     'สมรรถนะด้านภาวะผู้นำ การบริหารจัดการทีม และการสร้างแรงบันดาลใจให้ผู้อื่น',
                Comm:     'สมรรถนะด้านการสื่อสารและการประสานงาน ทั้งในระดับบุคคลและองค์กร',
                Biz:      'สมรรถนะด้านการคิดเชิงธุรกิจ การวางกลยุทธ์ และการบริหารทรัพยากรอย่างมีประสิทธิภาพ',
                Phys:     'สมรรถนะด้านร่างกาย ความแข็งแกร่ง ความอดทน และความมีระเบียบวินัยในการปฏิบัติงาน',
                Emp:      'สมรรถนะด้านความเห็นอกเห็นใจ การดูแลเอาใจใส่ และจิตบริการเพื่อช่วยเหลือผู้อื่น',
              };

              return (
                <div key={sk.id} style={{ marginBottom: '20px', padding: '16px', borderRadius: 'var(--r-md)', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  {/* Skill Name Row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                        <i className={`fa-solid ${sk.icon}`} style={{ color: 'var(--accent-color)', fontSize: '0.8rem' }} />
                        <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>{sk.th}</span>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 400 }}>({sk.title})</span>
                      </div>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                        {descMap[sk.id]}
                      </p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0, marginLeft: '12px' }}>
                      <span style={{ fontSize: '1.15rem', fontWeight: 900, color: tier.color }}>{pct}%</span>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: tier.color, background: tier.bg, border: `1px solid ${tier.border}`, borderRadius: '999px', padding: '2px 10px', letterSpacing: '0.04em' }}>
                        {tier.label} · {tier.en}
                      </span>
                    </div>
                  </div>
                  {/* Progress Bar */}
                  <div style={{ height: '7px', borderRadius: '8px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: '8px',
                      width: `${pct}%`,
                      background: `linear-gradient(90deg, ${tier.color}, var(--accent-color))`,
                      transition: 'width 0.8s var(--ease-out)',
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Analysis Detail */}
        {resultData.AnalysisDetail && (
          <div
            className="hover-lift"
            style={{
              padding: '36px', borderRadius: 'var(--r-xl)',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))', 
              border: '1px solid var(--glass-border)',
              backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
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

        {/* Market Data */}
        {resultData.MarketData && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6" style={{ marginBottom: '24px' }}>
            <div
              className="hover-lift"
              style={{
                padding: '28px', borderRadius: 'var(--r-xl)',
                background: 'rgba(38,222,129,0.06)', 
                border: '1px solid rgba(38,222,129,0.2)',
                backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
              }}
            >
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#26de81', marginBottom: '12px' }}>
                <i className="fa-solid fa-sack-dollar mr-2" /> ฐานเงินเดือนเริ่มต้น
              </h3>
              <p style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>
                {resultData.MarketData.salary}
              </p>
            </div>
            <div
              className="hover-lift"
              style={{
                padding: '28px', borderRadius: 'var(--r-xl)',
                background: 'rgba(43,203,186,0.06)', 
                border: '1px solid rgba(43,203,186,0.2)',
                backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
              }}
            >
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#2bcbba', marginBottom: '12px' }}>
                <i className="fa-solid fa-arrow-trend-up mr-2" /> แนวโน้มตลาดแรงงาน
              </h3>
              <p style={{ fontSize: '1rem', color: 'var(--text-main)', lineHeight: 1.6 }}>
                {resultData.MarketData.demand}
              </p>
            </div>
          </div>
        )}

        {/* Career Roadmap */}
        <div
          className="hover-lift"
          style={{
            padding: '36px', borderRadius: 'var(--r-xl)',
            background: 'linear-gradient(135deg, rgba(255,122,0,0.06), rgba(255,75,0,0.03))',
            border: '1px solid rgba(255,122,0,0.25)',
            backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
            marginBottom: '24px',
          }}
        >
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-color)', marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <i className="fa-solid fa-road" /> เส้นทางสู่เป้าหมาย (Career Roadmap)
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {(resultData.Roadmap || fallback.Roadmap).map((item, idx, arr) => {
              const icons = ['fa-circle-check', 'fa-book-open', 'fa-graduation-cap', 'fa-briefcase', 'fa-trophy'];
              const colors = ['#26de81', 'var(--accent-color)', '#2bcbba', '#fed330', '#ffa502'];
              const icon = icons[idx] || 'fa-circle';
              const color = colors[idx] || 'var(--accent-color)';
              return (
              <div key={`roadmap-${idx}`} style={{ display: 'flex', gap: '20px', position: 'relative' }}>
                {/* Vertical line */}
                {idx < arr.length - 1 && (
                  <div style={{ position: 'absolute', left: '19px', top: '44px', width: '2px', height: 'calc(100% - 4px)', background: 'rgba(255,255,255,0.08)' }} />
                )}
                {/* Circle */}
                <div style={{ flexShrink: 0, width: '40px', height: '40px', borderRadius: '50%', background: `${color}20`, border: `2px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
                  <i className={`fa-solid ${icon}`} style={{ color: color, fontSize: '0.9rem' }} />
                </div>
                <div style={{ paddingBottom: idx < arr.length - 1 ? '28px' : '0' }}>
                  <p style={{ fontSize: '0.75rem', color: color, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '3px' }}>STEP {item.step || idx + 1}</p>
                  <p style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>{item.title || item.label || 'Step'}</p>
                  <p style={{ fontSize: '0.87rem', color: 'var(--text-sub)', lineHeight: 1.6 }}>{item.desc}</p>
                </div>
              </div>
            )})}
          </div>
        </div>

        {/* AI Suggestions — Education & Skills (non-expandable) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" style={{ marginBottom: '24px' }}>
          {[
            { title: '🎓 คณะ/สาขาที่แนะนำ', items: resultData.Edu, accent: 'var(--accent-color)' },
            { title: '📈 ทักษะที่ควรพัฒนา',  items: resultData.Dev,  accent: '#fed330'            },
          ].map(sec => (
            <div key={sec.title} className="hover-lift" style={{ padding: '32px 28px', borderRadius: 'var(--r-xl)', background: 'var(--card-bg)', border: '1px solid var(--card-border)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: sec.accent, marginBottom: '24px' }}>{sec.title}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {sec.items?.map((item, i) => {
                  const cleanTitle = item.t.replace(/^อันดับ\s*\d+\s*:\s*/, '');
                  return (
                    <div key={i} style={{ paddingBottom: i !== sec.items.length - 1 ? '18px' : '0', marginBottom: i !== sec.items.length - 1 ? '18px' : '0', borderBottom: i !== sec.items.length - 1 ? '1px dashed rgba(255,255,255,0.07)' : 'none' }}>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                        <div style={{ width: '26px', height: '26px', borderRadius: '50%', flexShrink: 0, background: `${sec.accent}15`, color: sec.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.82rem', border: `1px solid ${sec.accent}40`, marginTop: '2px' }}>{i + 1}</div>
                        <div>
                          <p style={{ fontSize: '0.93rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px', lineHeight: 1.45 }}>{cleanTitle}</p>
                          <p style={{ fontSize: '0.83rem', color: 'var(--text-sub)', lineHeight: 1.65 }}>{item.d}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Jobs — Expandable Accordion */}
        <div className="hover-lift" style={{ padding: '32px 28px', borderRadius: 'var(--r-xl)', background: 'var(--card-bg)', border: '1px solid var(--card-border)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ff4b00', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fa-solid fa-briefcase" /> 💼 อาชีพที่เหมาะสม
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {resultData.Jobs?.map((item, i) => {
              const cleanTitle = item.t.replace(/^อันดับ\s*\d+\s*:\s*/, '');
              const isOpen = expandedJob === i;
              return (
                <div
                  key={i}
                  style={{ borderRadius: 'var(--r-md)', background: isOpen ? 'rgba(255,75,0,0.08)' : 'rgba(255,255,255,0.03)', border: `1px solid ${isOpen ? 'rgba(255,75,0,0.35)' : 'rgba(255,255,255,0.07)'}`, overflow: 'hidden', transition: 'all 0.25s ease' }}
                >
                  <button
                    onClick={() => setExpandedJob(isOpen ? null : i)}
                    style={{ width: '100%', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                  >
                    <div style={{ width: '30px', height: '30px', borderRadius: '50%', flexShrink: 0, background: 'rgba(255,75,0,0.15)', color: '#ff4b00', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.88rem', border: '1px solid rgba(255,75,0,0.4)' }}>{i + 1}</div>
                    <span style={{ flex: 1, fontSize: '0.97rem', fontWeight: 700, color: 'var(--text-main)' }}>{cleanTitle}</span>
                    <i className={`fa-solid fa-chevron-${isOpen ? 'up' : 'down'}`} style={{ color: '#ff4b00', fontSize: '0.8rem', transition: 'transform 0.25s' }} />
                  </button>
                  <div className="print-expand" style={{ maxHeight: isOpen ? '200px' : '0', overflow: 'hidden', transition: 'max-height 0.35s ease' }}>
                    <p style={{ padding: '0 20px 18px 64px', fontSize: '0.88rem', color: 'var(--text-sub)', lineHeight: 1.75 }}>{item.d}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* References */}
        {resultData.Refs && resultData.Refs.length > 0 && (
          <div
            className="hover-lift"
            style={{
              padding: '32px 28px', borderRadius: 'var(--r-xl)',
              background: 'var(--card-bg)', border: '1px dashed var(--glass-border)',
              backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
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
          <button onClick={handleExportPDF} className="btn-primary" style={{ background: '#fff', color: '#000', boxShadow: 'none' }}>
            <i className="fa-solid fa-print" /> พิมพ์ PDF
          </button>
          <button onClick={() => { setShowResult(false); setCurrentTab(0); }} className="btn-outline">
            <i className="fa-solid fa-rotate-right" /> ทำใหม่
          </button>
        </div>
      </main>

      {/* ─── PRINT ONLY LAYOUT ─── */}
      <div className="print-only" style={{ padding: '20px 40px', fontFamily: "'Kanit', sans-serif", color: '#111827', background: '#fff' }}>
        {/* Header */}
        <div style={{ borderBottom: '2px solid #ff7a00', paddingBottom: '16px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#111827', margin: 0 }}>FUTUREPATH AI</h1>
            <p style={{ fontSize: '14px', color: '#ff7a00', margin: 0, fontWeight: 700 }}>รายงานผลการประเมินศักยภาพและแนวทางอาชีพ</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '14px', fontWeight: 700, margin: 0 }}>ผู้รับการประเมิน: {user.name}</p>
            <p style={{ fontSize: '12px', color: '#4b5563', margin: 0 }}>{user.email} | วันที่ประเมิน: {new Date().toLocaleDateString('th-TH')}</p>
          </div>
        </div>

        {/* Section 1: Top Summary */}
        <div style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
          {/* Match Score */}
          <div style={{ flexShrink: 0, width: '180px', textAlign: 'center', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '16px' }}>
            <p style={{ fontSize: '12px', fontWeight: 700, color: '#6b7280', margin: '0 0 8px 0' }}>ความเข้ากันได้ของ DNA</p>
            <div style={{ fontSize: '36px', fontWeight: 900, color: '#ff7a00', lineHeight: 1 }}>{resultData.matchPct}%</div>
            <p style={{ fontSize: '14px', fontWeight: 800, margin: '8px 0 0 0', color: '#111827' }}>{resultData.Title}</p>
          </div>
          {/* Top 2 Skills */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <p style={{ fontSize: '14px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>จุดเด่นหลักของคุณ (Top Skills)</p>
            <div style={{ display: 'flex', gap: '16px' }}>
              {sortedSkills.slice(0, 2).map(s => {
                const icon = skillsData.find(sk => sk.id === s.id)?.icon;
                return (
                  <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fff4eb', border: '1px solid #ffcc99', padding: '8px 12px', borderRadius: '8px' }}>
                    <i className={`fa-solid ${icon}`} style={{ color: '#ff7a00', fontSize: '16px' }} />
                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#b35500' }}>{skillNameMap[s.id]}</span>
                  </div>
                );
              })}
            </div>
            <p style={{ fontSize: '13px', color: '#374151', marginTop: '12px', lineHeight: 1.5 }}>
              {resultData.Desc}
            </p>
          </div>
        </div>

        {/* Section 2: Chart & Competencies */}
        <div style={{ display: 'flex', gap: '24px', marginBottom: '24px', alignItems: 'flex-start' }}>
          <div style={{ width: '45%' }}>
             <h3 style={{ fontSize: '14px', fontWeight: 700, borderBottom: '1px solid #e5e7eb', paddingBottom: '8px', marginBottom: '16px' }}>แผนภูมิเรดาร์ทักษะ</h3>
             <div style={{ position: 'relative', width: '100%', maxWidth: '240px', height: '240px', margin: '0' }}><canvas ref={printRadarRef} /></div>
          </div>
          <div style={{ width: '55%' }}>
             <h3 style={{ fontSize: '14px', fontWeight: 700, borderBottom: '1px solid #e5e7eb', paddingBottom: '8px', marginBottom: '16px' }}>ผลสรุปสมรรถนะรายด้าน</h3>
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
               {sortedSkills.map(s => {
                  const icon = skillsData.find(sk => sk.id === s.id)?.icon;
                  return (
                    <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                      <div style={{ width: '28px', height: '28px', background: '#f3f4f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         <i className={`fa-solid ${icon}`} style={{ color: '#6b7280', fontSize: '12px' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                           <span style={{ fontWeight: 700 }}>{skillNameMap[s.id]}</span>
                           <span style={{ fontWeight: 700, color: '#ff7a00' }}>{s.score}</span>
                        </div>
                        <div style={{ width: '100%', background: '#e5e7eb', height: '4px', borderRadius: '2px' }}>
                           <div style={{ width: `${s.score}%`, background: '#ff7a00', height: '100%', borderRadius: '2px' }} />
                        </div>
                      </div>
                    </div>
                  )
               })}
             </div>
             
             {/* Deep Analysis appended here to save space */}
             <div style={{ marginTop: '20px' }}>
               <h3 style={{ fontSize: '14px', fontWeight: 700, borderBottom: '1px solid #e5e7eb', paddingBottom: '8px', marginBottom: '12px' }}>บทวิเคราะห์เจาะลึก</h3>
               <p style={{ fontSize: '12px', lineHeight: 1.6, color: '#374151', margin: 0 }}>{resultData.AnalysisDetail}</p>
             </div>
          </div>
        </div>

        {/* Section 3: Recommendations (2 cols) */}
        <div className="avoid-break" style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
           <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, borderBottom: '1px solid #ff7a00', color: '#ff7a00', paddingBottom: '8px', marginBottom: '12px' }}>💼 อาชีพที่เหมาะสม</h3>
              <ul style={{ paddingLeft: '16px', margin: 0, fontSize: '12px', color: '#374151' }}>
                {resultData.Jobs?.map((item, i) => (
                  <li key={i} style={{ marginBottom: '8px', lineHeight: 1.5 }}>
                    <strong style={{ color: '#111827' }}>{item.t.replace(/^อันดับ\s*\d+\s*:\s*/, '')}</strong>: {item.d}
                  </li>
                ))}
              </ul>
              {resultData.MarketData && (
                <div style={{ marginTop: '12px', background: '#f9fafb', padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                  <p style={{ fontSize: '12px', margin: '0 0 4px 0' }}><strong>ฐานเงินเดือน:</strong> {resultData.MarketData.salary}</p>
                  <p style={{ fontSize: '12px', margin: 0 }}><strong>แนวโน้มตลาด:</strong> {resultData.MarketData.demand}</p>
                </div>
              )}
           </div>
           <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, borderBottom: '1px solid #ff7a00', color: '#ff7a00', paddingBottom: '8px', marginBottom: '12px' }}>🎓 คณะ/สาขาที่แนะนำ</h3>
              <ul style={{ paddingLeft: '16px', margin: 0, fontSize: '12px', color: '#374151' }}>
                {resultData.Edu?.map((item, i) => (
                  <li key={i} style={{ marginBottom: '8px', lineHeight: 1.5 }}>
                    <strong style={{ color: '#111827' }}>{item.t.replace(/^อันดับ\s*\d+\s*:\s*/, '')}</strong>: {item.d}
                  </li>
                ))}
              </ul>
              {resultData.Dev && (
                <div style={{ marginTop: '16px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 700, borderBottom: '1px solid #e5e7eb', paddingBottom: '8px', marginBottom: '12px' }}>📈 ทักษะที่ควรพัฒนา</h3>
                  <ul style={{ paddingLeft: '16px', margin: 0, fontSize: '12px', color: '#374151' }}>
                    {resultData.Dev.map((item, i) => (
                      <li key={i} style={{ marginBottom: '8px', lineHeight: 1.5 }}>
                        <strong style={{ color: '#111827' }}>{item.t.replace(/^อันดับ\s*\d+\s*:\s*/, '')}</strong>: {item.d}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
           </div>
        </div>

        {/* Section 4: Roadmap */}
        <div className="avoid-break" style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, borderBottom: '1px solid #e5e7eb', paddingBottom: '8px', marginBottom: '16px' }}>เส้นทางสู่เป้าหมาย (Roadmap)</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
            {((resultData.Roadmap && resultData.Roadmap.length > 0) ? resultData.Roadmap : fallback.Roadmap).map((item, idx) => (
              <div key={idx} style={{ background: '#f9fafb', border: '1px solid #e5e7eb', padding: '12px', borderRadius: '8px' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, color: '#ff7a00', marginBottom: '4px' }}>STEP {item.step || idx + 1}</div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>{item.title || item.label}</div>
                <div style={{ fontSize: '11px', color: '#4b5563', lineHeight: 1.4 }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
  }

  /* ─── ASSESSMENT VIEW ─── */
  return (
    <div style={{ minHeight: '100vh', background: '#120c0a', color: '#fff', fontFamily: "'Kanit', sans-serif" }}>
      {/* Image Background & Corner Gradients */}
      <div className="no-print" style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ 
          position: 'absolute', inset: 0, 
          backgroundImage: "url('/img/bg-room1.png')", 
          backgroundSize: 'cover', 
          backgroundPosition: 'center',
          opacity: 0.8
        }} />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(18, 12, 10, 0.65)' }} />
        <div style={{ position: 'absolute', top: '-20%', left: '-15%', width: '60vw', height: '60vw', background: 'radial-gradient(circle, rgba(255,122,0,0.35) 0%, transparent 70%)', filter: 'blur(80px)', mixBlendMode: 'screen' }} />
        <div style={{ position: 'absolute', bottom: '-20%', right: '-15%', width: '70vw', height: '70vw', background: 'radial-gradient(circle, rgba(255,75,0,0.3) 0%, transparent 70%)', filter: 'blur(100px)', mixBlendMode: 'screen' }} />
      </div>
      <GlassNav />

      <main style={{ position: 'relative', zIndex: 10, maxWidth: '1000px', margin: '0 auto', padding: '24px 16px 120px', paddingTop: '80px' }}>
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
                  <div style={{ marginBottom: '16px' }}>
                    <span style={{ display: 'block', fontWeight: 600, fontSize: '1.05rem', color: 'var(--text-main)', marginBottom: '4px' }}>
                      {qi + 1}. {q.th}
                    </span>
                    <span style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      ({q.en})
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
                      {v} - {cfg.label}
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

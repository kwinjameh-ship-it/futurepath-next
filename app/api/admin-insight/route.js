import { NextResponse } from 'next/server';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

const GROQ_KEYS = [
  process.env.GROQ_API_KEY,
  process.env.GROQ_API_KEY_2,
  process.env.GROQ_API_KEY_3,
  process.env.GROQ_API_KEY_4,
  process.env.GROQ_API_KEY_5,
].filter(Boolean);

let keyIndex = 0;
function getNextKey() {
  const key = GROQ_KEYS[keyIndex % GROQ_KEYS.length];
  keyIndex++;
  return key;
}

export async function POST(req) {
  try {
    if (GROQ_KEYS.length === 0) {
      return NextResponse.json({ insight: 'ยังไม่ได้ตั้งค่า GROQ_API_KEY ใน .env.local' }, { status: 500 });
    }

    const data = await req.json();
    const { popularJobs, avgSatisfaction, totalAssessments, avgSkills } = data;

    const jobsSummary = popularJobs
      ? popularJobs.slice(0, 5).map((j, i) => `${i + 1}. ${j.ai_title} (${j.count} คน)`).join(' | ')
      : 'ไม่มีข้อมูล';

    const skillsSummary = avgSkills && avgSkills.length > 0
      ? avgSkills.map(s => `${s.label}: ${parseFloat(s.score).toFixed(1)}%`).join(', ')
      : 'ไม่มีข้อมูลทักษะ';

    const topSkill = avgSkills && avgSkills.length > 0
      ? [...avgSkills].sort((a, b) => parseFloat(b.score) - parseFloat(a.score))[0]
      : null;
    const lowSkill = avgSkills && avgSkills.length > 0
      ? [...avgSkills].sort((a, b) => parseFloat(a.score) - parseFloat(b.score))[0]
      : null;

    const prompt = `คุณคือ "ที่ปรึกษาผู้บริหารการศึกษา (Executive Education Advisor)" ผู้เชี่ยวชาญด้านการวิเคราะห์ศักยภาพนักเรียนและการพัฒนาหลักสูตรอาชีพ

ข้อมูลระบบแนะแนวอาชีพ FUTUREPATH AI ของโรงเรียน:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 จำนวนนักเรียนที่ทำแบบประเมินทักษะ: ${totalAssessments || 0} คน
⭐ ความพึงพอใจเฉลี่ยต่อระบบ: ${avgSatisfaction || 0} / 5.0
🏆 ทักษะสูงสุด: ${topSkill ? `${topSkill.label} (${parseFloat(topSkill.score).toFixed(1)}%)` : 'ไม่มีข้อมูล'}
📉 ทักษะที่ควรพัฒนา: ${lowSkill ? `${lowSkill.label} (${parseFloat(lowSkill.score).toFixed(1)}%)` : 'ไม่มีข้อมูล'}
📈 คะแนนเฉลี่ยทักษะทั้งหมด: ${skillsSummary}
💼 อาชีพที่ระบบแนะนำให้นักเรียนมากที่สุด: ${jobsSummary}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ภารกิจ: วิเคราะห์ข้อมูลนี้อย่างละเอียด แล้วตอบกลับเป็น JSON โครงสร้างนี้ (ห้ามเพิ่มหรือเปลี่ยนชื่อ key):

{
  "overall": "สรุปภาพรวมศักยภาพนักเรียนทั้งโรงเรียน อธิบายให้ผู้บริหารเข้าใจในภาษาชัดเจน ครอบคลุมตัวเลขสำคัญ และบอกว่าโรงเรียนอยู่ในระดับใดเมื่อเทียบมาตรฐาน (ยาว 3-4 ประโยค)",
  "strengths": "วิเคราะห์จุดแข็งของนักเรียนกลุ่มนี้ บอกว่าทักษะไหนโดดเด่น เหมาะกับสายอาชีพประเภทใด และมีผลกระทบต่ออนาคตของนักเรียนอย่างไร (ยาว 3-4 ประโยค)",
  "weakness_analysis": "วิเคราะห์ทักษะที่ยังต้องพัฒนา บอกเหตุผลว่าทำไมทักษะนี้ถึงสำคัญในตลาดแรงงาน และถ้าไม่พัฒนาจะส่งผลอย่างไรต่อโอกาสของนักเรียน (ยาว 2-3 ประโยค)",
  "career_trend": "วิเคราะห์แนวโน้มอาชีพที่นักเรียนสนใจ บอกว่าอาชีพเหล่านี้ตรงกับแนวโน้มตลาดแรงงานในอนาคตหรือไม่ และมีทักษะใดที่ต้องเตรียมเพิ่ม (ยาว 2-3 ประโยค)",
  "action_steps": [
    {
      "priority": "เร่งด่วน",
      "title": "ชื่อกิจกรรมหรือโปรแกรมที่แนะนำ (สั้นๆ ชัดเจน)",
      "detail": "อธิบายว่าทำอะไร อย่างไร กับใคร ในระยะเวลาเท่าไหร่ และวัดผลอย่างไร (2-3 ประโยคที่ปฏิบัติได้จริง)"
    },
    {
      "priority": "ระยะกลาง",
      "title": "ชื่อกิจกรรมที่สอง",
      "detail": "รายละเอียดเช่นเดียวกัน"
    },
    {
      "priority": "ระยะยาว",
      "title": "ชื่อกิจกรรมที่สาม",
      "detail": "รายละเอียดเช่นเดียวกัน"
    }
  ],
  "kpi_suggestion": "เสนอตัวชี้วัดความสำเร็จ (KPI) 3 ตัวที่โรงเรียนควรติดตาม เพื่อวัดว่าการพัฒนานักเรียนสำเร็จตามเป้าหมายหรือไม่ ระบุตัวเลขที่ควรทำให้ได้ภายในปีการศึกษาหน้า (2-3 ประโยค)",
  "satisfaction_note": "วิเคราะห์ค่าความพึงพอใจที่ได้ บอกว่าอยู่ในระดับดีหรือยัง และแนะนำวิธีเพิ่มความพึงพอใจให้สูงขึ้น (1-2 ประโยค)"
}

กฎสำคัญ:
- ใช้ภาษาไทยชัดเจน อ่านง่าย ฟันธง ห้ามใช้คำว่า "อาจจะ", "น่าจะ", "อาจ"
- ทุกคำแนะนำต้องระบุเป็นขั้นตอนปฏิบัติได้จริง ไม่ใช่แค่คำแนะนำกว้างๆ
- ใช้ตัวเลขและข้อมูลที่ให้มาอ้างอิงทุกครั้งที่เป็นไปได้`;

    const requestBody = {
      model: GROQ_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.6,
      max_tokens: 2000,
      response_format: { type: 'json_object' }
    };

    const apiKey = getNextKey();
    const res = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('[Groq Error in Admin Insight]', res.status, errText);
      return NextResponse.json({ insight: `เกิดข้อผิดพลาด: ${res.status}` }, { status: res.status });
    }

    const json = await res.json();
    const insight = json.choices[0].message.content;

    return NextResponse.json({ insight });
  } catch (error) {
    console.error('Error generating admin insight:', error);
    return NextResponse.json({ insight: 'เกิดข้อผิดพลาดในการวิเคราะห์ข้อมูล กรุณาลองใหม่' }, { status: 500 });
  }
}

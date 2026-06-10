import { NextResponse } from 'next/server';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.1-8b-instant';

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
    const { popularJobs, avgSatisfaction, totalAssessments } = data;

    const jobsSummary = popularJobs ? popularJobs.slice(0, 5).map(j => `${j.ai_title} (${j.count} คน)`).join(', ') : 'ไม่มีข้อมูล';

    const prompt = `คุณคือ 'ที่ปรึกษาผู้บริหารระดับสูง (Executive Advisor)' เชี่ยวชาญด้านการวิเคราะห์ข้อมูลนักเรียนในโรงเรียน
มีข้อมูลระบบแนะแนวอาชีพของโรงเรียนดังนี้:
- จำนวนนักเรียนที่ทำแบบประเมิน: ${totalAssessments || 0} คน
- ความพึงพอใจเฉลี่ยต่อระบบ: ${avgSatisfaction || 0} เต็ม 5
- อาชีพที่ระบบแนะนำให้นักเรียนมากที่สุด 5 อันดับแรก: ${jobsSummary}

คำสั่ง:
เขียน 'บทสรุปผู้บริหารเชิงนโยบาย (Executive Summary)' เพื่อให้ผู้อำนวยการโรงเรียนอ่าน โดยจัดรูปแบบให้อ่านง่าย สวยงาม และแบ่งเป็น 3 หัวข้อย่อยชัดเจนดังนี้:
1. 📌 ภาพรวมศักยภาพ (สรุปภาพรวมจากข้อมูล)
2. ⭐ จุดเด่นที่ค้นพบ (วิเคราะห์ว่าเด็กโรงเรียนเราโดดเด่นด้านไหนจากอาชีพฮิต)
3. 💡 ข้อเสนอแนะเชิงนโยบาย (เสนอแนะ 1-2 ข้อว่าโรงเรียนควรจัดกิจกรรมหรือหลักสูตรเสริมแบบไหน)

ข้อควรระวัง: 
- ให้ตอบกลับมาเป็นข้อความที่มีการเว้นบรรทัดให้สวยงาม 
- ห้ามเขียนเป็นพารากราฟยาวๆ ติดกัน
- ห้ามใช้คำทักทาย ให้เข้าประเด็นเลย
- ใช้ภาษาไทยที่เป็นทางการ น่าเชื่อถือ และล้ำสมัย`;

    const requestBody = {
      model: GROQ_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
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
      return NextResponse.json({ insight: `เกิดข้อผิดพลาดในการดึงข้อมูลจาก AI: ${res.status}` }, { status: res.status });
    }

    const json = await res.json();
    const insight = json.choices[0].message.content;

    return NextResponse.json({ insight });
  } catch (error) {
    console.error('Error generating admin insight:', error);
    return NextResponse.json({ insight: 'เกิดข้อผิดพลาดในการวิเคราะห์ข้อมูล กรุณาลองใหม่อีกครั้ง' }, { status: 500 });
  }
}

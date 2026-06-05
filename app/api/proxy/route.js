import { NextResponse } from 'next/server';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.1-8b-instant';

// รวบรวม keys ทั้งหมดจาก env (GROQ_API_KEY, GROQ_API_KEY_2, GROQ_API_KEY_3, ...)
const GROQ_KEYS = [
  process.env.GROQ_API_KEY,
  process.env.GROQ_API_KEY_2,
  process.env.GROQ_API_KEY_3,
  process.env.GROQ_API_KEY_4,
  process.env.GROQ_API_KEY_5,
].filter(Boolean); // กรอง key ที่ไม่มีออก

let keyIndex = 0;
function getNextKey() {
  const key = GROQ_KEYS[keyIndex % GROQ_KEYS.length];
  keyIndex++;
  return key;
}

export async function POST(request) {
  if (GROQ_KEYS.length === 0) {
    return NextResponse.json({ error: 'ยังไม่ได้ตั้งค่า GROQ_API_KEY ใน .env.local' }, { status: 500 });
  }

  const input = await request.json();
  const action = input.action || '';
  let messages = null;
  let useJsonMode = false;

  if (action === 'ping') {
    messages = [{ role: 'user', content: 'ping' }];

  } else if (action === 'generate') {
    messages = [{ role: 'user', content: input.prompt }];
    useJsonMode = true;

  } else if (action === 'chat') {
    // แปลง Gemini format → OpenAI format
    messages = (input.history || []).map(msg => ({
      role: msg.role === 'model' ? 'assistant' : (msg.role === 'system' ? 'system' : 'user'),
      content: msg.parts?.[0]?.text || '',
    }));

  } else if (action === 'get_task') {
    const jobTitle = input.jobTitle || 'พนักงานทั่วไป';
    const prompt = `คุณคือ 'ผู้บริหารระดับสูง (Senior Director)' ในบริษัทชั้นนำระดับโลก สายงาน ${jobTitle}\nกรุณาสร้างโจทย์ปัญหาหรือสถานการณ์จำลอง 1 เหตุการณ์ เพื่อทดสอบการทำงานของพนักงานใหม่\nเงื่อนไข:\n- ต้องสมจริง ท้าทาย และมีความกดดันแบบมืออาชีพ\n- ความยาวประมาณ 3-5 บรรทัด\n- ใช้ภาษาทางการแบบธุรกิจ`;
    messages = [{ role: 'user', content: prompt }];

  } else if (action === 'evaluate_work') {
    const { jobTitle, task, userWork } = input;
    const prompt = `คุณคือ 'ผู้บริหารระดับสูง (Senior Director)' ในบริษัทระดับโลก สายงาน ${jobTitle}\nโจทย์ที่คุณสั่ง: ${task}\nผลงานของพนักงาน: ${userWork}\nจงประเมินผลงานนี้อย่างเฉียบขาดและเป็นมืออาชีพ ตอบกลับเป็น JSON เท่านั้น โดยใช้โครงสร้างนี้อย่างเคร่งครัด:\n{\n  "score": (ระบุตัวเลขคะแนนเต็ม 100),\n  "feedback": "(บทสรุปการประเมินภาพรวมแบบผู้บริหาร ตรงไปตรงมา)",\n  "strengths": ["(ข้อดี 1)", "(ข้อดี 2)"],\n  "improvements": ["(สิ่งที่ควรปรับปรุง 1)", "(สิ่งที่ควรปรับปรุง 2)"]\n}`;
    messages = [{ role: 'user', content: prompt }];
    useJsonMode = true;

  } else {
    return NextResponse.json({ error: 'ไม่มีคำสั่ง action ที่ถูกต้อง' }, { status: 400 });
  }

  try {
    const requestBody = {
      model: GROQ_MODEL,
      messages,
      temperature: 0.7,
    };

    if (useJsonMode) {
      requestBody.response_format = { type: 'json_object' };
    }

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
      console.error('[Groq Error]', res.status, errText);
      return NextResponse.json({ error: `Groq API Error: ${res.status}`, detail: errText }, { status: res.status });
    }

    const data = await res.json();
    const text = data.choices[0].message.content;

    // คืนค่าในรูปแบบ Gemini-compatible เพื่อให้ frontend ไม่ต้องแก้ไข
    return NextResponse.json({
      candidates: [{ content: { parts: [{ text }] } }],
    });

  } catch (err) {
    console.error('[Groq Fetch Error]', err.message);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการเชื่อมต่อ Groq API', detail: err.message }, { status: 500 });
  }
}

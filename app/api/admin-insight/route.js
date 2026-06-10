import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req) {
  try {
    const data = await req.json();
    const { popularJobs, avgSatisfaction, totalAssessments } = data;

    const jobsSummary = popularJobs ? popularJobs.slice(0, 5).map(j => `${j.ai_title} (${j.count} คน)`).join(', ') : 'ไม่มีข้อมูล';

    const prompt = `คุณคือ 'ที่ปรึกษาผู้บริหารระดับสูง (Executive Advisor)' เชี่ยวชาญด้านการวิเคราะห์ข้อมูลนักเรียนในโรงเรียน
มีข้อมูลระบบแนะแนวอาชีพของโรงเรียนดังนี้:
- จำนวนนักเรียนที่ทำแบบประเมิน: ${totalAssessments || 0} คน
- ความพึงพอใจเฉลี่ยต่อระบบ: ${avgSatisfaction || 0} เต็ม 5
- อาชีพที่ระบบแนะนำให้นักเรียนมากที่สุด 5 อันดับแรก: ${jobsSummary}

คำสั่ง:
เขียน 'บทสรุปผู้บริหารเชิงนโยบาย (Executive Summary)' สั้นๆ 3-4 ประโยค (ประมาณ 1 ย่อหน้าสั้นๆ) แบบกระชับและเป็นมืออาชีพ เพื่อสรุปภาพรวมศักยภาพของนักเรียน และข้อเสนอแนะ 1 ข้อว่าโรงเรียนควรจัดกิจกรรมหรือหลักสูตรเสริมแบบไหนเพื่อสนับสนุนนักเรียนกลุ่มนี้
ห้ามใช้คำทักทาย ห้ามมีเกริ่นนำ ให้เข้าประเด็นเลย และบังคับใช้ภาษาไทยที่เป็นทางการ น่าเชื่อถือ วางวิสัยทัศน์`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.7,
      }
    });

    return NextResponse.json({ insight: response.text });
  } catch (error) {
    console.error('Error generating admin insight:', error);
    return NextResponse.json({ insight: 'เกิดข้อผิดพลาดในการวิเคราะห์ข้อมูล กรุณาลองใหม่อีกครั้ง' }, { status: 500 });
  }
}

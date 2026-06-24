import { NextResponse } from 'next/server';

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxpQPsyzmtqFyc-VDB5LPt4UbGcsGwCzl_rFkN1ePJ_dWeWnrs40SJ9lxKkWlkKIKSo7Q/exec';

export async function POST(request) {
  try {
    const body = await request.json();

    const res = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(body),
      redirect: 'follow',
    });

    if (!res.ok) {
      return NextResponse.json({ error: `Google Script Error: ${res.status}` }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);

  } catch (err) {
    console.error('[Sheet Proxy Error]', err.message);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการเชื่อมต่อ Google Sheets', detail: err.message }, { status: 500 });
  }
}

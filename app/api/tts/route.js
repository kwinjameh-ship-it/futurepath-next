// Server-side proxy สำหรับ Google Translate TTS
// เพื่อหลีกเลี่ยงปัญหา CORS เมื่อ Browser พยายามดึงเสียงโดยตรง
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const text = searchParams.get('text') || '';

    if (!text) {
      return new Response('Missing text', { status: 400 });
    }

    const googleUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=th&client=tw-ob&ttsspeed=0.9`;

    const res = await fetch(googleUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://translate.google.com/',
        'Accept': 'audio/mpeg, audio/*',
      },
    });

    if (!res.ok) {
      return new Response('TTS fetch failed', { status: res.status });
    }

    const buffer = await res.arrayBuffer();

    return new Response(buffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err) {
    console.error('[TTS Proxy Error]', err.message);
    return new Response('Internal error', { status: 500 });
  }
}

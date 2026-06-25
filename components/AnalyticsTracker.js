'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxoZo8hs8SKeVF7mnEQYWoxbZSJRL9Fe9h_Tcz0Bwsd6h_UA1JPjaKPqKdyL5mBEHHWHg/exec";

export default function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
    
    if (pathname.startsWith('/api')) return;

    const email = localStorage.getItem('futurepath_user_email') || 'guest';

    if (GOOGLE_SCRIPT_URL) {
      fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'track', path: pathname, email })
      }).catch(err => console.error('Failed to track page view', err));
    }
  }, [pathname]);

  return null;
}

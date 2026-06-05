'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const GOOGLE_SCRIPT_URL = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL;

export default function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
    
    if (pathname.startsWith('/api')) return;

    const email = localStorage.getItem('futurepath_user_email') || 'guest';

    fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'track', path: pathname, email })
    }).catch(err => console.error('Failed to track page view', err));
  }, [pathname]);

  return null;
}

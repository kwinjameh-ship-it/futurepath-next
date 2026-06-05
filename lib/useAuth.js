'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function useAuth() {
  const [user, setUser] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const name = localStorage.getItem('futurepath_user_name');
    const email = localStorage.getItem('futurepath_user_email');
    if (!name || !email) {
      alert('🛑 กรุณาเข้าสู่ระบบก่อนใช้งาน');
      router.push('/login');
    } else {
      setUser({ name, email });
      setLoading(false);
    }
  }, [router]);

  return { user, loading };
}

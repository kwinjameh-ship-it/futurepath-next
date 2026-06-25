'use client';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

const showModal = (icon, title, text) => {
  Swal.fire({
    icon,
    title,
    text,
    background: 'transparent',
    color: '#f0f4ff',
    confirmButtonColor: '#ff7a00',
    backdrop: 'rgba(0, 0, 0, 0.5)',
    customClass: {
      popup: '!rounded-[40px] bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(255,122,0,0.3)]',
      title: 'font-kanit text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-[#ff7a00]',
      htmlContainer: 'font-kanit text-white/90 text-lg',
      confirmButton: '!rounded-full font-kanit px-8 py-3 text-lg font-semibold shadow-lg shadow-[#ff7a00]/30 transition-all hover:scale-105'
    }
  });
};





const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxoZo8hs8SKeVF7mnEQYWoxbZSJRL9Fe9h_Tcz0Bwsd6h_UA1JPjaKPqKdyL5mBEHHWHg/exec";

export default function AdminSettings() {
  const [admins, setAdmins] = useState([]);
  const [newEmail, setNewEmail] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchAdmins = () => {
    fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'admin_get_all' })
    })
      .then(r => r.json())
      .then(d => {
        if (d.status === 'success') setAdmins(d.admins);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    if (!newEmail) return;
    
    try {
      const res = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'admin_add', email: newEmail })
      });
      // Since no-cors doesn't return JSON cleanly, we just assume success and re-fetch after delay
      setNewEmail('');
      setTimeout(() => fetchAdmins(), 1500);
      showModal('success', 'สำเร็จ', 'ส่งคำสั่งเพิ่ม Admin แล้ว (รีเฟรชสักครู่)');
    } catch (error) {
      showModal('error', 'แจ้งเตือน', 'เกิดข้อผิดพลาดในการเพิ่ม Admin');
    }
  };

  const handleDeleteAdmin = async (id, email) => {
    if (!confirm(`คุณแน่ใจหรือไม่ที่จะลบสิทธิ์ Admin ของ ${email}?`)) return;
    
    try {
      const res = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'admin_remove', id })
      });
      
      setTimeout(() => {
        fetchAdmins();
        showModal('success', 'สำเร็จ', 'ลบสิทธิ์ Admin เรียบร้อยแล้ว');
      }, 1500);
    } catch (error) {
      showModal('error', 'แจ้งเตือน', 'เกิดข้อผิดพลาดในการลบ Admin');
    }
  };

  if (loading) return <div>กำลังโหลดข้อมูล...</div>;

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>ตั้งค่าผู้ดูแลระบบ (Admins)</h1>
        <p style={{ color: '#64748b' }}>จัดการสิทธิ์การเข้าถึงหน้า Admin</p>
      </div>

      <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '16px', alignItems: 'center' }}>
          <input
            type="email"
            value={newEmail}
            onChange={e => setNewEmail(e.target.value)}
            placeholder="ใส่อีเมลแอดมินใหม่ (เช่น admin@school.com)"
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: '#f8fafc',
              color: '#334155',
              outline: 'none',
              fontFamily: "'Kanit', sans-serif"
            }}
          />
          <button
            onClick={handleAddAdmin}
            style={{
              padding: '12px 24px',
              borderRadius: '8px',
              background: '#0ea5e9',
              color: '#fff',
              border: 'none',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <i className="fa-solid fa-plus mr-2" /> เพิ่มแอดมิน
          </button>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '16px 24px', textAlign: 'left', color: '#475569', fontWeight: 600 }}>วันที่เพิ่ม</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', color: '#475569', fontWeight: 600 }}>อีเมล</th>
              <th style={{ padding: '16px 24px', textAlign: 'center', color: '#475569', fontWeight: 600 }}>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {admins.length === 0 ? (
              <tr><td colSpan="3" style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>ยังไม่มีข้อมูลแอดมิน</td></tr>
            ) : admins.map(a => (
              <tr key={a.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '16px 24px', color: '#334155' }}>
                  {new Date(a.created_at).toLocaleDateString('th-TH')}
                </td>
                <td style={{ padding: '16px 24px', color: '#0f172a', fontWeight: 500 }}>{a.email}</td>
                <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                  <button
                    onClick={() => handleDeleteAdmin(a.id, a.email)}
                    style={{
                      background: '#ef4444',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.9rem'
                    }}
                  >
                    ลบ
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

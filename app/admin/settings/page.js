'use client';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

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
      toast.success('ส่งคำสั่งเพิ่ม Admin แล้ว (รีเฟรชสักครู่)');
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการเพิ่ม Admin');
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
        toast.success('ลบสิทธิ์ Admin เรียบร้อยแล้ว');
      }, 1500);
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการลบ Admin');
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

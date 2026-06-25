const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'app/admin/layout.js',
  'app/admin/settings/page.js',
  'app/feedback/page.js',
  'app/interview/page.js',
  'app/login/page.js',
  'app/simulation/page.js'
];

for (const f of filesToUpdate) {
  const p = path.join(__dirname, f);
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf8');
    
    // Replace import
    content = content.replace(/import toast from 'react-hot-toast';/g, "import Swal from 'sweetalert2';\n\nconst showModal = (icon, title, text) => {\n  Swal.fire({\n    icon,\n    title,\n    text,\n    background: '#12102e',\n    color: '#f0f4ff',\n    confirmButtonColor: '#ff7a00',\n    customClass: {\n      popup: 'rounded-2xl border border-white/10 shadow-[0_0_40px_rgba(255,122,0,0.15)]',\n      title: 'font-kanit',\n      htmlContainer: 'font-kanit text-white/70',\n      confirmButton: 'font-kanit rounded-xl px-6 py-2'\n    }\n  });\n};");

    // Replace toast.success
    content = content.replace(/toast\.success\(([^)]+)\)/g, "showModal('success', 'สำเร็จ', $1)");
    
    // Replace toast.error
    content = content.replace(/toast\.error\(([^)]+)\)/g, "showModal('error', 'แจ้งเตือน', $1)");

    fs.writeFileSync(p, content);
    console.log('Updated', p);
  }
}

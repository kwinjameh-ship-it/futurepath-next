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

const newShowModal = `const showModal = (icon, title, text) => {
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
};`;

for (const f of filesToUpdate) {
  const p = path.join(__dirname, f);
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf8');
    
    // Find the showModal block and replace it
    const regex = /const showModal = \(icon, title, text\) => \{[\s\S]*?\n\};\n?/g;
    
    if (regex.test(content)) {
      content = content.replace(regex, newShowModal + '\n\n');
      fs.writeFileSync(p, content);
      console.log('Updated', p);
    } else {
      console.log('Not found in', p);
    }
  }
}

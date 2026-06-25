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
    background: 'rgba(255, 255, 255, 0.08)',
    color: '#f0f4ff',
    confirmButtonColor: '#ff7a00',
    backdrop: 'rgba(0, 0, 0, 0.5)',
    customClass: {
      popup: '!rounded-[40px] backdrop-blur-[40px] border border-[rgba(255,255,255,0.15)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_24px_64px_rgba(0,0,0,0.4)] px-4 py-8',
      title: 'font-kanit text-[1.8rem] font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-[#ff7a00] to-white',
      htmlContainer: 'font-kanit text-[rgba(255,255,255,0.6)] text-[0.88rem] mt-2 font-normal',
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

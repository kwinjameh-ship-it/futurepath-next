const fs = require('fs');
const path = require('path');
const scan = (dir) => {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) {
      scan(p);
    } else if (p.endsWith('.js')) {
      let c = fs.readFileSync(p, 'utf8');
      if (c.includes('process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL')) {
        fs.writeFileSync(p, c.replace(/process\.env\.NEXT_PUBLIC_GOOGLE_SCRIPT_URL/g, "'https://script.google.com/macros/s/AKfycbxoZo8hs8SKeVF7mnEQYWoxbZSJRL9Fe9h_Tcz0Bwsd6h_UA1JPjaKPqKdyL5mBEHHWHg/exec'"));
        console.log('Updated', p);
      }
    }
  }
};
scan('app');
scan('components');

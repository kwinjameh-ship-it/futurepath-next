const fs = require('fs');
const path = require('path');
const newUrl = 'https://script.google.com/macros/s/AKfycbxoZo8hs8SKeVF7mnEQYWoxbZSJRL9Fe9h_Tcz0Bwsd6h_UA1JPjaKPqKdyL5mBEHHWHg/exec';

const scan = (dir) => {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) {
      scan(p);
    } else if (p.endsWith('.js')) {
      let c = fs.readFileSync(p, 'utf8');
      let changed = false;
      c = c.replace(/https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec/g, (match) => {
        if (match !== newUrl) {
          changed = true;
          return newUrl;
        }
        return match;
      });
      if (changed) {
        fs.writeFileSync(p, c);
        console.log('Updated', p);
      }
    }
  }
};
scan('app');
scan('components');

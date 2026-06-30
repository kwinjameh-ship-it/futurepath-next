const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'app/assessment/page.js',
  'app/chat/page.js',
  'app/dashboard/page.js',
  'app/feedback/page.js',
  'app/home/page.js',
  'app/interview/page.js',
  'app/login/page.js',
  'app/page.module.css'
];

for (const f of filesToUpdate) {
  const p = path.join(__dirname, f);
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf8');
    let changed = false;
    
    if (content.includes('bg-room1.png')) {
      content = content.replace(/bg-room1\.png/g, 'bg-room2.png');
      changed = true;
    }
    if (content.includes('rgba(255,122,0,0.35)')) {
      content = content.replace(/rgba\(255,122,0,0\.35\)/g, 'rgba(255,122,0,0.15)');
      changed = true;
    }
    if (content.includes('rgba(255,75,0,0.3)')) {
      content = content.replace(/rgba\(255,75,0,0\.3\)/g, 'rgba(255,75,0,0.1)');
      changed = true;
    }

    if (changed) {
      fs.writeFileSync(p, content);
      console.log('Updated', p);
    }
  }
}

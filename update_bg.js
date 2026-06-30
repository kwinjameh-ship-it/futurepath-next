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
    if (content.includes('bg-room.jpg')) {
      content = content.replace(/bg-room\.jpg/g, 'bg-room1.png');
      fs.writeFileSync(p, content);
      console.log('Updated', p);
    }
  }
}

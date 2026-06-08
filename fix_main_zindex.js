const fs = require('fs');
const path = require('path');

const files = [
  'app/assessment/page.js',
  'app/home/page.js',
  'app/login/page.js',
  'app/page.js'
];

files.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // 1. Revert background to zIndex: 0
    content = content.replace(/position:\s*'fixed',\s*inset:\s*0,\s*zIndex:\s*-1/gi, "position: 'fixed', inset: 0, zIndex: 0");
    
    // 2. Add position: 'relative', zIndex: 1 to main
    // Look for <main style={{...}}> or <main className="..." style={{...}}>
    content = content.replace(/(<main\s+[^>]*?style={{)(?!.*zIndex)(.*?)(}})/g, "$1 position: 'relative', zIndex: 10, $2 $3");
    
    // 3. In app/page.js, the main content is sometimes not a <main>, but a div. Let's check.
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
});

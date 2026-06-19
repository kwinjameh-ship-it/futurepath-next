const url = 'https://script.google.com/macros/s/AKfycby-qewa8CfMVp1V5GimbZtprRKDTPlRBNxa2siekCfM8mdKAXo1MAE9htIjidMlei2fqQ/exec';

fetch(url, {
  method: 'POST',
  body: JSON.stringify({ action: 'getUserDashboard', email: 'sukklang@gmail.com' }), // email from screenshot
  headers: { 'Content-Type': 'text/plain' }
})
.then(res => res.json())
.then(console.log)
.catch(console.error);

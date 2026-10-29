const fs = require('fs');
const path = require('path');

const dir = 'c:/Users/Raj Yadav/Downloads/SCHOOL/School-ERP/Teache_Panel/src/pages';
const files = fs.readdirSync(dir);
const keywords = ['dummy', 'mock', 'fake', 'sample', 'seed'];

for (const f of files) {
  const p = path.join(dir, f);
  if (fs.statSync(p).isFile() && f.endsWith('.jsx')) {
    const content = fs.readFileSync(p, 'utf8');
    const matched = [];
    for (const k of keywords) {
      const reg = new RegExp(k, 'i');
      if (reg.test(content)) {
        matched.push(k);
      }
    }
    if (matched.length > 0) {
      console.log(f, ':', matched.join(', '));
    }
  }
}

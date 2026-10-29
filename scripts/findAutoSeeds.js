const fs = require('fs');
const path = require('path');

const controllersDir = path.join(__dirname, '..', 'controllers');
const files = fs.readdirSync(controllersDir).filter(f => f.endsWith('.js'));

console.log(`Checking ${files.length} controllers...`);

const suspicious = [];

files.forEach(file => {
  const content = fs.readFileSync(path.join(controllersDir, file), 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    if (
      (line.includes('=== 0') || line.includes('== 0') || line.includes('!count')) &&
      (content.includes('insertMany') || content.includes('.create('))
    ) {
      if (line.includes('count') || line.includes('length') || line.includes('empty') || line.includes('seed') || line.includes('Seed')) {
        suspicious.push({ file, line: idx + 1, content: line.trim() });
      }
    }
  });
});

console.log(JSON.stringify(suspicious, null, 2));

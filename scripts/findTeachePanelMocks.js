const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, '..', '..', 'School-ERP', 'Teache_Panel', 'src', 'pages');
const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.jsx'));

console.log(`Analyzing ${files.length} pages in Teache_Panel...`);

const report = [];

files.forEach(file => {
  const content = fs.readFileSync(path.join(pagesDir, file), 'utf8');
  const lines = content.split('\n');

  lines.forEach((line, idx) => {
    // Look for suspicious keywords
    if (
      line.match(/const\s+[A-Z0-9_]+\s*=\s*\[/) ||
      line.includes('DEFAULT_') ||
      line.includes('SAMPLE_') ||
      line.includes('MOCK_') ||
      line.includes('SEED_') ||
      line.includes('Aarav') ||
      line.includes('Ramesh') ||
      line.includes('Sharma') ||
      line.includes('Diya Patel')
    ) {
      report.push({ file, line: idx + 1, content: line.trim().slice(0, 120) });
    }
  });
});

console.log(`Found ${report.length} occurrences:`);
console.log(JSON.stringify(report, null, 2));

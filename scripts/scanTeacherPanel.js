const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', '..', 'School-ERP', 'Teache_Panel', 'src');

function scanDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const results = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...scanDir(fullPath));
    } else if (entry.name.endsWith('.jsx') || entry.name.endsWith('.js')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');
      const relPath = path.relative(srcDir, fullPath);
      
      lines.forEach((line, index) => {
        const trimmed = line.trim();
        // Check for mock, dummy, sample, demo, default data arrays
        if (
          trimmed.match(/const\s+(MOCK_|SAMPLE_|DUMMY_|INITIAL_|DEFAULT_)[A-Z0-9_]*\s*=\s*\[/) ||
          trimmed.match(/const\s+demo[A-Za-z0-9_]*\s*=\s*\[/) ||
          trimmed.match(/const\s+mock[A-Za-z0-9_]*\s*=\s*\[/) ||
          trimmed.match(/const\s+sample[A-Za-z0-9_]*\s*=\s*\[/) ||
          trimmed.includes('|| [') ||
          (trimmed.includes('||') && (trimmed.includes('92') || trimmed.includes('84') || trimmed.includes('18'))) ||
          (trimmed.includes('localStorage.getItem') && (trimmed.includes('demo') || trimmed.includes('mock')))
        ) {
          results.push({
            file: relPath,
            line: index + 1,
            text: trimmed.slice(0, 100)
          });
        }
      });
    }
  }
  return results;
}

const findings = scanDir(srcDir);
console.log(`Found ${findings.length} suspicious lines in Teache_Panel/src:`);
console.log(JSON.stringify(findings, null, 2));

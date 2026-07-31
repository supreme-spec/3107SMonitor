const fs = require('fs');
const path = require('path');

const logsDir = path.join(__dirname, 'logs');

try {
  if (!fs.existsSync(logsDir)) {
    console.log('Logs directory does not exist');
    process.exit(0);
  }

  const files = fs.readdirSync(logsDir);
  console.log('Files in logs directory:', files);

  files.forEach(file => {
    const filePath = path.join(logsDir, file);
    const stats = fs.statSync(filePath);
    console.log(`\n=== ${file} (${stats.size} bytes) ===`);
    
    if (stats.size < 100000) { // Only read files smaller than 100KB
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n').slice(-20); // Last 20 lines
      console.log(lines.join('\n'));
    } else {
      console.log('File too large to display');
    }
  });
} catch (err) {
  console.error('Error reading logs:', err.message);
}
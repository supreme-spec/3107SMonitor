import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const isWin = process.platform === 'win32';
const pyPath = isWin ? join(__dirname, 'venv', 'Scripts', 'python.exe') : join(__dirname, 'venv', 'bin', 'python');
const python = existsSync(pyPath) ? pyPath : 'python';

const child = spawn(python, ['face_server.py'], { stdio: 'inherit', cwd: __dirname });

child.on('close', (code) => {
  process.exit(code ?? 0);
});

process.on('SIGTERM', () => {
  child.kill('SIGTERM');
});
process.on('SIGINT', () => {
  child.kill('SIGINT');
});

if (process.stdin.isTTY) {
  process.stdin.resume();
} else {
  setInterval(() => {}, 1000);
}

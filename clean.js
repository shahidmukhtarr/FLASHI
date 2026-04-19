import fs from 'fs';
import path from 'path';

const dirsToClean = ['.next', 'pages'];

dirsToClean.forEach((dir) => {
  const dirPath = path.resolve(process.cwd(), dir);
  if (fs.existsSync(dirPath)) {
    console.log(`[Clean] Removing old directory: ${dir}`);
    fs.rmSync(dirPath, { recursive: true, force: true });
  }
});

console.log('[Clean] Cleanup complete.');

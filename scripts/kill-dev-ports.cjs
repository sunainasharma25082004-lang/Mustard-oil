/**
 * Frees ports 3000, 5173, 5174 before starting dev:local (Windows-friendly).
 */
const { execSync } = require('child_process');

const PORTS = [3000, 5173, 5174];

const killOnWindows = (port) => {
  try {
    const output = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8' });
    const pids = new Set();

    for (const line of output.split('\n')) {
      if (!/LISTENING/i.test(line)) continue;
      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      if (pid && /^\d+$/.test(pid)) pids.add(pid);
    }

    for (const pid of pids) {
      try {
        execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
        console.log(`[kill-ports] Freed :${port} (PID ${pid})`);
      } catch {
        // already gone
      }
    }
  } catch {
    // port not in use
  }
};

const killOnUnix = (port) => {
  try {
    const output = execSync(`lsof -ti :${port}`, { encoding: 'utf8' });
    for (const pid of output.split('\n').map((s) => s.trim()).filter(Boolean)) {
      try {
        process.kill(Number(pid), 'SIGTERM');
        console.log(`[kill-ports] Freed :${port} (PID ${pid})`);
      } catch {
        // ignore
      }
    }
  } catch {
    // port not in use
  }
};

for (const port of PORTS) {
  if (process.platform === 'win32') {
    killOnWindows(port);
  } else {
    killOnUnix(port);
  }
}

console.log('[kill-ports] Done — ports 3000, 5173, 5174 cleared');
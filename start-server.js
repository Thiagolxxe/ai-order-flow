
/**
 * Helper script to start the Express server
 */
const { spawn } = require('child_process');
const path = require('path');

const serverDir = path.join(__dirname, 'server');
console.log(`Starting server from directory: ${serverDir}`);

// Check if we're in development or production
const npmCommand = process.env.NODE_ENV === 'production' ? 'start' : 'dev';

// Spawn npm process to run the server
const serverProcess = spawn('npm', ['run', npmCommand], {
  cwd: serverDir,
  stdio: 'inherit', // This will pipe the child process stdout/stderr to parent
  shell: true
});

serverProcess.on('error', (error) => {
  console.error('Failed to start server:', error);
});

serverProcess.on('close', (code) => {
  if (code !== 0) {
    console.log(`Server process exited with code ${code}`);
  }
});

console.log(`Server process started with PID: ${serverProcess.pid}`);
console.log('Server should be running at http://localhost:5000');
console.log('You can check the connection at http://localhost:5000/api/check-connection');
console.log('Press Ctrl+C to stop the server');

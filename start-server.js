
/**
 * Enhanced helper script to start the Express server with better error handling
 */
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const serverDir = path.join(__dirname, 'server');
console.log(`Starting server from directory: ${serverDir}`);

// Check if required files exist
const checkRequiredFiles = () => {
  const requiredFiles = [
    path.join(serverDir, 'server.js'),
    path.join(serverDir, 'routes', 'index.js'),
    path.join(serverDir, 'routes', 'videoRoutes.js')
  ];
  
  const missingFiles = requiredFiles.filter(file => !fs.existsSync(file));
  
  if (missingFiles.length > 0) {
    console.error('Error: Missing required files:');
    missingFiles.forEach(file => console.error(`  - ${file}`));
    console.error('Please ensure all required files exist before starting the server.');
    process.exit(1);
  }
};

// Check for required files
checkRequiredFiles();

// Check if we're in development or production
const npmCommand = process.env.NODE_ENV === 'production' ? 'start' : 'dev';

// Set environment variables
process.env.SERVER_PORT = process.env.PORT || 5000;

// Spawn npm process to run the server
const serverProcess = spawn('npm', ['run', npmCommand], {
  cwd: serverDir,
  stdio: 'inherit', // This will pipe the child process stdout/stderr to parent
  shell: true,
  env: { ...process.env }
});

serverProcess.on('error', (error) => {
  console.error('Failed to start server:', error);
});

serverProcess.on('close', (code) => {
  if (code !== 0) {
    console.log(`Server process exited with code ${code}`);
    console.log('Check server logs for more details about the error.');
    
    // Provide helpful troubleshooting tips
    console.log('\nTroubleshooting tips:');
    console.log('1. Check if the port is already in use');
    console.log('2. Verify that all dependencies are installed correctly');
    console.log('3. Look for syntax errors in your server code');
    console.log('4. Check if database connections are configured properly');
  }
});

console.log(`Server process started with PID: ${serverProcess.pid}`);
console.log(`Server should be running at http://localhost:${process.env.SERVER_PORT}`);
console.log(`You can check the connection at http://localhost:${process.env.SERVER_PORT}/api/health`);
console.log('API endpoints available:');
console.log(`- Videos: http://localhost:${process.env.SERVER_PORT}/api/videos`);
console.log(`- Authentication: http://localhost:${process.env.SERVER_PORT}/api/auth`);
console.log(`- Restaurants: http://localhost:${process.env.SERVER_PORT}/api/restaurants`);
console.log('\nPress Ctrl+C to stop the server');

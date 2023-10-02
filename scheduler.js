// scheduler.js
const { spawn } = require('child_process');

// Function to run your script
function runScript() {
  const script = spawn('node', ['index.js']);

  script.stdout.on('data', (data) => {
    console.log(`Script output: ${data}`);
  });

  script.stderr.on('data', (data) => {
    console.error(`Script error: ${data}`);
  });

  script.on('close', (code) => {
    console.log(`Script exited with code ${code}`);
  });
}

// Run the script initially
runScript();

// Schedule the script to run every minute
const interval = 10* 1000; // 60 seconds
setInterval(runScript, interval);
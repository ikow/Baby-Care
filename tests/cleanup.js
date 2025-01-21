const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);
const http = require('http');
const path = require('path');

async function cleanup() {
    console.log('Cleaning up server processes...');
    try {
        // Kill any process using port 5001
        await execAsync('lsof -ti:5001 | xargs kill -9 || true');
        // Kill any node server.js process
        await execAsync('pkill -f "node server.js" || true');
    } catch (error) {
        // Ignore errors if no process found
        console.log('No processes to clean up');
    }
    
    // Wait for port to be free
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('Cleanup completed');

    // Start server
    console.log('Starting server...');
    const serverPath = path.join(__dirname, '..', 'backend', 'server.js');
    const serverProcess = exec(`node "${serverPath}"`, {
        env: {
            ...process.env,
            NODE_ENV: 'test',
            MONGODB_URI: 'mongodb://localhost:27017/baby_care_test',
            PORT: '5001'
        }
    }, (error, stdout, stderr) => {
        if (error) {
            console.error('Server start error:', error);
            return;
        }
        if (stderr) {
            console.error('Server stderr:', stderr);
        }
        if (stdout) {
            console.log('Server stdout:', stdout);
        }
    });

    // Wait for server to be ready
    await new Promise(resolve => setTimeout(resolve, 3000));
    console.log('Server started successfully');

    return serverProcess;
}

async function checkServerHealth(retries = 5) {
    for (let i = 0; i < retries; i++) {
        try {
            await new Promise((resolve, reject) => {
                http.get('http://localhost:5001/health', (res) => {
                    if (res.statusCode === 200) {
                        resolve();
                    } else {
                        reject(new Error(`Health check failed with status: ${res.statusCode}`));
                    }
                }).on('error', reject);
            });
            return true;
        } catch (error) {
            console.log(`Health check attempt ${i + 1} failed, retrying...`);
            if (i === retries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
}

module.exports = cleanup; 
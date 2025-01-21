const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);
const waitOn = require('wait-on');
const path = require('path');
const net = require('net');

async function isPortInUse(port) {
    return new Promise((resolve) => {
        const server = net.createServer()
            .once('error', () => resolve(true))
            .once('listening', () => {
                server.close();
                resolve(false);
            })
            .listen(port);
    });
}

async function findAvailablePort(startPort, endPort) {
    for (let port = startPort; port <= endPort; port++) {
        if (!await isPortInUse(port)) {
            return port;
        }
    }
    throw new Error('No available ports found');
}

async function waitForMongoDB() {
    try {
        await waitOn({
            resources: ['tcp:27017'],
            timeout: 5000,
            interval: 100,
        });
        console.log('MongoDB is ready');
        return true;
    } catch (error) {
        console.error('MongoDB connection failed:', error);
        return false;
    }
}

async function waitForServer(port, timeout = 5000) {
    try {
        await waitOn({
            resources: [`http-get://localhost:${port}/health`],
            timeout,
            interval: 100,
        });
        console.log(`Server is ready on port ${port}`);
        return true;
    } catch (error) {
        console.error(`Server failed to start on port ${port}:`, error);
        return false;
    }
}

async function globalSetup() {
    console.log('Starting global setup...');

    // Kill any existing server processes
    try {
        await execAsync('pkill -f "node server.js" || true');
        console.log('Cleaned up existing server processes');
        // Wait for processes to fully terminate
        await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
        // Ignore errors if no process found
    }

    // Wait for MongoDB
    const isMongoReady = await waitForMongoDB();
    if (!isMongoReady) {
        throw new Error('MongoDB is not available');
    }

    // Find available port
    const port = await findAvailablePort(5001, 5010);
    console.log(`Using port ${port} for server`);

    // Start the server
    const serverPath = path.join(__dirname, '../../backend/server.js');
    const serverProcess = exec(`node "${serverPath}"`, {
        env: {
            ...process.env,
            NODE_ENV: 'test',
            MONGODB_URI: 'mongodb://localhost:27017/baby_care_test',
            PORT: port.toString()
        }
    });

    // Handle server output
    serverProcess.stdout.on('data', (data) => {
        console.log(`Server stdout: ${data}`);
    });

    serverProcess.stderr.on('data', (data) => {
        console.error(`Server stderr: ${data}`);
    });

    // Wait for server to be ready
    const isServerReady = await waitForServer(port);
    if (!isServerReady) {
        throw new Error('Server failed to start');
    }

    // Store port for tests
    process.env.TEST_SERVER_PORT = port.toString();
    console.log('Global setup completed');
}

module.exports = globalSetup; 
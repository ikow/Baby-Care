const { exec } = require('child_process');
const waitOn = require('wait-on');
const path = require('path');
const cleanup = require('./cleanup');
const mongoose = require('mongoose');

async function waitForMongoDB() {
    try {
        await waitOn({
            resources: ['tcp:27017'],
            timeout: 30000,
            interval: 100,
        });
        console.log('MongoDB is ready');
        return true;
    } catch (error) {
        console.error('MongoDB connection failed:', error);
        return false;
    }
}

async function waitForServer(server, port = 5001) {
    return new Promise((resolve, reject) => {
        let output = '';
        let isStarted = false;
        let startupTimeout;

        const checkServerStarted = (data) => {
            output += data.toString();
            if (data.includes('Server is running on port') && !isStarted) {
                isStarted = true;
                clearTimeout(startupTimeout);
                // Give the server a moment to initialize routes
                setTimeout(() => resolve(true), 2000);
            }
        };

        server.stdout?.on('data', checkServerStarted);
        server.stderr?.on('data', (data) => {
            output += data.toString();
            console.error(`Server stderr: ${data}`);
        });

        server.on('error', (error) => {
            console.error('Server error:', error);
            clearTimeout(startupTimeout);
            reject(new Error(`Server failed to start: ${error.message}\nOutput: ${output}`));
        });

        server.on('exit', (code) => {
            if (!isStarted) {
                clearTimeout(startupTimeout);
                reject(new Error(`Server exited with code ${code}\nOutput: ${output}`));
            }
        });

        // Timeout after 30 seconds
        startupTimeout = setTimeout(() => {
            if (!isStarted) {
                reject(new Error(`Server startup timed out\nOutput: ${output}`));
            }
        }, 30000);
    });
}

async function verifyHealthEndpoint(port = 5001) {
    try {
        const response = await fetch(`http://localhost:${port}/health`);
        const data = await response.json();
        return data.status === 'ok' && data.mongodb === 'connected';
    } catch (error) {
        return false;
    }
}

async function cleanupDatabase() {
    if (mongoose.connection.readyState === 1) {
        const collections = await mongoose.connection.db.collections();
        for (const collection of collections) {
            await collection.deleteMany({});
        }
        console.log('Test database cleaned');
    }
}

async function setupTestServer() {
    // Clean up database first
    await cleanupDatabase();
    
    // Clean up server processes
    const serverProcess = await cleanup();
    
    // Wait for MongoDB to be ready
    const isMongoReady = await waitForMongoDB();
    if (!isMongoReady) {
        throw new Error('MongoDB failed to start');
    }
    
    // Wait for server to be ready
    await waitForServer(serverProcess);
    
    // Verify health endpoint
    await verifyHealthEndpoint();
    
    return serverProcess;
}

module.exports = { setupTestServer, cleanupDatabase }; 
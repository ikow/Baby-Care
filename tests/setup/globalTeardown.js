const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);
const mongoose = require('mongoose');

async function globalTeardown() {
    console.log('Starting global teardown...');

    // Close MongoDB connection if open
    if (mongoose.connection.readyState === 1) {
        await mongoose.connection.close();
        console.log('MongoDB connection closed');
    }

    // Kill any remaining server processes
    try {
        await execAsync('pkill -f "node server.js" || true');
        console.log('Cleaned up server processes');
    } catch (error) {
        // Ignore errors if no process found
    }

    // Give some time for processes to clean up
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('Global teardown completed');
}

module.exports = globalTeardown; 
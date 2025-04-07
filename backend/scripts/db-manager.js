#!/usr/bin/env node

/**
 * MongoDB Backup and Restore Tool
 * 
 * This script provides functionality to backup and restore MongoDB databases
 * from both local and remote servers.
 * 
 * Usage:
 *   - For backup: node db-manager.js backup [host] [port] [database] [username] [password]
 *   - For restore: node db-manager.js restore [backup-file] [host] [port] [database] [username] [password]
 * 
 * Examples:
 *   - Local backup: node db-manager.js backup localhost 27017 baby-tracker
 *   - Remote backup: node db-manager.js backup 192.168.1.82 27017 baby-tracker admin password123
 *   - Restore: node db-manager.js restore ./backups/baby-tracker-2025-04-07.gz localhost 27017 baby-tracker
 */

const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const moment = require('moment-timezone');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Default configuration values
const DEFAULT_HOST = 'localhost';
const DEFAULT_PORT = '27017';
const DEFAULT_DB = process.env.MONGODB_URI ? 
  process.env.MONGODB_URI.split('/').pop() : 
  'baby-tracker';
const BACKUP_DIR = process.env.BACKUP_DIR || './backups';

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  console.log(`Created backup directory: ${BACKUP_DIR}`);
}

// Parse command line arguments
const [,, operation, ...args] = process.argv;

// Show usage information
function showUsage() {
  console.log('\nMongoDB Backup and Restore Tool');
  console.log('\nUsage:');
  console.log('  - For backup: node db-manager.js backup <host> <port> <database> <username> <password>');
  console.log('  - For restore: node db-manager.js restore <backup-file> <host> <port> <database> <username> <password>');
  console.log('\nExamples:');
  console.log('  - Local backup: node db-manager.js backup localhost 27017 baby-tracker');
  console.log('  - Remote backup: node db-manager.js backup 192.168.1.82 27017 baby-tracker admin password123');
  console.log('  - Restore: node db-manager.js restore ./backups/baby-tracker-2025-04-07.gz localhost 27017 baby-tracker');
  console.log('\nDefaults:');
  console.log(`  - Host: ${DEFAULT_HOST}`);
  console.log(`  - Port: ${DEFAULT_PORT}`);
  console.log(`  - Database: ${DEFAULT_DB}`);
  console.log(`  - Backup Directory: ${BACKUP_DIR}`);
  console.log('\nNote: Do not use square brackets in the command line. Replace <username> with the actual username.');
}

// Backup database
function backupDatabase(host, port, database, username, password) {
  const timestamp = moment().format('YYYY-MM-DD-HHmmss');
  const backupFilePath = path.join(BACKUP_DIR, `${database}-${timestamp}.gz`);
  
  // Build the mongodump command
  let command = `mongodump --host ${host} --port ${port} --db ${database} --gzip --archive="${backupFilePath}"`;
  
  // Add authentication if provided
  if (username && password) {
    command += ` --username ${username} --password ${password} --authenticationDatabase admin`;
  }
  
  console.log(`Starting backup of ${database} from ${host}:${port}...`);
  
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error during backup: ${error.message}`);
      return;
    }
    
    if (stderr) {
      console.log(`Command output: ${stderr}`);
    }
    
    console.log(`Backup completed successfully!`);
    console.log(`Backup saved to: ${backupFilePath}`);
  });
}

// Restore database
function restoreDatabase(backupFile, host, port, database, username, password) {
  if (!fs.existsSync(backupFile)) {
    console.error(`Backup file not found: ${backupFile}`);
    return;
  }
  
  // Build the mongorestore command
  let command = `mongorestore --host ${host} --port ${port} --db ${database} --gzip --archive="${backupFile}" --drop`;
  
  // Add authentication if provided
  if (username && password) {
    command += ` --username ${username} --password ${password} --authenticationDatabase admin`;
  }
  
  console.log(`Starting restore of ${database} on ${host}:${port} from ${backupFile}...`);
  
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error during restore: ${error.message}`);
      return;
    }
    
    if (stderr) {
      console.log(`Command output: ${stderr}`);
    }
    
    console.log(`Restore completed successfully!`);
  });
}

// List all backups
function listBackups() {
  if (!fs.existsSync(BACKUP_DIR)) {
    console.log('No backups found.');
    return;
  }
  
  const files = fs.readdirSync(BACKUP_DIR)
    .filter(file => file.endsWith('.gz'))
    .sort((a, b) => {
      // Sort by creation time (newest first)
      return fs.statSync(path.join(BACKUP_DIR, b)).mtime.getTime() -
             fs.statSync(path.join(BACKUP_DIR, a)).mtime.getTime();
    });
  
  if (files.length === 0) {
    console.log('No backups found.');
    return;
  }
  
  console.log('\nAvailable backups:');
  files.forEach((file, index) => {
    const stats = fs.statSync(path.join(BACKUP_DIR, file));
    const size = (stats.size / (1024 * 1024)).toFixed(2); // Size in MB
    const mtime = moment(stats.mtime).format('YYYY-MM-DD HH:mm:ss');
    console.log(`${index + 1}. ${file} (${size} MB) - Created: ${mtime}`);
  });
}

// Process command
function processCommand() {
  switch(operation) {
    case 'backup':
      const [backupHost = DEFAULT_HOST, backupPort = DEFAULT_PORT, backupDb = DEFAULT_DB, backupUser, backupPass] = args;
      backupDatabase(backupHost, backupPort, backupDb, backupUser, backupPass);
      break;
      
    case 'restore':
      if (args.length < 1) {
        console.error('Error: Backup file path is required for restore operation.');
        showUsage();
        return;
      }
      
      const [backupFile, restoreHost = DEFAULT_HOST, restorePort = DEFAULT_PORT, 
             restoreDb = DEFAULT_DB, restoreUser, restorePass] = args;
      restoreDatabase(backupFile, restoreHost, restorePort, restoreDb, restoreUser, restorePass);
      break;
      
    case 'list':
      listBackups();
      break;
      
    default:
      console.error(`Error: Unknown operation '${operation}'.`);
      showUsage();
  }
}

// Execute the appropriate command
if (!operation) {
  showUsage();
} else {
  processCommand();
} 
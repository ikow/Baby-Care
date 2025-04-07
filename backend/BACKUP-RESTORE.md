# MongoDB Backup and Restore Documentation

This document provides instructions on how to use the database backup and restore functionality for the Baby Care Tracker application.

## Prerequisites

To use the backup and restore functionality, you need to have the following installed:

- MongoDB Tools (mongodump, mongorestore)
- Node.js

## Configuration

The backup system reads configuration from the `.env` file. The relevant settings are:

- `MONGODB_URI`: The URI of your MongoDB database
- `BACKUP_DIR`: Directory where backups are stored (defaults to `./backups`)

## Usage

### Using the Shell Script Wrapper

To avoid shell interpretation issues with square brackets and other special characters, you can use the provided shell script wrapper:

```bash
# Make the script executable (if not already)
chmod +x scripts/db-backup.sh

# Basic usage
./scripts/db-backup.sh backup                                 # Local backup with defaults
./scripts/db-backup.sh backup 192.168.1.82 27017 baby-tracker # Remote backup without auth
./scripts/db-backup.sh backup 192.168.1.82 27017 baby-tracker admin password123 # With auth
./scripts/db-backup.sh restore ./backups/baby-tracker-2025-04-07-123456.gz # Local restore
./scripts/db-backup.sh list                                   # List all backups
```

### Using NPM Scripts

We've added several convenient npm scripts to make database operations easier:

#### List All Backups

```bash
npm run db:list
```

This will show all available backups with their creation dates and sizes.

#### Backup Local Database

```bash
npm run db:backup
```

This will create a backup of your local database using the settings from your `.env` file.

#### Backup Remote Database

For remote databases, you need to provide connection details:

```bash
# Basic syntax
node scripts/db-manager.js backup <host> <port> <database> <username> <password>

# Example (No authentication)
node scripts/db-manager.js backup 192.168.1.82 27017 baby-tracker

# Example (With authentication)
node scripts/db-manager.js backup 192.168.1.82 27017 baby-tracker admin password123
```

> **Important**: Do not use square brackets like `[username]` in the actual command. The shell will interpret them as glob patterns. Always replace the placeholders with actual values.

#### Restore Database

To restore a database from a backup:

```bash
# Basic syntax
node scripts/db-manager.js restore <backup-file> <host> <port> <database> <username> <password>

# Example (Local database)
node scripts/db-manager.js restore ./backups/baby-tracker-2025-04-07-123456.gz

# Example (Remote database)
node scripts/db-manager.js restore ./backups/baby-tracker-2025-04-07-123456.gz 192.168.1.82 27017 baby-tracker admin password123
```

### Automated Backups

You can set up automated backups using cron jobs. Here's an example crontab entry to backup your database daily at 2 AM:

```bash
0 2 * * * cd /path/to/baby-care/backend && node scripts/db-manager.js backup
```

## Backup File Naming

Backup files are named using the following format:

```
[database-name]-[timestamp].gz
```

For example:
```
baby-tracker-2025-04-07-123456.gz
```

## Important Notes

1. The `restore` operation includes the `--drop` flag, which means it will drop the existing collections before restoring. Make sure you have a backup of your current data if needed.

2. When restoring to a remote server, ensure that the MongoDB user has the necessary permissions to create and restore databases.

3. Backups are compressed using gzip to save disk space.

4. For security reasons, avoid storing database credentials in plain text. It's better to use environment variables or a secure credential store.

## Troubleshooting

### Common Issues

1. **Error: Command failed**: Make sure MongoDB tools (mongodump, mongorestore) are installed and in your PATH.

2. **Authentication failed**: Verify your username and password are correct, and that the user has appropriate permissions.

3. **Connection refused**: Check that the MongoDB server is running and accessible from your machine. Verify firewall settings if connecting to a remote server.

4. **"No matches found" error**: If you see an error like `zsh: no matches found: [username]`, you're using square brackets in your command which the shell is interpreting as glob patterns. Use the actual username and password without brackets.

### Getting Help

If you encounter issues not covered in this document, please:

1. Check the MongoDB documentation for mongodump and mongorestore.
2. Consult the application logs for more detailed error information. 
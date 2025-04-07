const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);
const path = require('path');
const fs = require('fs').promises;
const Backup = require('../models/backup');
const Logger = require('../utils/logger');

// Ensure backup directory is absolute
const BACKUP_DIR = process.env.BACKUP_DIR || path.resolve(__dirname, '../backups');

class BackupService {
    static async createBackup(userId, type = 'manual') {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `backup-${timestamp}.gz`;
            const backupPath = path.join(BACKUP_DIR, filename);

            // Create backup record
            const backup = new Backup({
                filename,
                path: path.relative(path.resolve(__dirname, '..'), backupPath), // Store relative path
                type,
                createdBy: userId,
                status: 'pending',
                size: 0  // Set initial size
            });
            await backup.save();

            try {
                // Ensure backup directory exists
                await fs.mkdir(BACKUP_DIR, { recursive: true });

                // Create backup using mongodump
                const { stdout, stderr } = await execAsync(
                    `mongodump --uri="${process.env.MONGODB_URI}" --archive="${backupPath}" --gzip`
                );

                // Get backup file size
                const stats = await fs.stat(backupPath);
                
                // Update backup record
                backup.size = stats.size;
                backup.status = 'completed';
                await backup.save();

                Logger.info('Backup created successfully', {
                    backupId: backup._id,
                    size: stats.size,
                    type
                });

                return backup;
            } catch (error) {
                backup.status = 'failed';
                backup.error = error.message;
                await backup.save();
                throw error;
            }
        } catch (error) {
            Logger.error('Backup creation failed', { error: error.message });
            throw error;
        }
    }

    static async getBackups(query = {}) {
        try {
            return await Backup.find(query)
                .sort({ timestamp: -1 })
                .populate('createdBy', 'username')
                .limit(50);
        } catch (error) {
            Logger.error('Failed to fetch backups', { error: error.message });
            throw error;
        }
    }

    static async deleteBackup(backupId) {
        try {
            const backup = await Backup.findById(backupId);
            if (!backup) {
                throw new Error('Backup not found');
            }

            // Delete file if it exists
            try {
                await fs.unlink(backup.path);
            } catch (error) {
                Logger.warn('Backup file not found', { backupId, path: backup.path });
            }

            // Delete record
            await backup.deleteOne();

            Logger.info('Backup deleted successfully', { backupId });
        } catch (error) {
            Logger.error('Failed to delete backup', { backupId, error: error.message });
            throw error;
        }
    }

    static async scheduleBackup(userId, schedule) {
        // Implementation for scheduled backups
        // This would typically use a job scheduler like node-cron
        // For now, we'll just create a manual backup
        return await this.createBackup(userId, 'scheduled');
    }

    static async restoreBackup(backupId) {
        try {
            const backup = await Backup.findById(backupId);
            if (!backup) {
                throw new Error('Backup not found');
            }

            if (backup.status !== 'completed') {
                throw new Error('Cannot restore from an incomplete backup');
            }

            // Update status to restoring
            backup.status = 'restoring';
            await backup.save();

            try {
                // Resolve the absolute path from the stored relative path
                const absolutePath = path.resolve(__dirname, '..', backup.path);

                // Ensure backup file exists
                await fs.access(absolutePath);

                // Restore using mongorestore
                const { stdout, stderr } = await execAsync(
                    `mongorestore --uri="${process.env.MONGODB_URI}" --archive="${absolutePath}" --gzip --drop`
                );

                // Update status to completed
                backup.status = 'completed';
                await backup.save();

                Logger.info('Backup restored successfully', { backupId });
                return { success: true, message: 'Backup restored successfully' };
            } catch (error) {
                // Update status back to completed if restore fails
                backup.status = 'completed';
                await backup.save();
                
                if (error.message.includes('ENOENT')) {
                    throw new Error('Backup file not found. The file may have been moved or deleted.');
                }
                throw error;
            }
        } catch (error) {
            Logger.error('Backup restoration failed', { backupId, error: error.message });
            throw error;
        }
    }
}

module.exports = BackupService; 
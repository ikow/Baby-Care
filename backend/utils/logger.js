const Log = require('../models/log');

class Logger {
    static async log(level, message, details = null) {
        try {
            const log = new Log({
                level,
                message,
                details
            });
            await log.save();
            
            // Also console log for development
            if (process.env.NODE_ENV === 'development') {
                console.log(`[${level.toUpperCase()}] ${message}`, details || '');
            }
        } catch (error) {
            console.error('Logging failed:', error);
        }
    }

    static async error(message, details = null) {
        return this.log('error', message, details);
    }

    static async warn(message, details = null) {
        return this.log('warn', message, details);
    }

    static async info(message, details = null) {
        return this.log('info', message, details);
    }

    static async debug(message, details = null) {
        return this.log('debug', message, details);
    }

    static async clearOldLogs(daysToKeep = 30) {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

            const result = await Log.deleteMany({
                timestamp: { $lt: cutoffDate }
            });

            console.log(`Cleared ${result.deletedCount} old logs`);
        } catch (error) {
            console.error('Failed to clear old logs:', error);
        }
    }
}

module.exports = Logger; 
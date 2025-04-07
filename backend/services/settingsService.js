const mongoose = require('mongoose');
const Logger = require('../utils/logger');

// Define settings schema
const settingsSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        unique: true
    },
    value: mongoose.Schema.Types.Mixed,
    category: {
        type: String,
        required: true
    },
    description: String,
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

const Settings = mongoose.model('Settings', settingsSchema);

class SettingsService {
    static async initialize() {
        try {
            // Define default settings
            const defaultSettings = [
                {
                    key: 'backup_frequency',
                    value: 'daily',
                    category: 'backup',
                    description: 'Frequency of automatic backups'
                },
                {
                    key: 'backup_retention_days',
                    value: 30,
                    category: 'backup',
                    description: 'Number of days to keep backups'
                },
                {
                    key: 'log_level',
                    value: 'info',
                    category: 'logging',
                    description: 'System log level'
                },
                {
                    key: 'log_retention_days',
                    value: 90,
                    category: 'logging',
                    description: 'Number of days to keep logs'
                }
            ];

            // Insert default settings if they don't exist
            for (const setting of defaultSettings) {
                await Settings.findOneAndUpdate(
                    { key: setting.key },
                    setting,
                    { upsert: true, new: true }
                );
            }

            Logger.info('Settings initialized successfully');
        } catch (error) {
            Logger.error('Failed to initialize settings', { error: error.message });
            throw error;
        }
    }

    static async get(key) {
        try {
            const setting = await Settings.findOne({ key });
            return setting ? setting.value : null;
        } catch (error) {
            Logger.error('Failed to get setting', { key, error: error.message });
            throw error;
        }
    }

    static async getAll(category = null) {
        try {
            const query = category ? { category } : {};
            const settings = await Settings.find(query).sort({ category: 1, key: 1 });
            return settings;
        } catch (error) {
            Logger.error('Failed to get settings', { error: error.message });
            throw error;
        }
    }

    static async update(key, value, userId) {
        try {
            const setting = await Settings.findOneAndUpdate(
                { key },
                { value, updatedBy: userId },
                { new: true }
            );

            if (!setting) {
                throw new Error(`Setting '${key}' not found`);
            }

            Logger.info('Setting updated', { key, value });
            return setting;
        } catch (error) {
            Logger.error('Failed to update setting', { key, error: error.message });
            throw error;
        }
    }

    static async updateBatch(settings, userId) {
        try {
            const updates = [];
            for (const { key, value } of settings) {
                const setting = await this.update(key, value, userId);
                updates.push(setting);
            }
            return updates;
        } catch (error) {
            Logger.error('Failed to update settings batch', { error: error.message });
            throw error;
        }
    }

    static async getBackupSettings() {
        try {
            const settings = await this.getAll('backup');
            return settings.reduce((acc, setting) => {
                acc[setting.key] = setting.value;
                return acc;
            }, {});
        } catch (error) {
            Logger.error('Failed to get backup settings', { error: error.message });
            throw error;
        }
    }

    static async getLoggingSettings() {
        try {
            const settings = await this.getAll('logging');
            return settings.reduce((acc, setting) => {
                acc[setting.key] = setting.value;
                return acc;
            }, {});
        } catch (error) {
            Logger.error('Failed to get logging settings', { error: error.message });
            throw error;
        }
    }
}

module.exports = SettingsService; 
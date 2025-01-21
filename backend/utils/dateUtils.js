const moment = require('moment-timezone');
const DEFAULT_TIMEZONE = process.env.TIMEZONE || 'America/Los_Angeles';

/**
 * Utility functions for handling dates and timestamps
 */

const startOfDay = (date, timezone = DEFAULT_TIMEZONE) => {
    return moment.tz(date, timezone).startOf('day').toDate();
};

const endOfDay = (date, timezone = DEFAULT_TIMEZONE) => {
    return moment.tz(date, timezone).endOf('day').toDate();
};

const createLocalTimestamp = (date, time, timezone = DEFAULT_TIMEZONE) => {
    if (!date) {
        return moment().tz(timezone).toDate();
    }
    
    // If only date is provided, use current time
    if (!time) {
        const now = moment().tz(timezone);
        time = now.format('HH:mm');
    }
    
    // Parse date and time in the specified timezone
    return moment.tz(`${date} ${time}`, 'YYYY-MM-DD HH:mm', timezone).toDate();
};

const formatDateForDisplay = (date, timezone = DEFAULT_TIMEZONE) => {
    return moment(date).tz(timezone).format('YYYY-MM-DD HH:mm');
};

const formatLocalDate = (date, timezone = DEFAULT_TIMEZONE) => {
    if (!date) return '';
    return moment(date).tz(timezone).format('YYYY-MM-DD');
};

const formatLocalTime = (date, timezone = DEFAULT_TIMEZONE) => {
    if (!date) return '';
    return moment(date).tz(timezone).format('HH:mm');
};

const getCurrentLocalTime = (timezone = DEFAULT_TIMEZONE) => {
    return moment().tz(timezone);
};

const convertToTimezone = (date, fromTimezone, toTimezone = DEFAULT_TIMEZONE) => {
    return moment.tz(date, fromTimezone).tz(toTimezone).toDate();
};

const isValidTimestamp = (timestamp) => {
    return moment(timestamp).isValid();
};

const isFutureTimestamp = (timestamp, timezone = DEFAULT_TIMEZONE) => {
    const now = moment().tz(timezone);
    const timestampInZone = moment(timestamp).tz(timezone);
    return timestampInZone.isAfter(now);
};

module.exports = {
    startOfDay,
    endOfDay,
    createLocalTimestamp,
    formatDateForDisplay,
    formatLocalDate,
    formatLocalTime,
    getCurrentLocalTime,
    convertToTimezone,
    isValidTimestamp,
    isFutureTimestamp
}; 
const express = require('express');
const router = express.Router();
const Feeding = require('../models/feeding');
const moment = require('moment-timezone');

// Define default timezone
const DEFAULT_TIMEZONE = process.env.TIMEZONE || 'America/Los_Angeles';

// Helper function to format date for aggregation
function getDateRange(startDate, endDate) {
    // Create moment objects in the configured timezone
    const start = moment.tz(startDate, DEFAULT_TIMEZONE).startOf('day');
    const end = moment.tz(endDate, DEFAULT_TIMEZONE).endOf('day');
    
    console.log('Date range calculation:', {
        startDate,
        endDate,
        timezone: DEFAULT_TIMEZONE,
        startMoment: start.format(),
        endMoment: end.format(),
        startJS: start.toDate(),
        endJS: end.toDate()
    });
    
    return { 
        start: start.toDate(), 
        end: end.toDate() 
    };
}

// Get statistics for a date range
router.get('/', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        if (!startDate || !endDate) {
            return res.status(400).json({ error: 'Start date and end date are required' });
        }

        console.log('Statistics request for date range:', { startDate, endDate });

        const { start, end } = getDateRange(startDate, endDate);
        const dateRange = { 
            timestamp: { $gte: start, $lte: end },
            isDeleted: { $ne: true }  // Only include non-deleted records
        };

        console.log('Querying with date range:', dateRange);

        // Get all records in date range
        const records = await Feeding.find(dateRange).sort({ timestamp: 1 });
        console.log('Total records found:', records.length);

        // Log all diaper records immediately after query
        const initialDiaperRecords = records.filter(r => r.type === 'diaper');
        console.log('Initial diaper records:', {
            total: initialDiaperRecords.length,
            records: initialDiaperRecords.map(r => ({
                id: r._id,
                timestamp: r.timestamp,
                type: r.type,
                diaperType: r.diaperType,
                isDeleted: r.isDeleted
            }))
        });

        // Calculate summary statistics
        const summary = {
            totalFeedings: records.filter(r => ['formula', 'breast_milk_bottle', 'breastfeeding'].includes(r.type)).length,
            totalDiapers: records.filter(r => r.type === 'diaper').length,
            latestDailyVolume: 0,
            averageFeedingsPerDay: 0
        };

        // Calculate daily volume totals
        const bottleFeedings = records.filter(r => ['formula', 'breast_milk_bottle'].includes(r.type));
        console.log('Bottle feedings found:', {
            total: bottleFeedings.length,
            records: bottleFeedings.map(r => ({
                id: r._id,
                timestamp: r.timestamp,
                type: r.type,
                volume: r.volume || 0
            }))
        });

        if (bottleFeedings.length > 0) {
            // Group feedings by date and calculate daily totals
            const volumesByDate = {};
            bottleFeedings.forEach(record => {
                const recordMoment = moment.tz(record.timestamp, DEFAULT_TIMEZONE);
                const date = recordMoment.format('YYYY-MM-DD');
                
                // Ensure volume is a valid number
                let volume = 0;
                if (record.volume !== null && record.volume !== undefined) {
                    volume = parseFloat(record.volume);
                    if (isNaN(volume)) volume = 0;
                }
                
                if (!volumesByDate[date]) {
                    volumesByDate[date] = 0;
                }
                volumesByDate[date] += volume;
                
                console.log(`Adding volume for ${date}:`, {
                    recordId: record._id,
                    recordTimestamp: recordMoment.format('YYYY-MM-DD HH:mm:ss'),
                    recordVolume: record.volume,
                    parsedVolume: volume,
                    newDailyTotal: volumesByDate[date]
                });
            });

            console.log('Daily volumes:', volumesByDate);

            // Get the latest daily volume from the end date
            const endDateStr = moment(end).tz(DEFAULT_TIMEZONE).format('YYYY-MM-DD');
            summary.latestDailyVolume = Math.round(volumesByDate[endDateStr] || 0);
            
            console.log('Latest daily volume calculation:', {
                endDate: endDateStr,
                endMomentFormatted: moment(end).tz(DEFAULT_TIMEZONE).format('YYYY-MM-DD HH:mm:ss'),
                volumeForDate: volumesByDate[endDateStr],
                latestVolume: summary.latestDailyVolume
            });
        } else {
            summary.latestDailyVolume = 0;
            console.log('No bottle feedings found');
        }

        // Calculate average feedings per day
        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        summary.averageFeedingsPerDay = summary.totalFeedings / days;

        // Generate daily labels
        const labels = [];
        const startMoment = moment.tz(startDate, DEFAULT_TIMEZONE).startOf('day');
        const endMoment = moment.tz(endDate, DEFAULT_TIMEZONE).endOf('day');
        const currentDate = startMoment.clone();
        
        // Log the date range for debugging
        console.log('Generating chart labels:', {
            start: startMoment.format('YYYY-MM-DD HH:mm:ss'),
            end: endMoment.format('YYYY-MM-DD HH:mm:ss'),
            timezone: DEFAULT_TIMEZONE
        });

        // Generate labels including the end date
        while (currentDate.isSameOrBefore(endMoment, 'day')) {
            const dateStr = currentDate.format('YYYY-MM-DD');
            labels.push(dateStr);
            currentDate.add(1, 'day');
            
            console.log('Added label:', {
                date: dateStr,
                currentMoment: currentDate.format('YYYY-MM-DD HH:mm:ss')
            });
        }

        // Log the generated labels
        console.log('Generated labels:', labels);

        // Prepare feeding pattern data with timezone-aware date comparison
        const feedingPattern = {
            labels,
            values: labels.map(date => {
                const count = records.filter(r => {
                    const recordDate = moment.tz(r.timestamp, DEFAULT_TIMEZONE).format('YYYY-MM-DD');
                    const matches = recordDate === date && ['formula', 'breast_milk_bottle', 'breastfeeding'].includes(r.type);
                    if (matches) {
                        console.log('Matched feeding record:', {
                            date,
                            recordDate,
                            recordId: r._id,
                            type: r.type
                        });
                    }
                    return matches;
                }).length;
                
                console.log('Feeding count for date:', {
                    date,
                    count
                });
                
                return count;
            })
        };

        // Prepare volume data
        const volumes = {
            labels,
            values: labels.map(date => {
                const dayRecords = records.filter(r => {
                    const recordDate = moment.tz(r.timestamp, DEFAULT_TIMEZONE).format('YYYY-MM-DD');
                    return recordDate === date && ['formula', 'breast_milk_bottle'].includes(r.type);
                });
                return dayRecords.reduce((sum, record) => sum + (record.volume || 0), 0);
            })
        };

        // Prepare diaper data
        const diaperRecords = records.filter(r => r.type === 'diaper' && !r.isDeleted);
        
        // Validate diaper records
        diaperRecords.forEach(record => {
            if (!record.diaperType) {
                console.warn('Found diaper record without diaperType:', record._id);
            }
            if (!['pee', 'poo', 'both'].includes(record.diaperType)) {
                console.warn('Found diaper record with invalid diaperType:', {
                    id: record._id,
                    diaperType: record.diaperType
                });
            }
        });

        const diapers = {
            labels,
            pee: labels.map(date => {
                const dayRecords = diaperRecords.filter(r => {
                    const recordDate = moment.tz(r.timestamp, DEFAULT_TIMEZONE).format('YYYY-MM-DD');
                    const isDiaperPee = r.diaperType === 'pee' || r.diaperType === 'both';
                    if (recordDate === date) {
                        console.log(`Processing pee diaper for ${date}:`, {
                            id: r._id,
                            type: r.diaperType,
                            counts: isDiaperPee ? 1 : 0
                        });
                    }
                    return recordDate === date && isDiaperPee;
                });
                return dayRecords.length;
            }),
            poo: labels.map(date => {
                const dayRecords = diaperRecords.filter(r => {
                    const recordDate = moment.tz(r.timestamp, DEFAULT_TIMEZONE).format('YYYY-MM-DD');
                    const isDiaperPoo = r.diaperType === 'poo' || r.diaperType === 'both';
                    if (recordDate === date) {
                        console.log(`Processing poo diaper for ${date}:`, {
                            id: r._id,
                            type: r.diaperType,
                            counts: isDiaperPoo ? 1 : 0
                        });
                    }
                    return recordDate === date && isDiaperPoo;
                });
                return dayRecords.length;
            })
        };

        // Validate final diaper data
        const hasDiaperData = diapers.pee.some(count => count > 0) || diapers.poo.some(count => count > 0);
        console.log('Diaper data validation:', {
            hasDiaperData,
            totalRecords: diaperRecords.length,
            peeCounts: diapers.pee.reduce((sum, count) => sum + count, 0),
            pooCounts: diapers.poo.reduce((sum, count) => sum + count, 0)
        });

        // Log final diaper data being sent
        console.log('Final diaper data being sent:', {
            labels: diapers.labels,
            pee: diapers.pee,
            poo: diapers.poo
        });

        res.json({
            totalFeedings: summary.totalFeedings,
            totalDiapers: summary.totalDiapers,
            latestDailyVolume: summary.latestDailyVolume,
            averageFeedingsPerDay: summary.averageFeedingsPerDay,
            feedingPatterns: feedingPattern,
            dailyVolumes: volumes,
            diaperChanges: {
                labels: diapers.labels,
                pee: diapers.pee,
                poo: diapers.poo
            }
        });
    } catch (error) {
        console.error('Error getting statistics:', error);
        res.status(500).json({ error: 'Failed to get statistics: ' + error.message });
    }
});

module.exports = router; 
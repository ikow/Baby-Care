const { test, expect } = require('@playwright/test');
const mongoose = require('mongoose');

test.describe('Backend API Tests', () => {
    const testBabyId = new mongoose.Types.ObjectId();

    test.beforeAll(async () => {
        // Connect to test database
        try {
            await mongoose.connect('mongodb://localhost:27017/baby_care_test', {
                serverSelectionTimeoutMS: 5000,
                retryWrites: true,
                directConnection: true,
                family: 4
            });
            console.log('Connected to test database');
            
            // Clear all collections
            const collections = await mongoose.connection.db.collections();
            for (const collection of collections) {
                await collection.deleteMany({});
            }
            console.log('Test database cleaned');
        } catch (error) {
            console.error('Database connection failed:', error);
            throw error;
        }
    });

    test.afterAll(async () => {
        // Drop test database and close connection
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.db.dropDatabase();
            console.log('Test database dropped');
            await mongoose.connection.close();
            console.log('Database connection closed');
        }
    });

    test.describe('Basic API Tests', () => {
        test('Health check and DB connection', async ({ request }) => {
            const response = await request.get('/health');
            expect(response.ok()).toBeTruthy();
            
            const data = await response.json();
            expect(data.status).toBe('ok');
            expect(data.mongodb).toBe('connected');
        });

        test('Create feeding record', async ({ request }) => {
            const timestamp = new Date();
            const data = {
                timestamp: timestamp.toISOString(),
                type: 'formula',
                volume: 100,
                notes: 'Test feeding',
                babyId: testBabyId.toString()
            };

            const response = await request.post('/api/feeding', {
                data: data,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            expect(response.ok()).toBeTruthy();
            const record = await response.json();
            
            expect(record.type).toBe(data.type);
            expect(record.volume).toBe(data.volume);
            expect(record.notes).toBe(data.notes);
            expect(record.babyId).toBe(data.babyId);
            expect(new Date(record.timestamp)).toEqual(new Date(timestamp));
        });
    });

    test.describe('Timezone Handling', () => {
        test('Create and retrieve feeding with different timezone offsets', async ({ request }) => {
            // Create a feeding at midnight UTC
            const utcMidnight = new Date();
            utcMidnight.setUTCHours(0, 0, 0, 0);
            
            const data = {
                timestamp: utcMidnight.toISOString(),
                type: 'formula',
                volume: 100,
                babyId: testBabyId.toString()
            };

            const createResponse = await request.post('/api/feeding', {
                data,
                headers: { 'Content-Type': 'application/json' }
            });
            expect(createResponse.ok()).toBeTruthy();

            // Get the record and verify timestamp
            const date = utcMidnight.toISOString().split('T')[0];
            const getResponse = await request.get(`/api/feeding/baby/${testBabyId.toString()}?date=${date}`);
            expect(getResponse.ok()).toBeTruthy();

            const records = await getResponse.json();
            expect(records.length).toBeGreaterThan(0);
            
            const record = records[0];
            const recordDate = new Date(record.timestamp);
            expect(recordDate.getUTCHours()).toBe(0);
            expect(recordDate.getUTCMinutes()).toBe(0);
        });

        test('Handle daylight saving time transitions', async ({ request }) => {
            // Create a feeding just before DST transition
            const dstDate = new Date('2024-03-10T01:59:00'); // Just before US DST spring forward
            const dstTimestamp = dstDate.getTime();
            
            const data = {
                timestamp: dstDate.toISOString(),
                type: 'formula',
                volume: 100,
                babyId: testBabyId.toString()
            };

            const createResponse = await request.post('/api/feeding', {
                data,
                headers: { 'Content-Type': 'application/json' }
            });
            expect(createResponse.ok()).toBeTruthy();

            // Get records for the DST transition day
            const date = dstDate.toISOString().split('T')[0];
            const getResponse = await request.get(`/api/feeding/baby/${testBabyId.toString()}?date=${date}`);
            expect(getResponse.ok()).toBeTruthy();

            const records = await getResponse.json();
            expect(records.length).toBeGreaterThan(0);
            
            const record = records[0];
            const recordDate = new Date(record.timestamp);
            
            // Compare timestamps accounting for DST offset
            const timeDiff = Math.abs(recordDate.getTime() - dstTimestamp);
            expect(timeDiff).toBeLessThanOrEqual(3600000); // Within 1 hour difference due to DST
            
            // Verify date components are the same
            expect(recordDate.getFullYear()).toBe(dstDate.getFullYear());
            expect(recordDate.getMonth()).toBe(dstDate.getMonth());
            expect(recordDate.getDate()).toBe(dstDate.getDate());
        });
    });

    test.describe('Data Validation', () => {
        test('Validate formula feeding volume', async ({ request }) => {
            // Test invalid volume (negative)
            const invalidData = {
                timestamp: new Date().toISOString(),
                type: 'formula',
                volume: -10,
                babyId: testBabyId.toString()
            };

            const invalidResponse = await request.post('/api/feeding', {
                data: invalidData,
                headers: { 'Content-Type': 'application/json' }
            });
            expect(invalidResponse.ok()).toBeFalsy();
            expect(invalidResponse.status()).toBe(400);

            // Test missing volume
            const missingVolumeData = {
                timestamp: new Date().toISOString(),
                type: 'formula',
                babyId: testBabyId.toString()
            };

            const missingResponse = await request.post('/api/feeding', {
                data: missingVolumeData,
                headers: { 'Content-Type': 'application/json' }
            });
            expect(missingResponse.ok()).toBeFalsy();
            expect(missingResponse.status()).toBe(400);
        });

        test('Validate breastfeeding duration', async ({ request }) => {
            // Test invalid duration (negative)
            const invalidData = {
                timestamp: new Date().toISOString(),
                type: 'breastfeeding',
                duration: -5,
                babyId: testBabyId.toString()
            };

            const invalidResponse = await request.post('/api/feeding', {
                data: invalidData,
                headers: { 'Content-Type': 'application/json' }
            });
            expect(invalidResponse.ok()).toBeFalsy();
            expect(invalidResponse.status()).toBe(400);

            // Test missing duration
            const missingDurationData = {
                timestamp: new Date().toISOString(),
                type: 'breastfeeding',
                babyId: testBabyId.toString()
            };

            const missingResponse = await request.post('/api/feeding', {
                data: missingDurationData,
                headers: { 'Content-Type': 'application/json' }
            });
            expect(missingResponse.ok()).toBeFalsy();
            expect(missingResponse.status()).toBe(400);
        });

        test('Validate feeding type', async ({ request }) => {
            // Test invalid feeding type
            const invalidData = {
                timestamp: new Date().toISOString(),
                type: 'invalid_type',
                volume: 100,
                babyId: testBabyId.toString()
            };

            const response = await request.post('/api/feeding', {
                data: invalidData,
                headers: { 'Content-Type': 'application/json' }
            });
            expect(response.ok()).toBeFalsy();
            expect(response.status()).toBe(400);
        });
    });

    test.describe('Date Range Queries', () => {
        test('Get feedings for multiple days', async ({ request }) => {
            // Create feedings for three consecutive days
            const day1 = new Date();
            const day2 = new Date(day1);
            day2.setDate(day2.getDate() - 1);
            const day3 = new Date(day1);
            day3.setDate(day3.getDate() - 2);

            // Create test records
            for (const day of [day1, day2, day3]) {
                await request.post('/api/feeding', {
                    data: {
                        timestamp: day.toISOString(),
                        type: 'formula',
                        volume: 100,
                        babyId: testBabyId.toString()
                    },
                    headers: { 'Content-Type': 'application/json' }
                });
            }

            // Query each day and verify records
            for (const day of [day1, day2, day3]) {
                const date = day.toISOString().split('T')[0];
                const response = await request.get(`/api/feeding/baby/${testBabyId.toString()}?date=${date}`);
                expect(response.ok()).toBeTruthy();

                const records = await response.json();
                expect(records.length).toBeGreaterThan(0);
                
                // Verify each record's date matches the query date
                for (const record of records) {
                    const recordDate = new Date(record.timestamp);
                    expect(recordDate.toISOString().split('T')[0]).toBe(date);
                }
            }
        });
    });

    test.describe('Record Management', () => {
        test('Update feeding record', async ({ request }) => {
            // Create a record first
            const createResponse = await request.post('/api/feeding', {
                data: {
                    timestamp: new Date().toISOString(),
                    type: 'formula',
                    volume: 100,
                    notes: 'Original note',
                    babyId: testBabyId.toString()
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            expect(createResponse.ok()).toBeTruthy();
            const original = await createResponse.json();

            // Update the record
            const updateResponse = await request.put(`/api/feeding/${original._id}`, {
                data: {
                    volume: 150,
                    notes: 'Updated note'
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            expect(updateResponse.ok()).toBeTruthy();

            const updated = await updateResponse.json();
            expect(updated._id).toBe(original._id);
            expect(updated.volume).toBe(150);
            expect(updated.notes).toBe('Updated note');
            expect(updated.type).toBe(original.type);
            expect(updated.babyId).toBe(original.babyId);
        });

        test('Delete feeding record', async ({ request }) => {
            // Create a record first
            const createResponse = await request.post('/api/feeding', {
                data: {
                    timestamp: new Date().toISOString(),
                    type: 'formula',
                    volume: 100,
                    notes: 'To be deleted',
                    babyId: testBabyId.toString()
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            expect(createResponse.ok()).toBeTruthy();
            const record = await createResponse.json();

            // Delete the record
            const deleteResponse = await request.delete(`/api/feeding/${record._id}`);
            expect(deleteResponse.ok()).toBeTruthy();

            // Verify deletion
            const getResponse = await request.get(`/api/feeding/${record._id}`);
            expect(getResponse.status()).toBe(404);
        });

        test('Bulk delete feedings', async ({ request }) => {
            // Create multiple records
            const records = await Promise.all([
                request.post('/api/feeding', {
                    data: {
                        timestamp: new Date().toISOString(),
                        type: 'formula',
                        volume: 100,
                        babyId: testBabyId.toString()
                    },
                    headers: { 'Content-Type': 'application/json' }
                }),
                request.post('/api/feeding', {
                    data: {
                        timestamp: new Date().toISOString(),
                        type: 'breastfeeding',
                        duration: 15,
                        babyId: testBabyId.toString()
                    },
                    headers: { 'Content-Type': 'application/json' }
                })
            ]);

            const recordResponses = await Promise.all(records.map(r => r.json()));
            const recordIds = recordResponses.map(r => r._id);

            // Delete records in bulk
            const deleteResponse = await request.post('/api/feeding/bulk-delete', {
                data: { ids: recordIds },
                headers: { 'Content-Type': 'application/json' }
            });
            expect(deleteResponse.ok()).toBeTruthy();

            // Verify all records are deleted
            for (const id of recordIds) {
                const getResponse = await request.get(`/api/feeding/${id}`);
                expect(getResponse.status()).toBe(404);
            }
        });
    });
}); 
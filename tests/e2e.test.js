const { test, expect } = require('@playwright/test');
const { waitForAlert, waitForSuccess, fillForm, waitForResponse, waitForPageLoad } = require('./utils/testHelpers');
const { formatDate, getLocalDate, addDays } = require('./utils/dateHelpers');
const { cleanupDatabase } = require('./testSetup');

test.describe('Baby Care Tracker E2E Tests', () => {
    test.beforeAll(async () => {
        await cleanupDatabase();
    });

    test.beforeEach(async ({ page }) => {
        // Navigate to the application and wait for initial load
        const baseUrl = process.env.TEST_SERVER_PORT ? 
            `http://localhost:${process.env.TEST_SERVER_PORT}` : 
            'http://localhost:5001';
        await page.goto(baseUrl);
        
        // Wait for critical elements individually to better handle timing
        await page.waitForSelector('#selectedDate', { timeout: 5000 });
        await page.waitForSelector('.date-nav-btn.prev-day-btn', { timeout: 2000 });
        await page.waitForSelector('.date-nav-btn.next-day-btn', { timeout: 2000 });
        await page.waitForSelector('#careForm', { timeout: 2000 });
        
        // Wait for initial data load
        await page.waitForLoadState('networkidle', { timeout: 5000 });
    });

    test('Initial page load', async ({ page }) => {
        // Check main elements one by one
        await expect(page.locator('.sidebar-logo')).toBeVisible({ timeout: 2000 });
        await expect(page.locator('.date-selector')).toBeVisible({ timeout: 2000 });
        await expect(page.locator('#careForm')).toBeVisible({ timeout: 2000 });
        
        // Get the current date from the page
        const pageDate = await page.locator('#selectedDate').inputValue();
        await expect(page.locator('#recordDate')).toHaveValue(pageDate, { timeout: 2000 });
        
        // Verify date format
        expect(pageDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    // Date Navigation Tests
    test.describe('Date Navigation', () => {
        test('should initialize with current date', async ({ page }) => {
            const today = getLocalDate();
            const pageDate = await page.locator('#selectedDate').inputValue();
            expect(pageDate).toBe(today);
        });

        test('should navigate between dates correctly', async ({ page }) => {
            // Get initial date
            const initialDate = await page.locator('#selectedDate').inputValue();
            
            // Test previous day
            await page.click('.date-nav-btn.prev-day-btn');
            await page.waitForSelector(`#selectedDate[value="${addDays(initialDate, -1)}"]`, { timeout: 2000 });
            const prevDate = await page.locator('#selectedDate').inputValue();
            expect(prevDate).toBe(addDays(initialDate, -1));

            // Test next day
            await page.click('.date-nav-btn.next-day-btn');
            await page.waitForSelector(`#selectedDate[value="${initialDate}"]`, { timeout: 2000 });
            const nextDate = await page.locator('#selectedDate').inputValue();
            expect(nextDate).toBe(initialDate);
        });

        test('should sync date across all inputs', async ({ page }) => {
            await page.click('.date-nav-btn.prev-day-btn');
            await page.waitForTimeout(100);
            const selectedDate = await page.locator('#selectedDate').inputValue();
            const recordDate = await page.locator('#recordDate').inputValue();
            expect(selectedDate).toBe(recordDate);
        });
    });

    // Form Validation Tests
    test.describe('Form Validation', () => {
        test('should validate required fields', async ({ page }) => {
            await page.click('.submit-btn');
            const invalidField = await page.locator('#careType:invalid');
            expect(await invalidField.count()).toBe(1);
        });

        test('should validate volume for formula feeding', async ({ page }) => {
            await page.selectOption('#careType', 'formula');
            await page.fill('#volume', '-1');
            await page.click('.submit-btn');
            const invalidField = await page.locator('#volume:invalid');
            expect(await invalidField.count()).toBe(1);
        });

        test('should validate duration for breastfeeding', async ({ page }) => {
            await page.selectOption('#careType', 'breastfeeding');
            await page.fill('#duration', '0');
            await page.click('.submit-btn');
            const invalidField = await page.locator('#duration:invalid');
            expect(await invalidField.count()).toBe(1);
        });
    });

    // Record Management Tests
    test.describe('Record Management', () => {
        test('should create and display formula feeding record', async ({ page }) => {
            await fillForm(page, {
                type: 'formula',
                volume: '120',
                notes: 'Test formula feeding'
            });

            await Promise.all([
                page.click('.submit-btn'),
                page.waitForResponse(res => 
                    res.url().includes('/api/feeding') && 
                    res.status() === 201
                )
            ]);

            await expect(page.locator('td:has-text("120 ml")')).toBeVisible();
            await expect(page.locator('td:has-text("Test formula feeding")')).toBeVisible();
        });

        test('should create and display breastfeeding record', async ({ page }) => {
            await fillForm(page, {
                type: 'breastfeeding',
                duration: '15',
                notes: 'Test breastfeeding'
            });

            await Promise.all([
                page.click('.submit-btn'),
                page.waitForResponse(res => 
                    res.url().includes('/api/feeding') && 
                    res.status() === 201
                )
            ]);

            await expect(page.locator('td:has-text("15 min")')).toBeVisible();
        });

        test('should edit existing record', async ({ page }) => {
            // Create a record first
            await fillForm(page, {
                type: 'formula',
                volume: '100',
                notes: 'Initial note'
            });
            await page.click('.submit-btn');
            await page.waitForSelector('td:has-text("100 ml")');

            // Edit the record
            await page.click('.btn-warning >> nth=0');
            await page.fill('input[type="number"]', '150');
            await page.fill('input[placeholder="Notes"]', 'Updated note');
            await page.click('.btn-primary');

            // Verify changes
            await expect(page.locator('td:has-text("150 ml")')).toBeVisible();
            await expect(page.locator('td:has-text("Updated note")')).toBeVisible();
        });

        test('should handle record deletion', async ({ page }) => {
            // Create a record
            await fillForm(page, {
                type: 'formula',
                volume: '100',
                notes: 'To be deleted'
            });
            await page.click('.submit-btn');
            await page.waitForSelector('td:has-text("100 ml")');

            // Set up dialog handler
            page.on('dialog', dialog => dialog.accept());

            // Delete the record
            await page.click('.btn-danger >> nth=0');
            await expect(page.locator('td:has-text("100 ml")')).not.toBeVisible();
        });
    });

    // Time Handling Tests
    test.describe('Time Handling', () => {
        test('should handle time input correctly', async ({ page }) => {
            const now = new Date();
            const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
            await page.fill('#recordTime', timeStr);
            
            await fillForm(page, {
                type: 'formula',
                volume: '100'
            });
            await page.click('.submit-btn');

            await page.waitForSelector(`td:has-text("${timeStr}")`);
        });
    });

    // Error Handling Tests
    test.describe('Error Handling', () => {
        test('should handle network errors gracefully', async ({ page }) => {
            // Simulate offline mode
            await page.route('**/*', route => route.abort());
            
            await fillForm(page, {
                type: 'formula',
                volume: '100'
            });
            await page.click('.submit-btn');

            const errorMessage = await waitForAlert(page);
            expect(errorMessage).toContain('Error');
        });

        test('should handle invalid data submission', async ({ page }) => {
            await page.route('**/api/feeding', route => {
                route.fulfill({
                    status: 400,
                    body: JSON.stringify({ message: 'Invalid data' })
                });
            });

            await fillForm(page, {
                type: 'formula',
                volume: '100'
            });
            await page.click('.submit-btn');

            const errorMessage = await waitForAlert(page);
            expect(errorMessage).toContain('Invalid data');
        });
    });

    test.describe('End-to-End Tests', () => {
        test.describe('Date Navigation and Timezone Handling', () => {
            test('should handle date navigation correctly across timezones', async ({ page }) => {
                // Get current date in local timezone
                const now = new Date();
                const localDate = formatDate(now);
                
                // Verify initial date is today
                const selectedDate = await page.locator('#selectedDate').inputValue();
                expect(selectedDate).toBe(localDate);
                
                // Navigate to previous day
                await page.click('.date-nav-btn.prev-day-btn');
                await page.waitForTimeout(100);
                
                // Calculate expected previous day
                const prevDay = new Date(now);
                prevDay.setDate(prevDay.getDate() - 1);
                const expectedPrevDate = formatDate(prevDay);
                
                // Verify date changed correctly
                const prevDate = await page.locator('#selectedDate').inputValue();
                expect(prevDate).toBe(expectedPrevDate);
                
                // Navigate back to today
                await page.click('.date-nav-btn.today-btn');
                await page.waitForTimeout(100);
                
                // Verify returned to today
                const currentDate = await page.locator('#selectedDate').inputValue();
                expect(currentDate).toBe(localDate);
            });

            test('should handle midnight transitions correctly', async ({ page }) => {
                // Set time close to midnight
                const nearMidnight = new Date();
                nearMidnight.setHours(23, 59);
                
                // Create a feeding record
                await fillForm(page, {
                    type: 'formula',
                    volume: '100',
                    notes: 'Near midnight feeding'
                });
                
                // Submit the form
                await Promise.all([
                    page.click('.submit-btn'),
                    waitForResponse(page, '/api/feeding', { status: 201 })
                ]);
                
                // Verify record appears in the list
                await expect(page.locator('td:has-text("100 ml")')).toBeVisible();
                
                // Navigate to next day
                await page.click('.date-nav-btn.next-day-btn');
                await page.waitForTimeout(100);
                
                // Verify record doesn't appear in next day
                await expect(page.locator('td:has-text("100 ml")')).not.toBeVisible();
            });
        });

        test.describe('Feeding Record Management', () => {
            test('should create and display formula feeding correctly', async ({ page }) => {
                const volume = '120';
                const notes = 'Test formula feeding';
                
                // Fill form
                await fillForm(page, {
                    type: 'formula',
                    volume,
                    notes
                });
                
                // Submit form
                await Promise.all([
                    page.click('.submit-btn'),
                    waitForResponse(page, '/api/feeding', { status: 201 })
                ]);
                
                // Verify record in list
                await expect(page.locator(`td:has-text("${volume} ml")`)).toBeVisible();
                await expect(page.locator(`td:has-text("${notes}")`)).toBeVisible();
                
                // Verify timestamp is in local timezone
                const recordTime = await page.locator('tr:has-text("120 ml") td.timestamp').textContent();
                const timeRegex = /\d{1,2}:\d{2} (AM|PM)/;
                expect(timeRegex.test(recordTime.trim())).toBeTruthy();
            });

            test('should create and display breastfeeding correctly', async ({ page }) => {
                const duration = '15';
                const notes = 'Test breastfeeding';
                
                // Fill form
                await fillForm(page, {
                    type: 'breastfeeding',
                    duration,
                    notes
                });
                
                // Submit form
                await Promise.all([
                    page.click('.submit-btn'),
                    waitForResponse(page, '/api/feeding', { status: 201 })
                ]);
                
                // Verify record in list
                await expect(page.locator(`td:has-text("${duration} min")`)).toBeVisible();
                await expect(page.locator(`td:has-text("${notes}")`)).toBeVisible();
            });

            test('should update feeding record', async ({ page }) => {
                // Create initial record
                await fillForm(page, {
                    type: 'formula',
                    volume: '100',
                    notes: 'Original note'
                });
                
                await Promise.all([
                    page.click('.submit-btn'),
                    waitForResponse(page, '/api/feeding', { status: 201 })
                ]);
                
                // Click edit button and wait for form update
                await page.click('.edit-btn >> nth=0');
                await page.waitForTimeout(100);
                
                // Update values
                await fillForm(page, {
                    volume: '150',
                    notes: 'Updated note'
                });
                
                // Submit update
                await Promise.all([
                    page.click('.update-btn'),
                    waitForResponse(page, '/api/feeding')
                ]);
                
                // Verify updated values
                await expect(page.locator('td:has-text("150 ml")')).toBeVisible();
                await expect(page.locator('td:has-text("Updated note")')).toBeVisible();
            });

            test('should delete feeding record', async ({ page }) => {
                // Create record
                await fillForm(page, {
                    type: 'formula',
                    volume: '100',
                    notes: 'To be deleted'
                });
                
                await Promise.all([
                    page.click('.submit-btn'),
                    waitForResponse(page, '/api/feeding', { status: 201 })
                ]);
                
                // Verify record exists
                await expect(page.locator('td:has-text("To be deleted")')).toBeVisible();
                
                // Set up dialog handler before clicking delete
                const dialogPromise = waitForAlert(page);
                
                // Delete record
                await Promise.all([
                    page.click('.delete-btn >> nth=0'),
                    dialogPromise,
                    waitForResponse(page, '/api/feeding')
                ]);
                
                // Verify record is removed
                await expect(page.locator('td:has-text("To be deleted")')).not.toBeVisible();
            });
        });

        test.describe('Form Validation', () => {
            test('should validate required fields', async ({ page }) => {
                // Try to submit without selecting type
                await page.click('.submit-btn');
                
                // Verify validation message
                const typeInput = await page.locator('#careType');
                expect(await typeInput.evaluate(el => el.validity.valid)).toBeFalsy();
            });

            test('should validate formula volume', async ({ page }) => {
                await page.selectOption('#careType', 'formula');
                await page.waitForTimeout(100);
                
                // Try negative volume
                await page.fill('#volume', '-10');
                await page.click('.submit-btn');
                
                // Verify validation message
                const volumeInput = await page.locator('#volume');
                expect(await volumeInput.evaluate(el => el.validity.valid)).toBeFalsy();
                
                // Try valid volume
                await page.fill('#volume', '100');
                expect(await volumeInput.evaluate(el => el.validity.valid)).toBeTruthy();
            });

            test('should validate breastfeeding duration', async ({ page }) => {
                await page.selectOption('#careType', 'breastfeeding');
                await page.waitForTimeout(100);
                
                // Try negative duration
                await page.fill('#duration', '-5');
                await page.click('.submit-btn');
                
                // Verify validation message
                const durationInput = await page.locator('#duration');
                expect(await durationInput.evaluate(el => el.validity.valid)).toBeFalsy();
                
                // Try valid duration
                await page.fill('#duration', '15');
                expect(await durationInput.evaluate(el => el.validity.valid)).toBeTruthy();
            });
        });

        test.describe('Bulk Operations', () => {
            test('should bulk delete multiple records', async ({ page }) => {
                // Create multiple records
                for (const volume of ['100', '150', '200']) {
                    await fillForm(page, {
                        type: 'formula',
                        volume
                    });
                    
                    await Promise.all([
                        page.click('.submit-btn'),
                        waitForResponse(page, '/api/feeding', { status: 201 })
                    ]);
                }
                
                // Select all records
                await page.click('.select-all-checkbox');
                await page.waitForTimeout(100);
                
                // Set up dialog handler before clicking delete
                const dialogPromise = waitForAlert(page);
                
                // Delete selected records
                await Promise.all([
                    page.click('.bulk-delete-btn'),
                    dialogPromise,
                    waitForResponse(page, '/api/feeding/bulk-delete')
                ]);
                
                // Verify all records are removed
                await expect(page.locator('td:has-text("ml")')).not.toBeVisible();
            });
        });
    });
}); 
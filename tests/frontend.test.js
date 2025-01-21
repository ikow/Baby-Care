const { test, expect } = require('@playwright/test');
const { waitForAlert, waitForSuccess } = require('./utils/testHelpers');

test.describe('Frontend Tests', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');
    });

    test('Basic UI Elements', async ({ page }) => {
        // Check main elements
        await expect(page.locator('.sidebar')).toBeVisible();
        await expect(page.locator('.main-content')).toBeVisible();
        await expect(page.locator('#careForm')).toBeVisible();
        await expect(page.locator('.date-selector')).toBeVisible();
    });

    test('Sidebar Toggle', async ({ page }) => {
        await page.click('.sidebar-toggle');
        await expect(page.locator('.sidebar.collapsed')).toBeVisible();
        
        await page.click('.sidebar-toggle');
        await expect(page.locator('.sidebar:not(.collapsed)')).toBeVisible();
    });

    test('Date Navigation', async ({ page }) => {
        const initialDate = await page.locator('#selectedDate').inputValue();
        
        // Test previous day
        await page.click('.date-nav-btn.prev-day-btn');
        await page.waitForTimeout(500);
        const prevDate = await page.locator('#selectedDate').inputValue();
        expect(new Date(prevDate)).toBeBefore(new Date(initialDate));
        
        // Test next day
        await page.click('.date-nav-btn.next-day-btn');
        await page.waitForTimeout(500);
        const nextDate = await page.locator('#selectedDate').inputValue();
        expect(nextDate).toBe(initialDate);
        
        // Test today button
        await page.click('.date-nav-btn.today-btn');
        await page.waitForTimeout(500);
        const todayDate = await page.locator('#selectedDate').inputValue();
        expect(todayDate).toBe(new Date().toISOString().split('T')[0]);
    });

    test('Form Functionality', async ({ page }) => {
        // Test form type selection
        await page.selectOption('#careType', 'formula');
        await expect(page.locator('#volume')).toBeVisible();
        await expect(page.locator('#duration')).not.toBeVisible();
        
        await page.selectOption('#careType', 'breastfeeding');
        await expect(page.locator('#duration')).toBeVisible();
        await expect(page.locator('#volume')).not.toBeVisible();
    });

    test('Record Creation and Deletion', async ({ page }) => {
        // Create formula feeding record
        await page.selectOption('#careType', 'formula');
        await page.fill('#volume', '120');
        await page.fill('#notes', 'Test formula feeding');
        
        await Promise.all([
            page.click('.submit-btn'),
            page.waitForResponse(res => 
                res.url().includes('/api/feeding') && 
                res.status() === 201
            )
        ]);
        
        await expect(page.locator('td:has-text("120 ml")')).toBeVisible();
        
        // Delete record
        page.on('dialog', dialog => dialog.accept());
        await page.click('.btn-danger >> nth=0');
        await expect(page.locator('td:has-text("120 ml")')).not.toBeVisible();
    });

    test('Bulk Record Operations', async ({ page }) => {
        // Create multiple records
        for (const volume of [100, 150, 200]) {
            await page.selectOption('#careType', 'formula');
            await page.fill('#volume', volume.toString());
            await page.click('.submit-btn');
            await page.waitForResponse(res => 
                res.url().includes('/api/feeding') && 
                res.status() === 201
            );
        }
        
        // Select all records
        await page.click('.select-all-checkbox');
        
        // Delete selected records
        page.on('dialog', dialog => dialog.accept());
        await page.click('.bulk-delete-btn');
        
        // Verify all records are deleted
        await expect(page.locator('td:has-text("ml")')).not.toBeVisible();
    });

    test('Form Validation', async ({ page }) => {
        // Test required fields
        await page.click('.submit-btn');
        const invalidField = await page.locator('#careType:invalid');
        expect(await invalidField.count()).toBe(1);
        
        // Test volume validation
        await page.selectOption('#careType', 'formula');
        await page.fill('#volume', '-1');
        await page.click('.submit-btn');
        const volumeError = await page.locator('#volume:invalid');
        expect(await volumeError.count()).toBe(1);
        
        // Test duration validation
        await page.selectOption('#careType', 'breastfeeding');
        await page.fill('#duration', '0');
        await page.click('.submit-btn');
        const durationError = await page.locator('#duration:invalid');
        expect(await durationError.count()).toBe(1);
    });
}); 
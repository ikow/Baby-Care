const { test, expect } = require('@playwright/test');

test('basic frontend functionality', async ({ page }) => {
    // Navigate to the page
    await page.goto('http://localhost:5001');
    
    // Wait for the page to load
    await page.waitForSelector('.dashboard-container');

    // Test form submission
    await test.step('submit care record', async () => {
        // Fill out the form
        await page.selectOption('#careType', 'formula');
        await page.fill('#volume', '100');
        await page.fill('#notes', 'Test feeding record');

        // Submit the form
        await page.click('button[type="submit"]');

        // Wait for success notification
        await page.waitForSelector('.alert');
        const notification = await page.textContent('.alert');
        expect(notification).toContain('Record added successfully');
    });

    // Test record display
    await test.step('verify record display', async () => {
        // Wait for records to load
        await page.waitForSelector('#careList tr');
        
        // Check if record appears in the table
        const records = await page.$$('#careList tr');
        expect(records.length).toBeGreaterThan(0);

        // Verify record details
        const details = await page.textContent('.details-cell');
        expect(details).toContain('100 ml');
    });

    // Test date navigation
    await test.step('date navigation', async () => {
        // Click previous day button
        await page.click('.prev-day-btn');
        
        // Wait for date change
        await page.waitForTimeout(500);
        
        // Click next day button
        await page.click('.next-day-btn');
        
        // Wait for date change
        await page.waitForTimeout(500);
        
        // Click today button
        await page.click('.today-btn');
        
        // Verify date navigation works
        const currentDate = new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        const displayedDate = await page.textContent('#currentDateDisplay');
        expect(displayedDate).toBe(currentDate);
    });

    // Test record selection
    await test.step('record selection', async () => {
        // Select a record
        await page.click('#careList input[type="checkbox"]');
        
        // Click delete selected button
        await page.click('button.btn-danger');
        
        // Handle confirmation dialog
        page.once('dialog', async dialog => {
            expect(dialog.type()).toBe('confirm');
            await dialog.accept();
        });

        // Wait for success notification
        await page.waitForSelector('.alert');
        const notification = await page.textContent('.alert');
        expect(notification).toContain('Records deleted successfully');

        // Add more wait time for animations
        await page.waitForTimeout(1000);
    });
}); 
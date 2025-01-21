const { chromium } = require('playwright');
const path = require('path');

async function runTests() {
    // Launch browser
    const browser = await chromium.launch({
        headless: false // Set to true for headless mode
    });
    
    // Create new context and page
    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
        // Start the application (assuming it's running)
        await page.goto('http://localhost:5001');
        console.log('Application loaded successfully');
        
        // Run tests
        await runTestSuite(page);
        
    } catch (error) {
        console.error('Test failed:', error);
    } finally {
        // Cleanup
        await context.close();
        await browser.close();
    }
}

async function runTestSuite(page) {
    const tests = [
        testInitialLoad,
        testDateNavigation,
        testRecordCreation,
        testRecordEditing,
        testRecordDeletion
    ];
    
    for (const test of tests) {
        try {
            console.log(`Running test: ${test.name}`);
            await test(page);
            console.log(`✅ ${test.name} passed`);
        } catch (error) {
            console.error(`❌ ${test.name} failed:`, error);
        }
    }
}

// Individual test functions
async function testInitialLoad(page) {
    await page.waitForSelector('.sidebar-logo');
    await page.waitForSelector('#selectedDate');
    await page.waitForSelector('#recordDate');
}

async function testDateNavigation(page) {
    await page.click('button[onclick="navigateDate(\'prev\')"]');
    await page.waitForTimeout(500);
    await page.click('button[onclick="navigateDate(\'next\')"]');
    await page.waitForTimeout(500);
    await page.click('button[onclick="navigateDate(\'today\')"]');
}

// Add more test functions as needed

// Run the tests
runTests().catch(console.error); 
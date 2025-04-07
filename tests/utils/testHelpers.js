const waitForAlert = async (page, timeout = 2000) => {
    return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
            reject(new Error('Alert dialog timeout'));
        }, timeout);

        page.on('dialog', async dialog => {
            clearTimeout(timeoutId);
            await dialog.accept();
            resolve(dialog.message());
        });
    });
};

const waitForSuccess = async (page, timeout = 3500) => {
    try {
        // First wait for the alert to appear
        await page.waitForSelector('.alert-success', { 
            state: 'visible',
            timeout: timeout
        });
        
        // Then wait for it to be removed from the DOM
        await page.waitForSelector('.alert-success', { 
            state: 'detached',
            timeout: timeout
        });
    } catch (error) {
        throw new Error(`Success alert timeout: ${error.message}`);
    }
};

const fillForm = async (page, data) => {
    try {
        if (data.type) {
            await page.selectOption('#careType', data.type);
            // Wait for form fields to update based on type
            await page.waitForTimeout(100);
        }
        
        if (data.volume) {
            await page.waitForSelector('#volume', { state: 'visible', timeout: 2000 });
            await page.fill('#volume', data.volume.toString());
        }
        
        if (data.duration) {
            await page.waitForSelector('#duration', { state: 'visible', timeout: 2000 });
            await page.fill('#duration', data.duration.toString());
        }
        
        if (data.notes) {
            await page.waitForSelector('#notes', { state: 'visible', timeout: 2000 });
            await page.fill('#notes', data.notes);
        }
    } catch (error) {
        throw new Error(`Form fill error: ${error.message}`);
    }
};

const waitForResponse = async (page, urlPattern, options = {}) => {
    const { status = 'ok', timeout = 2000 } = options;
    return page.waitForResponse(
        response => response.url().includes(urlPattern) && 
            (status === 'ok' ? response.ok() : response.status() === status),
        { timeout }
    );
};

const waitForPageLoad = async (page) => {
    await page.waitForLoadState('networkidle', { timeout: 2000 });
    await page.waitForLoadState('domcontentloaded', { timeout: 2000 });
};

module.exports = {
    waitForAlert,
    waitForSuccess,
    fillForm,
    waitForResponse,
    waitForPageLoad
}; 
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
    testDir: './tests',
    timeout: 10000,
    expect: {
        timeout: 2000
    },
    workers: 1,
    use: {
        baseURL: process.env.TEST_SERVER_PORT ? `http://localhost:${process.env.TEST_SERVER_PORT}` : 'http://localhost:5001',
        headless: true,
        viewport: { width: 1280, height: 720 },
        ignoreHTTPSErrors: true,
        video: 'retain-on-failure',
        screenshot: 'only-on-failure',
        trace: 'retain-on-failure',
        actionTimeout: 2000,
        navigationTimeout: 2000,
        retry: {
            enabled: true,
            maxRetries: 1
        }
    },
    reporter: [
        ['html'],
        ['list']
    ],
    retries: 0,
    globalSetup: require.resolve('./tests/setup/globalSetup.js'),
    globalTeardown: require.resolve('./tests/setup/globalTeardown.js')
}); 
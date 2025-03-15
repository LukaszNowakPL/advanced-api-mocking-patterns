import {defineConfig} from '@playwright/test';

const IS_CI = Boolean(process.env.CI);

export default defineConfig({
    name: 'playwright tests',
    outputDir: './test/functional/test-results',
    timeout: 45 * 1000,
    expect: {timeout: 15_000},
    forbidOnly: IS_CI,
    retries: IS_CI ? 2 : 0,
    reporter: [['list'], ['html', {outputFolder: './reports/playwright'}]],
    projects: [
        {
            name: 'Functional',
            testDir: './test',
            testMatch: '*/functional/*',
            outputDir: './test/functional/test-results',
        },
    ],
    use: {
        browserName: 'chromium',
        headless: true,
        viewport: {width: 1600, height: 1200},
        baseURL: 'http://localhost:9000',
        ignoreHTTPSErrors: true,
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        testIdAttribute: 'data-test-id',
    },
    webServer: {
        command: 'npm run preview',
        url: 'http://localhost:9000',
        reuseExistingServer: !IS_CI,
    },
});

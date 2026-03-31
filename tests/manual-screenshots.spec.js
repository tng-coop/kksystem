import { test, expect } from './fixtures.js';
import * as fs from 'fs';
import * as path from 'path';

test.describe('Manual Screenshots Generation', () => {

    test('Generate High-Fidelity Manual Screenshots', async ({ page, i18n }, testInfo) => {
        // We only want this script running when we explicitly ask for it!
        // We bypass it during standard `npm run test:e2e` execution
        test.skip(!process.env.TAKE_SCREENSHOTS, 'Only run this suite when specifically generating manual images');
        
        // Thanks to playwright.config.js, this EXACT same block runs concurrently 
        // across BOTH Desktop JP and Desktop EN environments automatically!
        const localeTag = testInfo.project.name === 'Desktop JP' ? 'jp' : 'en';
        
        // 1. Dashboard (With gorgeous Recharts data)
        await page.goto('./');
        await page.evaluate(() => localStorage.clear());
        await page.evaluate((lang) => localStorage.setItem('kksystem_lang', lang), localeTag);
        await page.reload();

        // Let the massive 24-month chart generator settle & render
        await page.waitForSelector('.recharts-wrapper', { timeout: 10000 });
        await page.waitForTimeout(1500); 
        await page.screenshot({ path: `dist/screenshots/01-dashboard-${localeTag}.png`, fullPage: true });

        // 2. Members Management Table
        await page.getByTestId('tab-members').click();
        await page.waitForSelector('table.data-table');
        await page.waitForTimeout(500);
        await page.screenshot({ path: `dist/screenshots/02-members-${localeTag}.png`, fullPage: true });

        // 3. Contributions Entry
        await page.getByTestId('tab-contributions').click();
        await page.waitForSelector('.form-card');
        await page.waitForTimeout(500);
        await page.screenshot({ path: `dist/screenshots/03-contributions-${localeTag}.png`, fullPage: true });

        // 4. Print App / Labels Pipeline
        await page.getByTestId('tab-members').click();
        await page.getByTestId('btn-print-labels').click();
        
        await page.emulateMedia({ media: 'print' });
        await page.waitForSelector('.print-only.labels-grid', { state: 'attached' });
        await page.waitForTimeout(500);
        await page.screenshot({ path: `dist/screenshots/04-print-labels-${localeTag}.png`, fullPage: true });
        
        await page.emulateMedia({ media: 'screen' });
    });
});

test.describe('Documentation Asset Integrity Check', () => {
    test.afterAll(async () => {
        const expectedAssets = [
            '01-dashboard-en.png', '01-dashboard-jp.png', 
            '02-members-en.png', '02-members-jp.png', 
            '03-contributions-en.png', '03-contributions-jp.png', 
            '04-print-labels-en.png', '04-print-labels-jp.png'
        ];

        for (const asset of expectedAssets) {
            const assetPath = path.resolve(`./dist/screenshots/${asset}`);
            expect(fs.existsSync(assetPath), `Missing High-Fidelity Manual Asset (404 RISK on GH Pages): ${assetPath}`).toBeTruthy();
        }
    });

    test('Invoke post-generation integrity checker', async () => {
        // test.afterAll executes after this dummy test satisfies parallel runners.
        expect(true).toBe(true);
    });
});

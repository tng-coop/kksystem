import { test, expect } from '@playwright/test';

test.describe('Demo Mode Parallel E2E Suite', () => {
  // Since we run in "fullyParallel" mode, every test runs in its own native browser Context. 
  // Browser Contexts inherently completely isolate localStorage and cookies, guaranteeing zero 
  // cross-contamination even while running tests concurrently at blistering speeds!
  test.beforeEach(async ({ page }) => {
    // Navigate to relative root to preserve subfolder contexts (like GH Pages /kksystem/)
    await page.goto('./');
    // Clear and reload to ensure the mock database initializes perfectly cleanly for this instance
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('Complete Member & Contribution Lifecycle', async ({ page }) => {
    await expect(page.locator('.demo-badge')).toBeVisible();
    await expect(page.getByTestId('stat-active-members').locator('.stat-number')).toHaveText('3');
    await expect(page.getByTestId('stat-total-capital').locator('.stat-number')).toContainText('210,000');

    // Add a new member
    await page.getByTestId('tab-members').click();
    await page.getByTestId('input-new-member-name').fill('Playwright Tester');
    await page.getByTestId('input-new-member-email').fill('tester@example.com');
    await page.getByTestId('input-new-member-date').fill('2026-03-31');
    await page.getByTestId('btn-submit-new-member').click();

    const newRow = page.getByTestId('member-row-4'); 
    await expect(newRow).toBeVisible();
    await expect(newRow).toContainText('Playwright Tester');

    // Add a contribution
    await page.getByTestId('tab-contributions').click();
    await page.getByTestId('select-contrib-member').selectOption('4');
    await page.getByTestId('input-contrib-amount').fill('50000');
    await page.getByTestId('input-contrib-date').fill('2026-03-31');
    await page.getByTestId('input-contrib-notes').fill('Auto Test Registration');
    await page.getByTestId('btn-submit-contrib').click();

    const newContribRow = page.locator('table.data-table tbody tr').filter({ hasText: 'Auto Test Registration' });
    await expect(newContribRow).toBeVisible();
    await expect(newContribRow.locator('.amount-cell')).toContainText('50,000'); 

    // Verify balances
    await page.getByTestId('tab-dashboard').click();
    await expect(page.getByTestId('stat-active-members').locator('.stat-number')).toHaveText('4');
    await expect(page.getByTestId('stat-total-capital').locator('.stat-number')).toContainText('260,000');
  });

  test('Duplicate Email Rejection Validation', async ({ page }) => {
    await page.getByTestId('tab-members').click();
    
    // Set up a listener to intercept the window.alert so the test doesn't freeze
    const dialogPromise = page.waitForEvent('dialog');

    await page.getByTestId('input-new-member-name').fill('Evil Hacker');
    // Attempt to register using Taro Tanaka's exact existing email
    await page.getByTestId('input-new-member-email').fill('taro.tanaka@example.jp'); 
    await page.getByTestId('btn-submit-new-member').click();

    // Wait for the browser alert and assert the error message
    const dialog = await dialogPromise;
    expect(dialog.message()).toContain('exists');
    await dialog.accept();

    // Verify Evil Hacker was NOT added to the table
    await expect(page.getByText('Evil Hacker')).not.toBeVisible();
    await expect(page.getByTestId('member-row-4')).not.toBeVisible();
  });

  test('Member Profile Editing', async ({ page }) => {
    await page.getByTestId('tab-members').click();

    // Expand the first member (ID 1: 田中 太郎)
    await page.getByTestId('member-row-1').click(); 
    await page.getByTestId('btn-edit-member-1').click();

    // The edit form appears; modify the name
    const nameInput = page.locator('.profile-edit-form input[placeholder="氏名"]');
    await nameInput.fill('田中 修'); 
    
    // Save changes
    await page.getByTestId('btn-save-member').click();

    // Verify row updated permanently in the DOM
    await expect(page.getByTestId('member-row-1')).toContainText('田中 修');
    await expect(page.getByTestId('member-row-1')).not.toContainText('田中 太郎');

    // Reload page to rigorously ensure LocalStorage correctly serialized and persisted the data change across sessions
    await page.reload();
    await page.getByTestId('tab-members').click();
    await expect(page.getByTestId('member-row-1')).toContainText('田中 修');
  });

  test('Member Status Management (Deceased/Inactive)', async ({ page }) => {
    await page.getByTestId('tab-members').click();
    
    // Open member 2 (佐藤 花子)
    await page.getByTestId('member-row-2').click();
    await page.getByTestId('btn-edit-member-2').click();

    // Uncheck 'is_living'
    const livingCheckbox = page.locator('.profile-edit-form input[type="checkbox"]');
    await livingCheckbox.uncheck();

    // Save changes
    await page.getByTestId('btn-save-member').click();

    // Verify '死亡' (Deceased) badge is rendered
    await expect(page.getByTestId('member-row-2').locator('.status-badge.inactive').filter({ hasText: '死亡' })).toBeVisible();
  });

  test('Print UI Rendering (Labels & Certificates)', async ({ page }) => {
    await page.getByTestId('tab-members').click();
    
    // Test Labels Print
    // Playwright natively triggers the navigator.webdriver logic in App.jsx which bypasses the vanished 100ms timeout
    await page.getByTestId('btn-print-labels').click();
    
    // Check if the print-only labels grid rendered completely reliably
    await expect(page.locator('.print-only.labels-grid')).toBeAttached();
    await expect(page.locator('.print-only.labels-grid .label-name').first()).toBeAttached();

    // Assert that our native app bypass flag was correctly triggered
    let printCalled = await page.evaluate(() => window.__PRINT_CALLED__);
    expect(printCalled).toBe(true);

    // Escape the perpetual printMode by cleanly reloading the context
    await page.reload();
    await page.getByTestId('tab-members').click();

    // Test Certificate Print (for member 1)
    await page.getByTestId('member-row-1').click();
    await page.getByTestId('btn-print-cert-1').click();
    
    // Check if the print-only certificate page reliably rendered
    await expect(page.locator('.print-only.certificate-page')).toBeAttached();
    await expect(page.locator('.print-only.certificate-page .cert-title')).toHaveText('出資証明書');

    printCalled = await page.evaluate(() => window.__PRINT_CALLED__);
    expect(printCalled).toBe(true);
  });

  test('Contribution Validation Edge Cases', async ({ page }) => {
    await page.getByTestId('tab-contributions').click();

    // Attempt to submit missing (empty) amount
    await page.getByTestId('select-contrib-member').selectOption('1');
    const inputAmount = page.getByTestId('input-contrib-amount');
    
    // The browser's native HTML5 validation will step in (required field).
    // We can evaluate if the input is natively flagged invalid
    await page.getByTestId('btn-submit-contrib').click();
    let isAmountInvalid = await inputAmount.evaluate((el) => !el.checkValidity());
    expect(isAmountInvalid).toBe(true);

    // Provide a negative number
    await inputAmount.fill('-5000');
    await page.getByTestId('btn-submit-contrib').click();
    isAmountInvalid = await inputAmount.evaluate((el) => !el.checkValidity());
    expect(isAmountInvalid).toBe(true);
  });
});

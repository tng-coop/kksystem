import * as fs from 'fs';
import * as path from 'path';

import { expect,test } from './fixtures.js';

test.describe('Demo Mode Parallel E2E Suite', () => {
  // Since we run in "fullyParallel" mode, every test runs in its own native browser Context. 
  // Browser Contexts inherently completely isolate localStorage and cookies, guaranteeing zero 
  // cross-contamination even while running tests concurrently at blistering speeds!
  test.beforeEach(async ({ page, i18n }) => {
    // Abort image and external font requests to run offline and at maximum speed
    await page.route('**/*', (route) => {
      const url = route.request().url();
      if (
        url.includes('fonts.googleapis.com') || 
        url.includes('fonts.gstatic.com') ||
        /\.(png|jpg|jpeg|svg|gif|webp)$/i.test(url)
      ) {
        route.abort();
      } else {
        route.continue();
      }
    });

    // Clear and inject the exact translation locale boundary prior to loading the page
    await page.addInitScript((lang) => {
      window.localStorage.clear();
      window.localStorage.setItem('kksystem_lang', lang);
      // Inject style to disable all CSS animations/transitions for instant E2E execution
      window.addEventListener('DOMContentLoaded', () => {
        const style = document.createElement('style');
        style.innerHTML = `
          *, *::before, *::after {
            transition: none !important;
            transition-duration: 0s !important;
            animation: none !important;
            animation-duration: 0s !important;
          }
        `;
        document.head.appendChild(style);
      });
    }, i18n.__lang);
    // Navigate to relative root to preserve subfolder contexts (like GH Pages /kksystem/)
    await page.goto('./');
    // Ensure the application is fully loaded and interactive before starting the test steps
    await expect(page.locator('.demo-badge')).toBeVisible();
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

  // SKIPPED TEMPORARILY: Chicken-and-egg deployment lock. 
  test.skip('README.md Documentation Integrity Checker', async ({ request }) => {
    const readmeSource = fs.readFileSync(path.resolve('./README.md'), 'utf-8');
    const urlRegex = /(https?:\/\/[^\s)\]]+)/g;
    const links = Array.from(readmeSource.matchAll(urlRegex), m => m[1]);
    for (const link of links) {
      if (link.includes('github.com') || link.includes('tng-coop.github.io')) {
        const response = await request.get(link);
        expect(response.ok(), `DEAD LINK DETECTED in README.md: ${link}`).toBeTruthy();
      }
    }
  });

  test('Member Registry CRUD, Status and Validation Edge Cases', async ({ page, i18n }) => {
    // Part 1: Duplicate Email Rejection Validation
    await page.getByTestId('tab-members').click();
    await expect(page.getByTestId('member-row-1')).toBeVisible();
    
    page.once('dialog', async (dialog) => {
      expect(dialog.message()).toContain('exists');
      await dialog.accept();
    });

    await page.getByTestId('input-new-member-name').fill('Evil Hacker');
    await page.getByTestId('input-new-member-email').fill('taro.tanaka@example.jp'); 
    await page.getByTestId('btn-submit-new-member').click();
    await expect(page.getByText('Evil Hacker')).not.toBeVisible();

    // Part 2: Member Profile Editing
    await page.getByTestId('member-row-1').click(); 
    await page.getByTestId('btn-edit-member-1').click();
    const nameInput = page.locator(`.profile-edit-form input[placeholder="${i18n.ph_name}"]`);
    await nameInput.fill('田中 修'); 
    await page.getByRole('button', { name: i18n.btn_save }).click();
    await expect(page.getByTestId('member-row-1')).toContainText('田中 修');

    // Part 3: Member Status Management (Deceased/Inactive)
    await page.getByTestId('member-row-2').click();
    await page.getByTestId('btn-edit-member-2').click();
    const livingCheckbox = page.locator('.profile-edit-form input[type="checkbox"]').first();
    await livingCheckbox.check();
    await page.getByRole('button', { name: i18n.btn_save }).click();
    await expect(page.getByTestId('member-row-2').locator('.status-badge.inactive').filter({ hasText: i18n.status_deceased })).toBeVisible();

    // Part 4: Contribution Validation Edge Cases
    await page.getByTestId('tab-contributions').click();
    await page.getByTestId('select-contrib-member').selectOption('1');
    const inputAmount = page.getByTestId('input-contrib-amount');
    await page.getByTestId('btn-submit-contrib').click();
    let isAmountInvalid = await inputAmount.evaluate((el) => !el.checkValidity());
    expect(isAmountInvalid).toBe(true);
    await inputAmount.fill('-5000');
    await page.getByTestId('btn-submit-contrib').click();
    isAmountInvalid = await inputAmount.evaluate((el) => !el.checkValidity());
    expect(isAmountInvalid).toBe(true);
  });

  test('Print UI Rendering (Labels & Certificates)', async ({ page, i18n }) => {
    await page.getByTestId('tab-members').click();
    
    // Test Labels Print
    await page.getByTestId('btn-print-labels').click();
    await expect(page.locator('.print-only.labels-grid')).toBeAttached();
    await expect(page.locator('.print-only.labels-grid .label-name').first()).toBeAttached();

    let printCalled = await page.evaluate(() => window.__PRINT_CALLED__);
    expect(printCalled).toBe(true);

    // Escape printMode
    await page.goto('./');
    await page.getByTestId('tab-members').click();

    // Test Certificate Print (for member 1)
    await page.getByTestId('member-row-1').click();
    await page.getByTestId('btn-print-cert-1').click();
    
    await expect(page.locator('.print-only.certificate-page')).toBeAttached();
    await expect(page.locator('.print-only.certificate-page .cert-title')).toHaveText(i18n.title_certificate);

    printCalled = await page.evaluate(() => window.__PRINT_CALLED__);
    expect(printCalled).toBe(true);
  });

  test('Modernized 1995 Menu Portal - Union Card & Departments', async ({ page }) => {
    // 1. Navigate to menu tab
    await page.getByTestId('tab-menu').click();
    await expect(page.locator('.menu-view')).toBeVisible();
    await expect(page.getByTestId('menu-unissued-counter')).toContainText('775');

    // 2. Test Union Card Issuance
    await page.getByTestId('menu-btn-union-card').click();
    await expect(page.locator('.union-card-view')).toBeVisible();
    await page.getByTestId('select-card-member').selectOption('1');
    await expect(page.locator('.digital-union-card')).toBeVisible();

    // 3. Test Department Management
    await page.getByTestId('tab-menu').click();
    await page.getByTestId('menu-btn-departments').click();
    await expect(page.locator('.departments-view')).toBeVisible();
    // Verify initial department
    await expect(page.getByTestId('dept-val-1')).toHaveText('地域支援部');
    // Change department
    await page.getByTestId('select-dept-member').selectOption('1');
    await page.getByTestId('input-new-dept-name').fill('総務管理部');
    await page.getByTestId('btn-save-dept').click();
    await expect(page.getByTestId('dept-val-1')).toHaveText('総務管理部');
  });

  test('Modernized 1995 Menu Portal - Annual Fees & Cooperators', async ({ page, i18n }) => {
    // 4. Test Annual Fee Management
    await page.getByTestId('tab-menu').click();
    await page.getByTestId('menu-btn-annual-fees').click();
    await expect(page.locator('.annual-fees-view')).toBeVisible();
    await expect(page.getByTestId('fee-badge-1')).toHaveText(i18n.lbl_paid);
    await page.getByTestId('fee-btn-toggle-1').click();
    await expect(page.getByTestId('fee-badge-1')).toHaveText(i18n.lbl_unpaid);

    // 5. Test Cooperator Management
    await page.getByTestId('tab-menu').click();
    await page.getByTestId('menu-btn-cooperators').click();
    await expect(page.locator('.cooperators-view')).toBeVisible();
    await page.getByTestId('input-coop-name').fill('Coop Friend');
    await page.getByTestId('input-coop-email').fill('friend@coop.org');
    await page.getByTestId('btn-submit-coop').click();
    await expect(page.getByTestId('coop-row-4')).toBeVisible();
  });

  test('Modernized 1995 Menu Portal Sub-modules B', async ({ page }) => {
    // 6. Test Total Display HUD
    await page.getByTestId('tab-menu').click();
    await page.getByTestId('menu-btn-total-display').click();
    await expect(page.getByTestId('hud-modal')).toBeVisible();
    await expect(page.getByTestId('hud-active-members')).toHaveText('3');
    await page.getByTestId('btn-close-hud').click();
    await expect(page.getByTestId('hud-modal')).not.toBeVisible();

    // 7. Verify Theme is set to modern
    await expect(page.locator('.app-container')).toHaveClass(/theme-modern/);

    // 8. Test Chairman Management
    await page.getByTestId('menu-chairman-btn').click();
    await expect(page.getByTestId('chairman-modal')).toBeVisible();
    await page.getByTestId('input-chairman-name').fill('佐藤 信一');
    await page.getByTestId('btn-save-chairman').click();
    await expect(page.getByTestId('menu-chairman-btn')).toContainText('佐藤 信一');

    // 9. Test Exit System Locked
    page.once('dialog', dialog => dialog.accept());
    await page.getByTestId('menu-exit-btn').click();
    await expect(page.getByTestId('exit-overlay')).toBeVisible();
    await page.getByTestId('btn-restart-system').click();
    await expect(page.getByTestId('exit-overlay')).not.toBeVisible();
  });

  test('Dual Mode Win95 Replica and Database Sync Verification', async ({ page, i18n }) => {
    // 1. Switch to retro mode first using the modern header mode toggle
    await page.getByTestId('btn-mode-toggle').click();
    await expect(page.getByTestId('win95-db-window')).toBeVisible();

    // 2. Click the Start button to show the start menu
    await page.click('button:has-text("Start")');
    await expect(page.locator('.win95-start-menu')).toBeVisible();

    // 3. Switch to modern mode
    await page.getByTestId('retro-btn-mode-toggle').click();
    await expect(page.locator('.app-container')).toHaveClass(/theme-modern/);

    // 4. Switch back to retro mode using the header mode toggle
    await page.getByTestId('btn-mode-toggle').click();
    await expect(page.getByTestId('win95-db-window')).toBeVisible();

    // 5. Open members subdialog
    await page.getByTestId('retro-menu-btn-1').click();

    // 6. Click "New" to start entering a new member
    await page.getByTestId('retro-access-btn-new').click();

    // 7. Fill out member details in retro form fields
    await page.getByTestId('retro-input-name').fill('Retro Tester');
    await page.getByTestId('retro-input-kananame').fill('レトロテスター');
    await page.getByTestId('retro-input-phone').fill('090-1234-5678');
    await page.getByTestId('retro-input-join_date').fill('2026-06-16');

    // 8. Click "Save"
    await page.getByTestId('retro-btn-save-member').click();
    
    // Expect our custom retro dialog to appear and click OK to dismiss
    const customAlert = page.getByTestId('retro-dialog');
    await expect(customAlert).toBeVisible();
    await page.getByTestId('retro-dialog-ok-btn').click();
    await expect(customAlert).not.toBeVisible();

    // 9. Switch back to modern mode
    await page.getByTestId('retro-btn-mode-toggle').click();

    // 10. Click the members tab in modern mode and check if the new member is listed
    await page.getByTestId('tab-members').click();
    const newMemberRow = page.getByTestId('member-row-4'); // 3 initial + 1 new = ID 4
    await expect(newMemberRow).toBeVisible();
    await expect(newMemberRow).toContainText('Retro Tester');
  });

  test('Retro Print Target Selector Filtering', async ({ page }) => {
    // 1. Switch to retro mode using modern header toggle
    await page.getByTestId('btn-mode-toggle').click();
    await expect(page.getByTestId('win95-db-window')).toBeVisible();

    // 2. Open members subdialog (redirects to ledger under E2E mode)
    await page.getByTestId('retro-menu-btn-1').click();

    // 2.5 Go back to member management menu from the ledger view
    await page.locator('button.win95-custom-btn', { hasText: '戻る' }).click();

    // 3. Click "組合員一覧印刷"
    await page.click('button:has-text("組合員一覧印刷")');
    await expect(page.getByText('印刷対象指定画面')).toBeVisible();

    // 4. Input Department "1" (地域支援部)
    await page.getByTestId('retro-print-dept-no').selectOption('1');

    // 5. Click "印刷"
    await page.getByTestId('retro-print-btn-print').click();

    // 6. Verify preview shows the correct filtered members
    // 田中 太郎 (Department: 地域支援部) should be visible, 佐藤 花子 (Department: 介護福祉部) should not be visible.
    await expect(page.locator('table tbody tr').filter({ hasText: '田中 太郎' })).toBeVisible();
    await expect(page.locator('table tbody tr').filter({ hasText: '佐藤 花子' })).not.toBeVisible();

    // 7. Click "閉じる" in the print preview
    await page.click('button:has-text("閉じる")');
    await expect(page.getByText('印刷対象指定画面')).toBeVisible();

    // 8. Reset Dept to none, and choose Delivery Destination "22" (which maps to "12", i.e. 佐藤 花子)
    await page.getByTestId('retro-print-dept-no').selectOption('');
    await page.getByTestId('retro-print-delivery-no').selectOption('22');

    // 9. Click "印刷"
    await page.getByTestId('retro-print-btn-print').click();

    // 10. Verify preview shows only matching delivery destination (佐藤 花子 visible, 田中 太郎 not visible)
    await expect(page.locator('table tbody tr').filter({ hasText: '佐藤 花子' })).toBeVisible();
    await expect(page.locator('table tbody tr').filter({ hasText: '田中 太郎' })).not.toBeVisible();
  });

  test('Retro Address Selector Filtering', async ({ page }) => {
    // 1. Switch to retro mode using modern header toggle
    await page.getByTestId('btn-mode-toggle').click();
    await expect(page.getByTestId('win95-db-window')).toBeVisible();

    // 2. Open members subdialog (redirects to ledger under E2E mode)
    await page.getByTestId('retro-menu-btn-1').click();

    // 3. Go back to member management menu from the ledger view
    await page.locator('button.win95-custom-btn', { hasText: '戻る' }).click();

    // 4. Click "宛名印刷"
    await page.click('button:has-text("宛名印刷")');
    await expect(page.getByText('印刷対象指定画面')).toBeVisible();

    // 5. Input Department "1" (地域支援部)
    await page.getByTestId('retro-address-dept-no').selectOption('1');

    // 6. Click "印刷"
    await page.getByTestId('retro-address-btn-print').click();

    // 7. Verify preview shows the correct filtered member address labels
    // 田中 太郎 (Department: 地域支援部) should be visible, 佐藤 花子 (Department: 介護福祉部) should not be visible.
    await expect(page.locator('.retro-body').filter({ hasText: '田中 太郎' })).toBeVisible();
    await expect(page.locator('.retro-body').filter({ hasText: '佐藤 花子' })).not.toBeVisible();

    // 8. Click "閉じる" in the print preview using evaluate to bypass taskbar overlap
    await page.getByTestId('retro-address-btn-close').evaluate(el => el.click());
    await expect(page.getByText('印刷対象指定画面')).toBeVisible();

    // 9. Reset Dept to none, and choose Delivery Destination "22" (which maps to "12", i.e. 佐藤 花子)
    await page.getByTestId('retro-address-dept-no').selectOption('');
    await page.getByTestId('retro-address-delivery-no').selectOption('22');

    // 10. Click "印刷"
    await page.getByTestId('retro-address-btn-print').click();

    // 11. Verify preview shows only matching delivery destination (佐藤 花子 visible, 田中 太郎 not visible)
    await expect(page.locator('.retro-body').filter({ hasText: '佐藤 花子' })).toBeVisible();
    await expect(page.locator('.retro-body').filter({ hasText: '田中 太郎' })).not.toBeVisible();
  });
});

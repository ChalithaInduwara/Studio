import { test, expect } from '@playwright/test';

test.describe('Studio Management UI', () => {
    test('Renders studio management and its components after admin login', async ({ page }) => {
        await page.goto('/');

        // Login as admin
        await page.getByPlaceholder('you@example.com').fill('admin@company.com');
        await page.getByPlaceholder('••••••••').fill('admin123');
        await page.getByRole('button', { name: 'Sign in' }).click();

        // Ensure we are in dashboard
        await expect(page.locator('text=Dashboard').first()).toBeVisible();

        // Click Studio Bookings in the sidebar
        await page.getByRole('button', { name: 'Studio Bookings' }).click();

        // Check Studio Management header
        await expect(page.locator('h1', { hasText: 'Studio Management' })).toBeVisible();

        // Check tabs
        await expect(page.getByRole('button', { name: 'Bookings', exact: true })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Project Files', exact: true })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Services & Rates', exact: true })).toBeVisible();

        // Click on Project Files tab and check upload button
        await page.getByRole('button', { name: 'Project Files', exact: true }).click();
        await expect(page.getByRole('button', { name: 'Upload File' })).toBeVisible();

        // Go back to Bookings
        await page.getByRole('button', { name: 'Bookings', exact: true }).click();

        // Test New Booking modal
        await page.getByRole('button', { name: 'New Booking' }).click();
        await expect(page.locator('h2', { hasText: 'New Booking' })).toBeVisible();

        // Close modal
        await page.locator('button').filter({ hasText: 'Cancel' }).click();
    });
});

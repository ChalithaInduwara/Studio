import { test, expect } from '@playwright/test';

test.describe('Academy Management UI', () => {
    test('Renders academy management and its components after admin login', async ({ page }) => {
        await page.goto('/');

        // Login as admin
        await page.getByPlaceholder('you@example.com').fill('admin@company.com');
        await page.getByPlaceholder('••••••••').fill('admin123');
        await page.getByRole('button', { name: 'Sign in' }).click();

        // Ensure we are in dashboard
        await expect(page.locator('text=Dashboard').first()).toBeVisible();

        // Click Academy Classes in the sidebar
        await page.getByRole('button', { name: 'Academy Classes' }).click();

        // Check Academy Management header
        await expect(page.locator('h1', { hasText: 'Music Academy' })).toBeVisible();

        // Check stats
        await expect(page.locator('text=Active Classes')).toBeVisible();
        await expect(page.locator('text=Enrolled Students')).toBeVisible();

        // Check tabs
        await expect(page.getByRole('button', { name: 'Classes', exact: true })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Students', exact: true })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Tutors', exact: true })).toBeVisible();

        // Test New Class modal
        await page.getByRole('button', { name: 'New Class' }).click();
        await expect(page.locator('h2', { hasText: 'New Class' })).toBeVisible();

        // Close modal
        await page.locator('button').filter({ hasText: 'Cancel' }).click();
    });
});

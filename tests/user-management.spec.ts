import { test, expect } from '@playwright/test';

test.describe('User Management UI', () => {
    test('Renders user management after admin login and navigation', async ({ page }) => {
        await page.goto('/');

        // Login as admin
        await page.getByPlaceholder('you@example.com').fill('admin@company.com');
        await page.getByPlaceholder('••••••••').fill('admin123');
        await page.getByRole('button', { name: 'Sign in' }).click();

        // Ensure we are in dashboard
        await expect(page.locator('text=Dashboard').first()).toBeVisible();

        // Click User Management in the sidebar
        // Role of admin shows User Management
        await page.getByRole('button', { name: 'User Management' }).click();

        // Check User Management header
        await expect(page.locator('h1', { hasText: 'User Management' })).toBeVisible();

        // Check Add User button
        await expect(page.getByRole('button', { name: 'Add User' })).toBeVisible();

        // Check stats
        await expect(page.locator('text=Total Users')).toBeVisible();
        await expect(page.locator('p', { hasText: /^Students$/ }).first()).toBeVisible();

        // Open Add User modal
        await page.getByRole('button', { name: 'Add User' }).click();
        await expect(page.locator('h2', { hasText: 'Add New User' })).toBeVisible();
        await expect(page.locator('form').getByRole('button', { name: 'Add User' })).toBeVisible();
    });
});
<
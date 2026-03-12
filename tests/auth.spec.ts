import { test, expect } from '@playwright/test';

test.describe('Auth UI', () => {
    test('Login Page renders correctly and handles invalid login', async ({ page }) => {
        await page.goto('/');

        // Check headings and UI elements
        await expect(page.locator('text=Welcome to Harmony Hub')).toBeVisible();
        await expect(page.getByPlaceholder('you@example.com')).toBeVisible();
        await expect(page.getByPlaceholder('••••••••')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();

        // Try invalid login
        await page.getByPlaceholder('you@example.com').fill('wrong@example.com');
        await page.getByPlaceholder('••••••••').fill('badpass');
        await page.getByRole('button', { name: 'Sign in' }).click();

        // Check error message
        await expect(page.locator('text=Invalid credentials')).toBeVisible();
    });

    test('Sign Up Page renders correctly', async ({ page }) => {
        await page.goto('/');

        // Navigate to Sign Up
        await page.getByRole('button', { name: 'Create new account' }).click();

        // Check headings and UI elements
        await expect(page.locator('text=Join Harmony Hub')).toBeVisible();
        await expect(page.getByPlaceholder('John Doe')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Create Account' })).toBeVisible();

        // Can navigate back to login
        await page.getByRole('button', { name: 'Sign in instead' }).click();
        await expect(page.locator('text=Welcome to Harmony Hub')).toBeVisible();
    });
});

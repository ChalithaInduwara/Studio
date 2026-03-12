import { test, expect } from '@playwright/test';

test.describe('Student Dashboard UI', () => {
    test('Renders student dashboard after student login', async ({ page }) => {
        await page.goto('/');

        // Login as student
        await page.getByPlaceholder('you@example.com').fill('student@company.com');
        await page.getByPlaceholder('••••••••').fill('student123');
        await page.getByRole('button', { name: 'Sign in' }).click();

        // Check dashboard heading
        await expect(page.locator('text=Welcome back, Jane Student!')).toBeVisible();

        // Check quick stats
        await expect(page.locator('text=Active Courses')).toBeVisible();
        await expect(page.locator('text=Practice This Week')).toBeVisible();
        await expect(page.locator('text=Upcoming Lessons')).toBeVisible();

        // Check enrolled classes
        await expect(page.getByRole('heading', { name: 'My Classes' })).toBeVisible();
        await expect(page.locator('text=Guitar Basics').first()).toBeVisible();
    });
});

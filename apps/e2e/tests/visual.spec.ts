import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Visual Regression and Accessibility', () => {
  test('Login Page - Visual & Axe', async ({ page }) => {
    await page.goto('/login');
    // Wait for form to render
    await page.waitForSelector('form');

    // Visual
    await expect(page).toHaveScreenshot('login-page.png', { fullPage: true });

    // Accessibility
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  // Note: For authenticated pages, we need to log in first.
  test('Dashboard - Visual & Axe', async ({ page }) => {
    // 1. Login
    await page.goto('/login');
    const randomSuffix = Math.floor(Math.random() * 1000000);
    
    await page.getByText('Criar uma conta').click();
    await page.getByLabel('Nome').fill('Visual User');
    await page.getByLabel('E-mail').fill(`visual_${randomSuffix}@test.com`);
    await page.getByLabel('Senha').fill('password123');
    await page.getByRole('button', { name: 'Criar conta' }).click();
    
    // Wait for Dashboard to load fully
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByText('Olá, Visual User')).toBeVisible();
    // Wait for metrics to load (or show skeleton)
    await page.waitForTimeout(1000); // Wait a bit for animations

    // Visual
    await expect(page).toHaveScreenshot('dashboard.png', { fullPage: true });

    // Accessibility
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Products Empty State - Visual', async ({ page }) => {
    // 1. Login
    await page.goto('/login');
    const randomSuffix = Math.floor(Math.random() * 1000000);
    
    await page.getByText('Criar uma conta').click();
    await page.getByLabel('Nome').fill('Visual User');
    await page.getByLabel('E-mail').fill(`visual_${randomSuffix}@test.com`);
    await page.getByLabel('Senha').fill('password123');
    await page.getByRole('button', { name: 'Criar conta' }).click();
    
    await expect(page).toHaveURL('/dashboard');
    
    // 2. Go to Products
    await page.goto('/products');
    await expect(page.getByText('Adicionar Produto')).toBeVisible();

    // Wait a bit to ensure empty state renders instead of skeleton
    await page.waitForTimeout(1000);

    // Visual
    await expect(page).toHaveScreenshot('products-empty.png', { fullPage: true });
  });
});

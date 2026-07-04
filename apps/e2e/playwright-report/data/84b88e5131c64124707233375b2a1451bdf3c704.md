# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: visual.spec.ts >> Visual Regression and Accessibility >> Login Page - Visual & Axe
- Location: tests\visual.spec.ts:5:7

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:5173/login
Call log:
  - navigating to "http://localhost:5173/login", waiting until "load"

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import AxeBuilder from '@axe-core/playwright';
  3  | 
  4  | test.describe('Visual Regression and Accessibility', () => {
  5  |   test('Login Page - Visual & Axe', async ({ page }) => {
> 6  |     await page.goto('/login');
     |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:5173/login
  7  |     // Wait for form to render
  8  |     await page.waitForSelector('form');
  9  | 
  10 |     // Visual
  11 |     await expect(page).toHaveScreenshot('login-page.png', { fullPage: true });
  12 | 
  13 |     // Accessibility
  14 |     const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
  15 |     expect(accessibilityScanResults.violations).toEqual([]);
  16 |   });
  17 | 
  18 |   // Note: For authenticated pages, we need to log in first.
  19 |   test('Dashboard - Visual & Axe', async ({ page }) => {
  20 |     // 1. Login
  21 |     await page.goto('/login');
  22 |     const randomSuffix = Math.floor(Math.random() * 1000000);
  23 |     
  24 |     await page.getByText('Criar uma conta').click();
  25 |     await page.getByLabel('Nome').fill('Visual User');
  26 |     await page.getByLabel('E-mail').fill(`visual_${randomSuffix}@test.com`);
  27 |     await page.getByLabel('Senha').fill('password123');
  28 |     await page.getByRole('button', { name: 'Criar conta' }).click();
  29 |     
  30 |     // Wait for Dashboard to load fully
  31 |     await expect(page).toHaveURL('/dashboard');
  32 |     await expect(page.getByText('Olá, Visual User')).toBeVisible();
  33 |     // Wait for metrics to load (or show skeleton)
  34 |     await page.waitForTimeout(1000); // Wait a bit for animations
  35 | 
  36 |     // Visual
  37 |     await expect(page).toHaveScreenshot('dashboard.png', { fullPage: true });
  38 | 
  39 |     // Accessibility
  40 |     const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
  41 |     expect(accessibilityScanResults.violations).toEqual([]);
  42 |   });
  43 | 
  44 |   test('Products Empty State - Visual', async ({ page }) => {
  45 |     // 1. Login
  46 |     await page.goto('/login');
  47 |     const randomSuffix = Math.floor(Math.random() * 1000000);
  48 |     
  49 |     await page.getByText('Criar uma conta').click();
  50 |     await page.getByLabel('Nome').fill('Visual User');
  51 |     await page.getByLabel('E-mail').fill(`visual_${randomSuffix}@test.com`);
  52 |     await page.getByLabel('Senha').fill('password123');
  53 |     await page.getByRole('button', { name: 'Criar conta' }).click();
  54 |     
  55 |     await expect(page).toHaveURL('/dashboard');
  56 |     
  57 |     // 2. Go to Products
  58 |     await page.goto('/products');
  59 |     await expect(page.getByText('Adicionar Produto')).toBeVisible();
  60 | 
  61 |     // Wait a bit to ensure empty state renders instead of skeleton
  62 |     await page.waitForTimeout(1000);
  63 | 
  64 |     // Visual
  65 |     await expect(page).toHaveScreenshot('products-empty.png', { fullPage: true });
  66 |   });
  67 | });
  68 | 
```
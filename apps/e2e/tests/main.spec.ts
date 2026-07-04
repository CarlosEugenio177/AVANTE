import { test, expect } from '@playwright/test';

test.describe('AVANTE Core Flow', () => {
  const randomSuffix = Math.floor(Math.random() * 1000000);
  const email = `testuser_${randomSuffix}@avante.com`;
  const password = 'password123';

  test('should register, login, and access dashboard', async ({ page }) => {
    // 1. Go to app
    await page.goto('/login');
    
    // 2. Click register toggle
    await page.getByText('Criar uma conta').click();
    
    // 3. Fill registration
    await page.getByLabel('Nome').fill('Test User');
    await page.getByLabel('E-mail').fill(email);
    await page.getByLabel('Senha').fill(password);
    
    // 4. Submit
    await page.getByRole('button', { name: 'Criar conta' }).click();
    
    // 5. Expect to be redirected to dashboard
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 });
    await expect(page.getByText('Olá, Test User')).toBeVisible();

    // 6. Go to Products
    await page.getByText('Produtos', { exact: true }).click();
    await expect(page).toHaveURL('/products');

    // 7. Click New Product
    await page.getByRole('button', { name: 'Novo Produto' }).click();

    // 8. Fill New Product Form (assuming a drawer/modal opens)
    // Wait for the modal
    await expect(page.getByText('Adicionar Novo Produto')).toBeVisible();
    await page.getByLabel('Nome do Produto').fill('Produto E2E');
    await page.getByLabel('Código/SKU').fill('SKU-123');
    await page.getByLabel('Fornecedor').fill('Fornecedor Teste');
    await page.getByLabel('Categoria').fill('Testes');
    await page.getByLabel('Preço de Custo (R$)').fill('50,00');
    
    await page.getByRole('button', { name: 'Salvar Produto' }).click();

    // 9. Verify product is listed
    await expect(page.getByText('Produto E2E')).toBeVisible();
    await expect(page.getByText('SKU-123')).toBeVisible();
  });
});

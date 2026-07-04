import { test, expect } from '@playwright/test';

test.describe('E2E UX Flows', () => {
  test('Cenário 1: Novo usuário cadastra produto e calcula em < 30s', async ({ page }) => {
    test.setTimeout(30000); // 30 seconds absolute max for this test
    const startTime = performance.now();

    // 1. Registro e Login
    await page.goto('/login');
    const randomSuffix = Math.floor(Math.random() * 1000000);
    await page.getByText('Criar uma conta').click();
    await page.getByLabel('Nome').fill('Flow User');
    await page.getByLabel('E-mail').fill(`flow_${randomSuffix}@test.com`);
    await page.getByLabel('Senha').fill('password123');
    await page.getByRole('button', { name: 'Criar conta' }).click();
    await expect(page).toHaveURL('/dashboard');

    // 2. Novo Produto
    await page.goto('/products');
    await page.getByText('Adicionar Produto').click();
    await page.getByLabel('Nome do Produto').fill('Produto Teste Rápido');
    await page.getByLabel('Custo de Aquisição').fill('50.00');
    await page.getByLabel('Imposto').fill('10');
    await page.getByRole('button', { name: 'Salvar Produto' }).click();
    await expect(page.getByText('Produto salvo com sucesso!')).toBeVisible();

    // 3. Calculadora
    await page.goto('/calculator');
    await page.getByLabel('Selecione um produto').click();
    await page.getByText('Produto Teste Rápido').click();
    await page.getByLabel('Margem Desejada').fill('20');
    
    // Assert it calculates
    await expect(page.getByText('Lucro Líquido Estimado')).toBeVisible();

    const endTime = performance.now();
    const duration = endTime - startTime;
    console.log(`Cenário 1 completado em ${Math.round(duration)}ms`);
    expect(duration).toBeLessThan(30000);
  });
});

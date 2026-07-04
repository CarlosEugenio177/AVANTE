# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: flow.spec.ts >> E2E UX Flows >> Cenário 1: Novo usuário cadastra produto e calcula em < 30s
- Location: tests\flow.spec.ts:4:7

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:5173/login
Call log:
  - navigating to "http://localhost:5173/login", waiting until "load"

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('E2E UX Flows', () => {
  4  |   test('Cenário 1: Novo usuário cadastra produto e calcula em < 30s', async ({ page }) => {
  5  |     test.setTimeout(30000); // 30 seconds absolute max for this test
  6  |     const startTime = performance.now();
  7  | 
  8  |     // 1. Registro e Login
> 9  |     await page.goto('/login');
     |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:5173/login
  10 |     const randomSuffix = Math.floor(Math.random() * 1000000);
  11 |     await page.getByText('Criar uma conta').click();
  12 |     await page.getByLabel('Nome').fill('Flow User');
  13 |     await page.getByLabel('E-mail').fill(`flow_${randomSuffix}@test.com`);
  14 |     await page.getByLabel('Senha').fill('password123');
  15 |     await page.getByRole('button', { name: 'Criar conta' }).click();
  16 |     await expect(page).toHaveURL('/dashboard');
  17 | 
  18 |     // 2. Novo Produto
  19 |     await page.goto('/products');
  20 |     await page.getByText('Adicionar Produto').click();
  21 |     await page.getByLabel('Nome do Produto').fill('Produto Teste Rápido');
  22 |     await page.getByLabel('Custo de Aquisição').fill('50.00');
  23 |     await page.getByLabel('Imposto').fill('10');
  24 |     await page.getByRole('button', { name: 'Salvar Produto' }).click();
  25 |     await expect(page.getByText('Produto salvo com sucesso!')).toBeVisible();
  26 | 
  27 |     // 3. Calculadora
  28 |     await page.goto('/calculator');
  29 |     await page.getByLabel('Selecione um produto').click();
  30 |     await page.getByText('Produto Teste Rápido').click();
  31 |     await page.getByLabel('Margem Desejada').fill('20');
  32 |     
  33 |     // Assert it calculates
  34 |     await expect(page.getByText('Lucro Líquido Estimado')).toBeVisible();
  35 | 
  36 |     const endTime = performance.now();
  37 |     const duration = endTime - startTime;
  38 |     console.log(`Cenário 1 completado em ${Math.round(duration)}ms`);
  39 |     expect(duration).toBeLessThan(30000);
  40 |   });
  41 | });
  42 | 
```
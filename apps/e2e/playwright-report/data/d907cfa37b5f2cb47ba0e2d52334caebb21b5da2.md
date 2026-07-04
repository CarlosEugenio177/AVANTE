# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: main.spec.ts >> AVANTE Core Flow >> should register, login, and access dashboard
- Location: tests\main.spec.ts:8:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByText('Criar uma conta')

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - region "Notifications alt+T"
  - generic [ref=e3]:
    - button "Alternar tema escuro" [ref=e5] [cursor=pointer]:
      - generic [ref=e6]: ☀️
    - generic [ref=e7]:
      - heading "AVANTE" [level=1] [ref=e8]
      - generic [ref=e9]:
        - generic [ref=e10]:
          - generic [ref=e11]: E-mail
          - textbox [ref=e12]
        - generic [ref=e13]:
          - generic [ref=e14]: Senha
          - textbox [ref=e15]
        - button "Entrar" [ref=e16] [cursor=pointer]
      - paragraph [ref=e17]:
        - text: Não tem uma conta?
        - link "Cadastre-se" [ref=e18] [cursor=pointer]:
          - /url: /register
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('AVANTE Core Flow', () => {
  4  |   const randomSuffix = Math.floor(Math.random() * 1000000);
  5  |   const email = `testuser_${randomSuffix}@avante.com`;
  6  |   const password = 'password123';
  7  | 
  8  |   test('should register, login, and access dashboard', async ({ page }) => {
  9  |     // 1. Go to app
  10 |     await page.goto('/login');
  11 |     
  12 |     // 2. Click register toggle
> 13 |     await page.getByText('Criar uma conta').click();
     |                                             ^ Error: locator.click: Test timeout of 30000ms exceeded.
  14 |     
  15 |     // 3. Fill registration
  16 |     await page.getByLabel('Nome').fill('Test User');
  17 |     await page.getByLabel('E-mail').fill(email);
  18 |     await page.getByLabel('Senha').fill(password);
  19 |     
  20 |     // 4. Submit
  21 |     await page.getByRole('button', { name: 'Criar conta' }).click();
  22 |     
  23 |     // 5. Expect to be redirected to dashboard
  24 |     await expect(page).toHaveURL('/dashboard', { timeout: 10000 });
  25 |     await expect(page.getByText('Olá, Test User')).toBeVisible();
  26 | 
  27 |     // 6. Go to Products
  28 |     await page.getByText('Produtos', { exact: true }).click();
  29 |     await expect(page).toHaveURL('/products');
  30 | 
  31 |     // 7. Click New Product
  32 |     await page.getByRole('button', { name: 'Novo Produto' }).click();
  33 | 
  34 |     // 8. Fill New Product Form (assuming a drawer/modal opens)
  35 |     // Wait for the modal
  36 |     await expect(page.getByText('Adicionar Novo Produto')).toBeVisible();
  37 |     await page.getByLabel('Nome do Produto').fill('Produto E2E');
  38 |     await page.getByLabel('Código/SKU').fill('SKU-123');
  39 |     await page.getByLabel('Fornecedor').fill('Fornecedor Teste');
  40 |     await page.getByLabel('Categoria').fill('Testes');
  41 |     await page.getByLabel('Preço de Custo (R$)').fill('50,00');
  42 |     
  43 |     await page.getByRole('button', { name: 'Salvar Produto' }).click();
  44 | 
  45 |     // 9. Verify product is listed
  46 |     await expect(page.getByText('Produto E2E')).toBeVisible();
  47 |     await expect(page.getByText('SKU-123')).toBeVisible();
  48 |   });
  49 | });
  50 | 
```
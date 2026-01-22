import { test, expect } from '@playwright/test';

const email = `demo-${Date.now()}@example.com`;
const password = 'password123';

test('login and add expenses', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Mot de passe').fill(password);
  await page.getByRole('button', { name: 'Continuer' }).click();

  await expect(page.getByText('Ajouter une dépense ponctuelle')).toBeVisible();

  await page.getByPlaceholder('Nom').fill('Café');
  await page.getByPlaceholder('Montant').fill('12');
  await page.getByRole('button', { name: 'Ajouter' }).click();

  await expect(page.getByText('Café')).toBeVisible();

  await page.request.post('/api/fx/refresh');

  await page.getByPlaceholder('Nom').fill('Transfert');
  await page.getByPlaceholder('Montant').fill('100');
  await page.getByDisplayValue('CAD').selectOption('MAD');
  await page.getByRole('button', { name: 'Ajouter' }).click();

  await expect(page.getByText('Transfert')).toBeVisible();
  await expect(page.getByText(/~\s*\$/)).toBeVisible();
});

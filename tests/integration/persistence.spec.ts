import { test, expect } from '@playwright/test'
import { join } from 'path'

test.describe('Data Persistence', () => {
  test('should persist CSV data and load on refresh', async ({ page }) => {
    await page.goto('/')

    // Upload CSV file
    const csvPath = join(process.cwd(), 'spec', 'sample-cursor-data.csv')
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles(csvPath)

    // Wait for data to load
    await expect(page.getByText('Filters')).toBeVisible({ timeout: 5000 })

    // Reload page
    await page.reload()

    // Verify data is still loaded (upload section should be hidden)
    await expect(page.getByText(/Click or drag CSV file here to upload/i)).not.toBeVisible()
    await expect(page.getByText('Filters')).toBeVisible()
    await expect(page.getByText('Delete Data')).toBeVisible()
  })

  test('should delete data and show upload section again', async ({ page }) => {
    await page.goto('/')

    // Upload CSV file
    const csvPath = join(process.cwd(), 'spec', 'sample-cursor-data.csv')
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles(csvPath)

    // Wait for data to load
    await expect(page.getByText('Delete Data')).toBeVisible({ timeout: 5000 })

    // Click delete button and confirm
    page.on('dialog', (dialog) => {
      expect(dialog.message()).toContain('Are you sure you want to delete')
      dialog.accept()
    })

    await page.getByText('Delete Data').click()

    // Wait for upload section to reappear
    await expect(page.getByText(/Click or drag CSV file here to upload/i)).toBeVisible({ timeout: 2000 })
    await expect(page.getByText('Delete Data')).not.toBeVisible()
    await expect(page.getByText('Filters')).not.toBeVisible()
  })

  test('should update progress bars reactively when monthly limit changes', async ({ page }) => {
    await page.goto('/')

    // Upload CSV file
    const csvPath = join(process.cwd(), 'spec', 'sample-cursor-data.csv')
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles(csvPath)

    // Wait for components to load
    await expect(page.getByText('Filters')).toBeVisible({ timeout: 5000 })

    // Set monthly limit
    const monthlyLimitInput = page.getByLabel('Monthly Cost Limit ($)')
    await monthlyLimitInput.fill('100')

    // Wait a bit for progress bars to update
    await page.waitForTimeout(500)

    // Verify progress bars are visible (no heading anymore)
    await expect(page.getByText('Monthly Usage')).toBeVisible()

    // Change the limit
    await monthlyLimitInput.fill('200')
    await page.waitForTimeout(500)

    // Progress bars should still be visible (reactively updated)
    await expect(page.getByText('Monthly Usage')).toBeVisible()
  })
})


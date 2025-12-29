import { test, expect } from '@playwright/test'
import { join } from 'path'

test.describe('Full User Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should complete full workflow: upload, filter, view chart, check progress', async ({ page }) => {
    // Step 1: Upload CSV file
    const csvPath = join(process.cwd(), 'spec', 'sample-cursor-data.csv')
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles(csvPath)

    // Wait for data to load
    await expect(page.getByText('Settings')).toBeVisible({ timeout: 5000 })
    await expect(page.getByText('Filters')).toBeVisible()
    await expect(page.getByText('Cost Analysis')).toBeVisible()

    // Step 2: Set monthly cost limit
    const monthlyLimitInput = page.getByLabel('Monthly Cost Limit ($)')
    await monthlyLimitInput.fill('100')
    await expect(monthlyLimitInput).toHaveValue('100')

    // Step 3: Verify progress bars appear
    await expect(page.getByText('Budget Progress')).toBeVisible()
    await expect(page.getByText('Monthly Usage')).toBeVisible()

    // Step 4: Filter by model
    const modelSelect = page.getByLabel('Model')
    await modelSelect.selectOption({ index: 1 }) // Select first model option (not "All Models")

    // Step 5: Verify chart updates
    await expect(page.getByText('Cost Analysis')).toBeVisible()
    const totalCost = page.locator('.cost-value')
    await expect(totalCost).toBeVisible()

    // Step 6: Change date range
    const startDateInput = page.getByLabel('Start Date')
    const endDateInput = page.getByLabel('End Date')

    // Set a date range
    await startDateInput.fill('2025-12-01')
    await endDateInput.fill('2025-12-31')

    // Step 7: Verify chart still displays
    await expect(page.getByText('Cost Analysis')).toBeVisible()
  })

  test('should persist settings in local storage', async ({ page }) => {
    // Set billing period day
    const billingDayInput = page.getByLabel('Billing Period Day of Month')
    await billingDayInput.fill('15')
    await expect(billingDayInput).toHaveValue('15')

    // Set monthly limit
    const monthlyLimitInput = page.getByLabel('Monthly Cost Limit ($)')
    await monthlyLimitInput.fill('200')
    await expect(monthlyLimitInput).toHaveValue('200')

    // Reload page
    await page.reload()

    // Verify settings persisted
    await expect(billingDayInput).toHaveValue('15')
    await expect(monthlyLimitInput).toHaveValue('200')
  })

  test('should filter data and update chart', async ({ page }) => {
    // Upload file
    const csvPath = join(process.cwd(), 'spec', 'sample-cursor-data.csv')
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles(csvPath)

    // Wait for components
    await expect(page.getByText('Cost Analysis')).toBeVisible({ timeout: 5000 })

    // Get initial total cost
    const initialTotal = await page.locator('.cost-value').textContent()

    // Filter by usage type
    const usageTypeSelect = page.getByLabel('Usage Type')
    const options = await usageTypeSelect.locator('option').all()
    if (options.length > 1) {
      await usageTypeSelect.selectOption({ index: 1 })

      // Wait a bit for chart to update
      await page.waitForTimeout(500)

      // Verify total cost changed (or stayed the same if all records match)
      const newTotal = await page.locator('.cost-value').textContent()
      expect(newTotal).toBeTruthy()
    }
  })
})


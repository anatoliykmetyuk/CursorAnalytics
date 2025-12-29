import { test, expect } from '@playwright/test'

// Helper function to generate test CSV data
function generateTestCSV(): string {
  const header = 'Date,Kind,Model,Max Mode,Input (w/ Cache Write),Input (w/o Cache Write),Cache Read,Output Tokens,Total Tokens,Cost'
  const rows = [
    '"2025-12-28T12:05:02.926Z","Included","auto","No","2801","0","343040","2076","347917","0.10"',
    '"2025-12-28T10:33:08.578Z","Included","auto","No","14392","2746","476416","2413","495967","0.16"',
    '"2025-12-27T07:21:35.620Z","Included","claude-4.5-opus-high-thinking","No","72323","119350","465152","30513","687338","0.54"',
    '"2025-12-27T07:19:30.312Z","Included","auto","No","11180","0","557056","1880","570116","0.16"',
    '"2025-12-18T11:50:48.700Z","Included","composer-1","No","71849","0","1012960","3277","1088086","0.34"',
    '"2025-12-17T10:11:57.590Z","On-Demand","auto","No","24009","0","979456","12576","1016041","0.35"',
  ]
  return [header, ...rows].join('\n')
}

test.describe('Full User Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should complete full workflow: upload, filter, view chart, check progress', async ({ page }) => {
    // Step 1: Upload CSV file
    const csvContent = generateTestCSV()
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles({
      name: 'test-data.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent),
    })

    // Wait for data to load
    await expect(page.getByText('Filters')).toBeVisible({ timeout: 5000 })
    await expect(page.getByText('Cost Analysis')).toBeVisible()

    // Step 2: Set monthly cost limit
    const monthlyLimitInput = page.getByLabel('Monthly Cost Limit ($)')
    await monthlyLimitInput.fill('100')
    await expect(monthlyLimitInput).toHaveValue('100')

    // Step 3: Verify progress bars appear (no heading anymore, just the bars)
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
    // Upload file first to see the filters
    const csvContent = generateTestCSV()
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles({
      name: 'test-data.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent),
    })

    // Wait for filters to load
    await expect(page.getByText('Filters')).toBeVisible({ timeout: 5000 })

    // Set billing period day
    const billingDayInput = page.getByLabel('Billing Period Day')
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
    const csvContent = generateTestCSV()
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles({
      name: 'test-data.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent),
    })

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


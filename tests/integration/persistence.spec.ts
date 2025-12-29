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

test.describe('Data Persistence', () => {
  test('should persist CSV data and load on refresh', async ({ page }) => {
    await page.goto('/')

    // Upload CSV file
    const csvContent = generateTestCSV()
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles({
      name: 'test-data.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent),
    })

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
    const csvContent = generateTestCSV()
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles({
      name: 'test-data.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent),
    })

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
    const csvContent = generateTestCSV()
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles({
      name: 'test-data.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent),
    })

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


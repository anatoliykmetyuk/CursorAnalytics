import { test, expect } from '@playwright/test'
import { readFileSync } from 'fs'
import { join } from 'path'

test.describe('File Upload', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should upload CSV file and parse data', async ({ page }) => {
    // Wait for the file upload component to be visible
    await expect(page.getByText(/Click or drag CSV file here to upload/i)).toBeVisible()

    // Get the sample CSV file path
    const csvPath = join(process.cwd(), 'spec', 'sample-cursor-data.csv')

    // Create a file input and upload the file
    const fileInput = page.locator('input[type="file"]')

    // Upload the file using the file path directly
    await fileInput.setInputFiles(csvPath)

    // Wait for file to be processed and components to appear
    await expect(page.getByText('Filters')).toBeVisible({ timeout: 5000 })
    await expect(page.getByText('Cost Analysis')).toBeVisible()

    // Verify file upload section is hidden
    await expect(page.getByText(/Click or drag CSV file here to upload/i)).not.toBeVisible()

    // Verify Delete Data button appears
    await expect(page.getByText('Delete Data')).toBeVisible()

    // Verify no error message is shown
    const errorMessage = page.locator('.error-message')
    await expect(errorMessage).not.toBeVisible()

    // Verify page scrolled to chart (check if chart is in viewport)
    const chart = page.locator('.chart-container')
    await expect(chart).toBeVisible()
  })

  test('should show error for non-CSV file', async ({ page }) => {
    await expect(page.getByText(/Click or drag CSV file here to upload/i)).toBeVisible()

    const fileInput = page.locator('input[type="file"]')

    // Try to upload a text file
    await fileInput.setInputFiles({
      name: 'test.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('not a csv file'),
    })

    await page.waitForTimeout(500)

    // Verify error message is shown
    await expect(page.getByText(/Please upload a CSV file/i)).toBeVisible()
  })

  test('should handle drag and drop', async ({ page }) => {
    const dropZone = page.locator('.drop-zone')
    await expect(dropZone).toBeVisible()

    const csvPath = join(process.cwd(), 'spec', 'sample-cursor-data.csv')

    // Use file input for drag and drop simulation
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles(csvPath)

    // Wait for components to appear
    await expect(page.getByText('Filters')).toBeVisible({ timeout: 5000 })

    // Verify no error message
    const errorMessage = page.locator('.error-message')
    await expect(errorMessage).not.toBeVisible()
  })
})


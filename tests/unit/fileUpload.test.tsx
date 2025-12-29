import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FileUpload } from '../../src/components/FileUpload'

// Mock the CSV parser
vi.mock('../../src/utils/csvParser', () => ({
  parseCSV: vi.fn(),
}))

import { parseCSV } from '../../src/utils/csvParser'

describe('FileUpload', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render file upload component', () => {
    const onFileParsed = vi.fn()
    render(<FileUpload onFileParsed={onFileParsed} />)

    expect(screen.getByText(/Click or drag CSV file here to upload/i)).toBeInTheDocument()
    expect(screen.getByText(/Download your usage data from Cursor Usage Dashboard/i)).toBeInTheDocument()
  })

  it('should have file input with correct attributes', () => {
    const onFileParsed = vi.fn()
    render(<FileUpload onFileParsed={onFileParsed} />)

    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    expect(input).toBeInTheDocument()
    expect(input?.accept).toBe('.csv')
    expect(input?.style.display).toBe('none')
  })

  it('should render drop zone with correct classes', () => {
    const onFileParsed = vi.fn()
    const { container } = render(<FileUpload onFileParsed={onFileParsed} />)

    const dropZone = container.querySelector('.drop-zone')
    expect(dropZone).toBeInTheDocument()
  })
})


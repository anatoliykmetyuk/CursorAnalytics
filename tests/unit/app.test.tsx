import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import App from '../../src/App'
import { CursorUsageRecord } from '../../src/types'

// Mock localStorage
vi.mock('../../src/utils/localStorage', async () => {
  const actual = await vi.importActual('../../src/utils/localStorage')
  return {
    ...actual,
    loadCSVData: vi.fn(() => null),
    saveCSVData: vi.fn(),
    deleteCSVData: vi.fn(),
    getMonthlyCostLimit: vi.fn(() => null),
  }
})

import { loadCSVData, saveCSVData, deleteCSVData } from '../../src/utils/localStorage'

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(loadCSVData).mockReturnValue(null)
  })

  it('should render file upload when no data', () => {
    render(<App />)
    expect(screen.getByText(/Click or drag CSV file here to upload/i)).toBeInTheDocument()
  })

  it('should load data from localStorage on mount', () => {
    const mockRecords: CursorUsageRecord[] = [
      {
        date: new Date('2025-12-20'),
        kind: 'Included',
        model: 'auto',
        maxMode: 'No',
        inputWithCacheWrite: 0,
        inputWithoutCacheWrite: 0,
        cacheRead: 0,
        outputTokens: 0,
        totalTokens: 0,
        cost: 1.0,
      },
    ]
    vi.mocked(loadCSVData).mockReturnValue(mockRecords)

    render(<App />)

    expect(loadCSVData).toHaveBeenCalled()
    expect(screen.getByText('Settings')).toBeInTheDocument()
    expect(screen.getByText('Delete Data')).toBeInTheDocument()
  })

  it('should hide file upload when data exists', () => {
    const mockRecords: CursorUsageRecord[] = [
      {
        date: new Date('2025-12-20'),
        kind: 'Included',
        model: 'auto',
        maxMode: 'No',
        inputWithCacheWrite: 0,
        inputWithoutCacheWrite: 0,
        cacheRead: 0,
        outputTokens: 0,
        totalTokens: 0,
        cost: 1.0,
      },
    ]
    vi.mocked(loadCSVData).mockReturnValue(mockRecords)

    render(<App />)

    expect(screen.queryByText(/Click or drag CSV file here to upload/i)).not.toBeInTheDocument()
  })

  it('should show delete data button when data exists', () => {
    const mockRecords: CursorUsageRecord[] = [
      {
        date: new Date('2025-12-20'),
        kind: 'Included',
        model: 'auto',
        maxMode: 'No',
        inputWithCacheWrite: 0,
        inputWithoutCacheWrite: 0,
        cacheRead: 0,
        outputTokens: 0,
        totalTokens: 0,
        cost: 1.0,
      },
    ]
    vi.mocked(loadCSVData).mockReturnValue(mockRecords)

    render(<App />)

    const deleteButton = screen.getByText('Delete Data')
    expect(deleteButton).toBeInTheDocument()
    expect(deleteButton).toHaveClass('delete-data-button')
  })

  it('should delete data when delete button is clicked and confirmed', async () => {
    const mockRecords: CursorUsageRecord[] = [
      {
        date: new Date('2025-12-20'),
        kind: 'Included',
        model: 'auto',
        maxMode: 'No',
        inputWithCacheWrite: 0,
        inputWithoutCacheWrite: 0,
        cacheRead: 0,
        outputTokens: 0,
        totalTokens: 0,
        cost: 1.0,
      },
    ]
    vi.mocked(loadCSVData).mockReturnValue(mockRecords)
    window.confirm = vi.fn(() => true)

    render(<App />)

    const deleteButton = screen.getByText('Delete Data')
    fireEvent.click(deleteButton)

    await waitFor(() => {
      expect(window.confirm).toHaveBeenCalledWith(
        'Are you sure you want to delete all uploaded data? This action cannot be undone.'
      )
      expect(deleteCSVData).toHaveBeenCalled()
    })
  })

  it('should not delete data when delete is cancelled', async () => {
    const mockRecords: CursorUsageRecord[] = [
      {
        date: new Date('2025-12-20'),
        kind: 'Included',
        model: 'auto',
        maxMode: 'No',
        inputWithCacheWrite: 0,
        inputWithoutCacheWrite: 0,
        cacheRead: 0,
        outputTokens: 0,
        totalTokens: 0,
        cost: 1.0,
      },
    ]
    vi.mocked(loadCSVData).mockReturnValue(mockRecords)
    window.confirm = vi.fn(() => false)

    render(<App />)

    const deleteButton = screen.getByText('Delete Data')
    fireEvent.click(deleteButton)

    await waitFor(() => {
      expect(window.confirm).toHaveBeenCalled()
      expect(deleteCSVData).not.toHaveBeenCalled()
    })
  })
})


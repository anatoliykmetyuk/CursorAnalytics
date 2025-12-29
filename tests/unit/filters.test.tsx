import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Filters } from '../../src/components/Filters'
import { CursorUsageRecord, Filters as FiltersType } from '../../src/types'

// Mock localStorage
vi.mock('../../src/utils/localStorage', () => ({
  getBillingPeriodDay: vi.fn(() => 1),
  setBillingPeriodDay: vi.fn(),
  getMonthlyCostLimit: vi.fn(() => null),
  setMonthlyCostLimit: vi.fn(),
}))

// Mock date calculations
vi.mock('../../src/utils/dateCalculations', () => ({
  getBillingPeriodStart: vi.fn(() => new Date('2025-12-01')),
  getMonthStart: vi.fn(() => new Date('2025-12-01')),
  formatDateForDisplay: vi.fn((date: Date) => {
    return date.toISOString().split('T')[0]
  }),
}))

const createRecord = (
  date: Date,
  model: string = 'auto',
  kind: string = 'Included'
): CursorUsageRecord => ({
  date,
  kind,
  model,
  maxMode: 'No',
  inputWithCacheWrite: 0,
  inputWithoutCacheWrite: 0,
  cacheRead: 0,
  outputTokens: 0,
  totalTokens: 0,
  cost: 1.0,
})

describe('Filters', () => {
  const mockRecords: CursorUsageRecord[] = [
    createRecord(new Date('2025-12-20'), 'auto', 'Included'),
    createRecord(new Date('2025-12-21'), 'claude-4.5', 'On-Demand'),
    createRecord(new Date('2025-12-22'), 'auto', 'Included'),
  ]

  const defaultFilters: FiltersType = {
    dateRange: {
      start: null,
      end: null,
    },
    model: null,
    usageType: null,
  }

  it('should render filters component', () => {
    const onFiltersChange = vi.fn()
    render(<Filters records={mockRecords} filters={defaultFilters} onFiltersChange={onFiltersChange} />)

    expect(screen.getByText('Filters')).toBeInTheDocument()
    expect(screen.getByLabelText('Start Date')).toBeInTheDocument()
    expect(screen.getByLabelText('End Date')).toBeInTheDocument()
    expect(screen.getByLabelText('Model')).toBeInTheDocument()
    expect(screen.getByLabelText('Usage Type')).toBeInTheDocument()
  })

  it('should populate model dropdown with unique models', () => {
    const onFiltersChange = vi.fn()
    render(<Filters records={mockRecords} filters={defaultFilters} onFiltersChange={onFiltersChange} />)

    const modelSelect = screen.getByLabelText('Model')
    expect(modelSelect).toBeInTheDocument()

    const options = Array.from(modelSelect.querySelectorAll('option')).map((opt) => opt.textContent)
    expect(options).toContain('All Models')
    expect(options).toContain('auto')
    expect(options).toContain('claude-4.5')
  })

  it('should populate usage type dropdown with unique types', () => {
    const onFiltersChange = vi.fn()
    render(<Filters records={mockRecords} filters={defaultFilters} onFiltersChange={onFiltersChange} />)

    const usageTypeSelect = screen.getByLabelText('Usage Type')
    const options = Array.from(usageTypeSelect.querySelectorAll('option')).map((opt) => opt.textContent)
    expect(options).toContain('All Types')
    expect(options).toContain('Included')
    expect(options).toContain('On-Demand')
  })

  it('should call onFiltersChange when date changes', async () => {
    const onFiltersChange = vi.fn()
    render(<Filters records={mockRecords} filters={defaultFilters} onFiltersChange={onFiltersChange} />)

    const startDateInput = screen.getByLabelText('Start Date')
    fireEvent.change(startDateInput, { target: { value: '2025-12-01' } })

    await waitFor(() => {
      expect(onFiltersChange).toHaveBeenCalled()
    })
  })

  it('should call onFiltersChange when model changes', async () => {
    const onFiltersChange = vi.fn()
    render(<Filters records={mockRecords} filters={defaultFilters} onFiltersChange={onFiltersChange} />)

    const modelSelect = screen.getByLabelText('Model')
    fireEvent.change(modelSelect, { target: { value: 'auto' } })

    await waitFor(() => {
      expect(onFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'auto',
        })
      )
    })
  })

  it('should call onFiltersChange when usage type changes', async () => {
    const onFiltersChange = vi.fn()
    render(<Filters records={mockRecords} filters={defaultFilters} onFiltersChange={onFiltersChange} />)

    const usageTypeSelect = screen.getByLabelText('Usage Type')
    fireEvent.change(usageTypeSelect, { target: { value: 'Included' } })

    await waitFor(() => {
      expect(onFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({
          usageType: 'Included',
        })
      )
    })
  })

  it('should render billing period day input', () => {
    const onFiltersChange = vi.fn()
    render(<Filters records={mockRecords} filters={defaultFilters} onFiltersChange={onFiltersChange} />)

    expect(screen.getByLabelText('Billing Period Day')).toBeInTheDocument()
  })

  it('should render monthly cost limit input', () => {
    const onFiltersChange = vi.fn()
    render(<Filters records={mockRecords} filters={defaultFilters} onFiltersChange={onFiltersChange} />)

    expect(screen.getByLabelText('Monthly Cost Limit ($)')).toBeInTheDocument()
  })
})


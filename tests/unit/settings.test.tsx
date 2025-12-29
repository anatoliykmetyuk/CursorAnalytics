import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Settings } from '../../src/components/Settings'

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
}

vi.mock('../../src/utils/localStorage', () => ({
  getBillingPeriodDay: vi.fn(() => 1),
  setBillingPeriodDay: vi.fn(),
  getMonthlyCostLimit: vi.fn(() => null),
  setMonthlyCostLimit: vi.fn(),
}))

import {
  getBillingPeriodDay,
  setBillingPeriodDay,
  getMonthlyCostLimit,
  setMonthlyCostLimit,
} from '../../src/utils/localStorage'

describe('Settings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getBillingPeriodDay).mockReturnValue(1)
    vi.mocked(getMonthlyCostLimit).mockReturnValue(null)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should render settings component', () => {
    render(<Settings />)

    expect(screen.getByText('Settings')).toBeInTheDocument()
    expect(screen.getByLabelText('Billing Period Day of Month')).toBeInTheDocument()
    expect(screen.getByLabelText('Monthly Cost Limit ($)')).toBeInTheDocument()
  })

  it('should load default billing period day', () => {
    vi.mocked(getBillingPeriodDay).mockReturnValue(15)
    render(<Settings />)

    const input = screen.getByLabelText('Billing Period Day of Month') as HTMLInputElement
    expect(input.value).toBe('15')
  })

  it('should load monthly cost limit if set', () => {
    vi.mocked(getMonthlyCostLimit).mockReturnValue(100)
    render(<Settings />)

    const input = screen.getByLabelText('Monthly Cost Limit ($)') as HTMLInputElement
    expect(input.value).toBe('100')
  })

  it('should update billing period day', async () => {
    render(<Settings />)

    const input = screen.getByLabelText('Billing Period Day of Month') as HTMLInputElement
    fireEvent.change(input, { target: { value: '15' } })

    await waitFor(() => {
      expect(setBillingPeriodDay).toHaveBeenCalledWith(15)
    })
  })

  it('should update monthly cost limit', async () => {
    render(<Settings />)

    const input = screen.getByLabelText('Monthly Cost Limit ($)') as HTMLInputElement
    fireEvent.change(input, { target: { value: '100' } })

    await waitFor(() => {
      expect(setMonthlyCostLimit).toHaveBeenCalledWith(100)
    })
  })

  it('should remove monthly cost limit when empty', async () => {
    vi.mocked(getMonthlyCostLimit).mockReturnValue(100)
    render(<Settings />)

    const input = screen.getByLabelText('Monthly Cost Limit ($)') as HTMLInputElement
    fireEvent.change(input, { target: { value: '' } })

    await waitFor(() => {
      expect(setMonthlyCostLimit).toHaveBeenCalledWith(null)
    })
  })
})


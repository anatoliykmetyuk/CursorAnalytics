import { useMemo } from 'react'
import { Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart } from 'recharts'
import { CursorUsageRecord } from '../types'
import { calculateTotalCost, calculateOnDemandCost, filterByDateRange, filterByModel, filterByUsageType, excludeErroredNoCharge } from '../utils/budgetCalculations'
import { formatDateForDisplay } from '../utils/dateCalculations'
import { Filters } from '../types'
import './Chart.css'

interface ChartProps {
  records: CursorUsageRecord[]
  filters: Filters
}

interface ChartDataPoint {
  date: string
  dailyCost: number
  cumulativeCost: number
}

export function Chart({ records, filters }: ChartProps) {
  const chartData = useMemo(() => {
    // Apply filters
    let filtered = records

    if (filters.dateRange.start || filters.dateRange.end) {
      filtered = filterByDateRange(filtered, filters.dateRange.start, filters.dateRange.end)
    }

    if (filters.model) {
      filtered = filterByModel(filtered, filters.model)
    }

    if (filters.usageType) {
      filtered = filterByUsageType(filtered, filters.usageType)
    }

    // Exclude "Errored, No Charge" and "Aborted, Not Charged" from chart data UNLESS explicitly selected in filters
    if (filters.usageType !== 'Errored, No Charge' && filters.usageType !== 'Aborted, Not Charged') {
      filtered = excludeErroredNoCharge(filtered)
    }

    // Group by date and calculate daily and cumulative costs
    const dateMap = new Map<string, number>()

    filtered.forEach((record) => {
      const dateKey = formatDateForDisplay(record.date)
      const current = dateMap.get(dateKey) || 0
      dateMap.set(dateKey, current + record.cost)
    })

    // Convert to array and sort by date
    const sortedDates = Array.from(dateMap.entries())
      .map(([date, cost]) => ({ date, cost }))
      .sort((a, b) => a.date.localeCompare(b.date))

    // Calculate cumulative costs
    let cumulative = 0
    const data: ChartDataPoint[] = sortedDates.map(({ date, cost }) => {
      cumulative += cost
      return {
        date,
        dailyCost: cost,
        cumulativeCost: cumulative,
      }
    })

    return data
  }, [records, filters])

  const totalCost = useMemo(() => {
    let filtered = records

    if (filters.dateRange.start || filters.dateRange.end) {
      filtered = filterByDateRange(filtered, filters.dateRange.start, filters.dateRange.end)
    }

    if (filters.model) {
      filtered = filterByModel(filtered, filters.model)
    }

    if (filters.usageType) {
      filtered = filterByUsageType(filtered, filters.usageType)
    }

    // Exclude "Errored, No Charge" and "Aborted, Not Charged" from total calculation UNLESS explicitly selected in filters
    if (filters.usageType !== 'Errored, No Charge' && filters.usageType !== 'Aborted, Not Charged') {
      filtered = excludeErroredNoCharge(filtered)
    }

    return calculateTotalCost(filtered)
  }, [records, filters])

  const onDemandCost = useMemo(() => {
    let filtered = records

    // Apply same filters as total cost (date range, model)
    if (filters.dateRange.start || filters.dateRange.end) {
      filtered = filterByDateRange(filtered, filters.dateRange.start, filters.dateRange.end)
    }

    if (filters.model) {
      filtered = filterByModel(filtered, filters.model)
    }

    // For On-Demand cost, we always filter to On-Demand usage type
    // regardless of the usageType filter (which might be set to something else)
    filtered = filterByUsageType(filtered, 'On-Demand')

    // Exclude "Errored, No Charge" and "Aborted, Not Charged" from On-Demand cost
    filtered = excludeErroredNoCharge(filtered)

    return calculateOnDemandCost(filtered)
  }, [records, filters])

  if (chartData.length === 0) {
    return (
      <div className="chart-container">
        <div className="chart-empty">
          <p>No data available for the selected filters</p>
        </div>
      </div>
    )
  }

  return (
    <div className="chart-container">
      <div className="chart-header">
        <h2>Cost Analysis</h2>
        <div className="cost-info">
          <div className="total-cost">
            Total Cost: <span className="cost-value">${totalCost.toFixed(2)}</span>
          </div>
          <div className="on-demand-cost">
            On-Demand Cost: <span className="cost-value">${onDemandCost.toFixed(2)}</span>
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
          <XAxis
            dataKey="date"
            stroke="#888"
            tick={{ fill: '#888' }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis
            yAxisId="left"
            stroke="#888"
            tick={{ fill: '#888' }}
            label={{ value: 'Daily Cost ($)', angle: -90, position: 'insideLeft', fill: '#888' }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke="#888"
            tick={{ fill: '#888' }}
            label={{ value: 'Cumulative Cost ($)', angle: 90, position: 'insideRight', fill: '#888' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#2a2a2a',
              border: '1px solid #444',
              borderRadius: '4px',
              color: '#fff',
            }}
            formatter={(value: number | string) => {
              const numValue = typeof value === 'number' ? value : parseFloat(String(value))
              return `$${numValue.toFixed(2)}`
            }}
            labelFormatter={(label: string) => `Date: ${label}`}
          />
          <Legend wrapperStyle={{ color: '#888' }} />
          <Bar
            yAxisId="left"
            dataKey="dailyCost"
            fill="#4a9eff"
            name="Daily Cost"
            radius={[4, 4, 0, 0]}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="cumulativeCost"
            stroke="#ff6b6b"
            strokeWidth={2}
            name="Cumulative Cost"
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}


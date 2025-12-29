import { useState, useEffect, useRef } from 'react'
import { FileUpload } from './components/FileUpload'
import { Filters } from './components/Filters'
import { Chart } from './components/Chart'
import { ProgressBars } from './components/ProgressBars'
import { CursorUsageRecord, Filters as FiltersType } from './types'
import { loadCSVData, saveCSVData, deleteCSVData, getMonthlyCostLimit } from './utils/localStorage'
import './App.css'

function App() {
  const [records, setRecords] = useState<CursorUsageRecord[]>([])
  const [filters, setFilters] = useState<FiltersType>({
    dateRange: {
      start: null,
      end: null,
    },
    model: null,
    usageType: null,
  })
  const [monthlyCostLimit, setMonthlyCostLimit] = useState<number | null>(null)
  const chartRef = useRef<HTMLDivElement>(null)

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = loadCSVData()
    if (savedData && savedData.length > 0) {
      setRecords(savedData)
    }
    const limit = getMonthlyCostLimit()
    setMonthlyCostLimit(limit)
  }, [])

  // Listen for storage changes to update monthly limit reactively
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'cursor-analytics-monthly-cost-limit') {
        const limit = getMonthlyCostLimit()
        setMonthlyCostLimit(limit)
      }
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const handleFileParsed = (parsedRecords: CursorUsageRecord[]) => {
    setRecords(parsedRecords)
    saveCSVData(parsedRecords)
    // Reset filters when new file is loaded
    setFilters({
      dateRange: {
        start: null,
        end: null,
      },
      model: null,
      usageType: null,
    })
    // Auto-scroll to chart after a brief delay to ensure it's rendered
    setTimeout(() => {
      chartRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  const handleDeleteData = () => {
    if (window.confirm('Are you sure you want to delete all uploaded data? This action cannot be undone.')) {
      deleteCSVData()
      setRecords([])
      setFilters({
        dateRange: {
          start: null,
          end: null,
        },
        model: null,
        usageType: null,
      })
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Cursor Analytics</h1>
        <p className="app-subtitle">Review your Cursor usage and track your budget</p>
      </header>

      <main className="app-main">
        {records.length === 0 && (
          <>
            <FileUpload onFileParsed={handleFileParsed} />
            <div className="app-empty">
              <p>Upload a CSV file to get started</p>
              <p className="hint">
                Download your usage data from{' '}
                <a
                  href="https://cursor.com/dashboard?tab=usage"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Cursor Usage Dashboard
                </a>
              </p>
            </div>
          </>
        )}

        {records.length > 0 && (
          <>
            <ProgressBars records={records} monthlyCostLimit={monthlyCostLimit} />
            <Filters
              records={records}
              filters={filters}
              onFiltersChange={setFilters}
              onMonthlyLimitChange={setMonthlyCostLimit}
            />
            <div ref={chartRef}>
              <Chart records={records} filters={filters} />
            </div>
            <button className="delete-data-button" onClick={handleDeleteData}>
              Delete Data
            </button>
          </>
        )}
      </main>
    </div>
  )
}

export default App


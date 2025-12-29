import { useState } from 'react'
import { FileUpload } from './components/FileUpload'
import { Filters } from './components/Filters'
import { Chart } from './components/Chart'
import { Settings } from './components/Settings'
import { ProgressBars } from './components/ProgressBars'
import { CursorUsageRecord, Filters as FiltersType } from './types'
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

  const handleFileParsed = (parsedRecords: CursorUsageRecord[]) => {
    setRecords(parsedRecords)
    // Reset filters when new file is loaded
    setFilters({
      dateRange: {
        start: null,
        end: null,
      },
      model: null,
      usageType: null,
    })
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Cursor Analytics</h1>
        <p className="app-subtitle">Review your Cursor usage and track your budget</p>
      </header>

      <main className="app-main">
        <FileUpload onFileParsed={handleFileParsed} />

        {records.length > 0 && (
          <>
            <Settings />
            <ProgressBars records={records} />
            <Filters records={records} filters={filters} onFiltersChange={setFilters} />
            <Chart records={records} filters={filters} />
          </>
        )}

        {records.length === 0 && (
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
        )}
      </main>
    </div>
  )
}

export default App


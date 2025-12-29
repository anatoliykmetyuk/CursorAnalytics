import { useRef, useState } from 'react'
import { parseCSV } from '../utils/csvParser'
import { CursorUsageRecord } from '../types'
import './FileUpload.css'

interface FileUploadProps {
  onFileParsed: (records: CursorUsageRecord[]) => void
}

export function FileUpload({ onFileParsed }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFile = (file: File) => {
    if (!file.name.endsWith('.csv')) {
      setError('Please upload a CSV file')
      return
    }

    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        if (!text) {
          setError('Failed to read file')
          return
        }

        const records = parseCSV(text)

        if (records.length === 0) {
          setError('CSV file contains no data')
          return
        }

        setError(null)
        onFileParsed(records)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to parse CSV file')
      }
    }

    reader.onerror = () => {
      setError('Failed to read file')
    }

    reader.readAsText(file)
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFile(file)
    }
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragging(false)

    const file = event.dataTransfer.files[0]
    if (file) {
      handleFile(file)
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="file-upload">
      <div
        className={`drop-zone ${isDragging ? 'dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        <div className="drop-zone-content">
          <p>Click or drag CSV file here to upload</p>
          <p className="hint">Download your usage data from Cursor Usage Dashboard</p>
        </div>
      </div>
      {error && <div className="error-message">{error}</div>}
    </div>
  )
}


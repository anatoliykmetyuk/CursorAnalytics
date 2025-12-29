import { describe, it, expect } from 'vitest'
import { parseCSV } from '../../src/utils/csvParser'

describe('CSV Parser', () => {
  const validCSV = `Date,Kind,Model,Max Mode,Input (w/ Cache Write),Input (w/o Cache Write),Cache Read,Output Tokens,Total Tokens,Cost
"2025-12-28T12:05:02.926Z","Included","claude-4.5-opus-high-thinking","No","46800","4647","275594","3562","330603","0.62"
"2025-12-28T10:34:54.404Z","Included","auto","No","2801","0","343040","2076","347917","0.10"`

  it('should parse valid CSV content', () => {
    const records = parseCSV(validCSV)

    expect(records).toHaveLength(2)
    expect(records[0].date).toBeInstanceOf(Date)
    expect(records[0].kind).toBe('Included')
    expect(records[0].model).toBe('claude-4.5-opus-high-thinking')
    expect(records[0].cost).toBe(0.62)
    expect(records[0].totalTokens).toBe(330603)
  })

  it('should parse dates correctly', () => {
    const records = parseCSV(validCSV)
    const date = records[0].date

    expect(date.getFullYear()).toBe(2025)
    expect(date.getMonth()).toBe(11) // December is month 11 (0-indexed)
    expect(date.getDate()).toBe(28)
  })

  it('should parse numbers correctly', () => {
    const records = parseCSV(validCSV)

    expect(records[0].inputWithCacheWrite).toBe(46800)
    expect(records[0].inputWithoutCacheWrite).toBe(4647)
    expect(records[0].cacheRead).toBe(275594)
    expect(records[0].outputTokens).toBe(3562)
    expect(records[0].totalTokens).toBe(330603)
    expect(records[0].cost).toBe(0.62)
  })

  it('should handle empty CSV', () => {
    expect(() => parseCSV('Date,Kind,Model,Max Mode,Input (w/ Cache Write),Input (w/o Cache Write),Cache Read,Output Tokens,Total Tokens,Cost\n')).toThrow()
  })

  it('should throw error for missing required columns', () => {
    const invalidCSV = `Date,Kind,Model
"2025-12-28T12:05:02.926Z","Included","claude-4.5-opus-high-thinking"`

    expect(() => parseCSV(invalidCSV)).toThrow('Missing required column')
  })

  it('should handle CSV with only header', () => {
    const headerOnly = `Date,Kind,Model,Max Mode,Input (w/ Cache Write),Input (w/o Cache Write),Cache Read,Output Tokens,Total Tokens,Cost`

    expect(() => parseCSV(headerOnly)).toThrow('CSV file must contain at least a header row and one data row')
  })

  it('should handle empty number fields', () => {
    const csvWithEmpty = `Date,Kind,Model,Max Mode,Input (w/ Cache Write),Input (w/o Cache Write),Cache Read,Output Tokens,Total Tokens,Cost
"2025-12-28T12:05:02.926Z","Included","auto","No","0","0","0","0","0","0.00"`

    const records = parseCSV(csvWithEmpty)
    expect(records[0].inputWithCacheWrite).toBe(0)
    expect(records[0].cost).toBe(0)
  })

  it('should handle quoted fields with commas', () => {
    const csvWithQuotes = `Date,Kind,Model,Max Mode,Input (w/ Cache Write),Input (w/o Cache Write),Cache Read,Output Tokens,Total Tokens,Cost
"2025-12-28T12:05:02.926Z","Errored, No Charge","auto","No","0","0","0","0","0","0.00"`

    const records = parseCSV(csvWithQuotes)
    expect(records[0].kind).toBe('Errored, No Charge')
  })

  it('should handle escaped quotes in fields', () => {
    const csvWithEscapedQuotes = `Date,Kind,Model,Max Mode,Input (w/ Cache Write),Input (w/o Cache Write),Cache Read,Output Tokens,Total Tokens,Cost
"2025-12-28T12:05:02.926Z","Test ""quoted"" value","auto","No","0","0","0","0","0","0.00"`

    const records = parseCSV(csvWithEscapedQuotes)
    expect(records[0].kind).toBe('Test "quoted" value')
  })

  it('should skip empty lines', () => {
    const csvWithEmptyLines = `Date,Kind,Model,Max Mode,Input (w/ Cache Write),Input (w/o Cache Write),Cache Read,Output Tokens,Total Tokens,Cost

"2025-12-28T12:05:02.926Z","Included","auto","No","0","0","0","0","0","0.00"

`

    const records = parseCSV(csvWithEmptyLines)
    expect(records).toHaveLength(1)
  })

  it('should handle various date formats', () => {
    const csvWithDates = `Date,Kind,Model,Max Mode,Input (w/ Cache Write),Input (w/o Cache Write),Cache Read,Output Tokens,Total Tokens,Cost
"2025-12-28T12:05:02.926Z","Included","auto","No","0","0","0","0","0","0.00"
"2025-01-01T00:00:00.000Z","Included","auto","No","0","0","0","0","0","0.00"`

    const records = parseCSV(csvWithDates)
    expect(records[0].date.getTime()).toBeGreaterThan(0)
    expect(records[1].date.getTime()).toBeGreaterThan(0)
  })

  it('should throw error for invalid date', () => {
    const csvWithInvalidDate = `Date,Kind,Model,Max Mode,Input (w/ Cache Write),Input (w/o Cache Write),Cache Read,Output Tokens,Total Tokens,Cost
"invalid-date","Included","auto","No","0","0","0","0","0","0.00"`

    expect(() => parseCSV(csvWithInvalidDate)).toThrow('Invalid date format')
  })
})


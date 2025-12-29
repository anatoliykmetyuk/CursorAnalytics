# User Stories

This document describes the user stories implemented in the Cursor Analytics application.

## User Story 1: CSV File Upload

**As a user**, I want to upload my Cursor usage data from a CSV file so that I can analyze my usage patterns.

**Acceptance Criteria:**
- User can click a button or drag-and-drop a CSV file to upload
- The application validates that the file is a CSV file
- The application parses the CSV file and extracts usage data
- Error messages are displayed if the file format is invalid
- A link is provided to the Cursor Usage Dashboard where users can download their data

**Implementation:**
- `FileUpload` component handles file selection and drag-and-drop
- CSV parser validates and parses the file format
- Error handling for invalid files and parsing errors

## User Story 2: Cost Visualization Chart

**As a user**, I want to see a chart showing my daily costs and cumulative costs so that I can understand my spending patterns over time.

**Acceptance Criteria:**
- Chart displays daily costs as bars
- Chart displays cumulative costs as a line
- Total cost for selected filters is displayed
- Chart updates reactively when filters change

**Implementation:**
- `Chart` component uses Recharts library
- Composed chart with bars for daily costs and line for cumulative costs
- Total cost calculation based on filtered data

## User Story 3: Filterable Data Views

**As a user**, I want to filter my usage data by date range, model, and usage type so that I can analyze specific subsets of my data.

**Acceptance Criteria:**
- Date range filter with default values:
  - If billing period day is set: from start of current billing period to today
  - If billing period day is not set: from start of current month to today
- Model filter with dropdown showing all available models
- Usage type filter with dropdown showing all available usage types
- Filters update the chart and total cost reactively

**Implementation:**
- `Filters` component with date range picker and dropdowns
- Default date range calculation based on billing period settings
- Reactive filtering that updates chart and totals

## User Story 4: Billing Period Configuration

**As a user**, I want to set my billing period day of month so that the application can correctly calculate my billing periods.

**Acceptance Criteria:**
- User can enter a billing period day (1-31)
- Default value is 1
- Value is persisted in browser local storage
- Changing the value does not update existing filter values

**Implementation:**
- `Settings` component with billing period day input
- Local storage persistence via `localStorage` utilities
- Default value of 1

## User Story 5: Monthly Cost Limit

**As a user**, I want to set a monthly cost limit so that I can track my spending against a budget.

**Acceptance Criteria:**
- User can enter a monthly cost limit
- Setting to empty string removes the limit
- Value is persisted in browser local storage

**Implementation:**
- `Settings` component with monthly cost limit input
- Local storage persistence
- Empty string removes the limit

## User Story 6: Budget Progress Bars

**As a user**, I want to see progress bars showing my usage against budget limits so that I can track my spending throughout the billing period.

**Acceptance Criteria:**
- Progress bars are only shown when monthly cost limit is set
- Progress bars are not affected by selected filters (always use unfiltered data for current billing period)
- Three progress bars are displayed:
  - Monthly usage: current billing period usage vs monthly limit
  - Work week usage: current work week usage vs weekly limit
  - Work day usage: current work day usage vs daily limit
- Progress bars are annotated with actual costs and limits
- Weekly limit = (monthly limit - current billing period usage) / weeks left in billing period
- Daily limit = (weekly limit - current work week usage) / work days left in work week
- Work week = Monday to Friday
- Work day = Monday to Friday

**Implementation:**
- `ProgressBars` component calculates and displays progress
- Budget calculations use unfiltered data for current billing period
- Work week and work day calculations based on Monday-Friday schedule


# Data & Calculations Model

This document describes the data model and calculation logic used in the Cursor Analytics application.

## Data Model

### CursorUsageRecord

Represents a single usage record from the CSV file:

```typescript
interface CursorUsageRecord {
  date: Date                    // Timestamp of the usage
  kind: string                  // Usage type (Included, On-Demand, etc.)
  model: string                 // Model name (auto, claude-4.5-opus-high-thinking, etc.)
  maxMode: string              // Max mode setting (Yes/No)
  inputWithCacheWrite: number  // Input tokens with cache write
  inputWithoutCacheWrite: number // Input tokens without cache write
  cacheRead: number            // Cache read tokens
  outputTokens: number         // Output tokens
  totalTokens: number          // Total tokens
  cost: number                 // Cost in dollars
}
```

### Filters

Represents the current filter state:

```typescript
interface Filters {
  dateRange: {
    start: Date | null
    end: Date | null
  }
  model: string | null
  usageType: string | null
}
```

### Settings

Represents user settings stored in local storage:

```typescript
interface Settings {
  billingPeriodDay: number      // Day of month (1-31)
  monthlyCostLimit: number | null // Monthly spending limit in dollars
}
```

## CSV File Format

The CSV file is expected to have the following columns:
- Date (ISO 8601 format: `YYYY-MM-DDTHH:mm:ss.SSSZ`)
- Kind (usage type)
- Model
- Max Mode
- Input (w/ Cache Write)
- Input (w/o Cache Write)
- Cache Read
- Output Tokens
- Total Tokens
- Cost

## Date Calculations

### Billing Period

The billing period is calculated based on the billing period day of month:

- **Billing Period Start**: The most recent occurrence of the billing day that is on or before today
  - Example: If billing day is 15 and today is Dec 20, billing period starts Nov 15
  - Example: If billing day is 15 and today is Dec 10, billing period starts Nov 15
  - If billing day is not set, defaults to the 1st of the current month

- **Billing Period End**: One day before the next billing period starts

### Work Week

- **Work Week**: Monday through Friday
- **Work Week Start**: The Monday of the week containing the reference date
- **Work Week End**: The Friday of the week containing the reference date
- **Current Work Week**: The work week containing today

### Work Day

- **Work Day**: Monday through Friday (excludes weekends)
- **Current Work Day**: Today if it's a work day, otherwise the most recent work day

### Weeks Remaining in Billing Period

Calculated as the number of complete work weeks (Monday-Friday) remaining from the current week start to the billing period end.

### Work Days Remaining in Week

Calculated as the number of work days remaining from the current work day to the end of the current work week (Friday), inclusive.

## Budget Calculations

### Monthly Usage

Total cost of all records within the current billing period (unfiltered data).

### Weekly Limit

```
weeklyLimit = (monthlyLimit - currentBillingPeriodUsage) / weeksRemainingInBillingPeriod
```

If no weeks remaining, weekly limit is 0.

### Daily Limit

```
dailyLimit = (weeklyLimit - currentWorkWeekUsage) / workDaysRemainingInWeek
```

If no work days remaining, daily limit is 0.

### Progress Bar Percentages

- **Monthly**: `(monthlyUsage / monthlyLimit) * 100`
- **Weekly**: `(weeklyUsage / weeklyLimit) * 100`
- **Daily**: `(dailyUsage / dailyLimit) * 100`

All percentages are capped at 100%.

## Filtering Logic

### Date Range Filtering

Records are included if their date is:
- On or after the start date (if specified)
- On or before the end date (if specified)

Dates are compared at the day level (time is ignored).

### Model Filtering

Records are included if their model matches the selected model (exact match).

### Usage Type Filtering

Records are included if their kind (usage type) matches the selected usage type (exact match).

### Combined Filtering

All filters are applied in sequence:
1. Date range filter
2. Model filter
3. Usage type filter

Only records that pass all active filters are included in the results.

## Chart Data Transformation

### Daily Costs

Records are grouped by date (day level) and the sum of costs for each day is calculated.

### Cumulative Costs

Cumulative costs are calculated by summing daily costs in chronological order:
- Day 1: cumulative = day 1 cost
- Day 2: cumulative = day 1 cost + day 2 cost
- Day 3: cumulative = day 1 cost + day 2 cost + day 3 cost
- etc.

## Local Storage

### Keys

- `cursor-analytics-billing-period-day`: Billing period day of month (1-31)
- `cursor-analytics-monthly-cost-limit`: Monthly cost limit in dollars (number or empty string)

### Default Values

- Billing period day: 1
- Monthly cost limit: null (not set)

## Edge Cases

### No Data

- If no records are loaded, filters and chart are not displayed
- If filters result in no matching records, chart shows "No data available" message

### Invalid Dates

- Invalid dates in CSV are rejected during parsing
- Date calculations handle month boundaries and leap years

### Invalid Billing Day

- Billing day values outside 1-31 are clamped to valid range
- If billing day doesn't exist in a month (e.g., Feb 31), the last day of that month is used

### Weekend Handling

- Work week calculations always use Monday-Friday
- If today is a weekend, current work day is the most recent Friday

### Zero or Negative Limits

- Weekly and daily limits are never negative (minimum 0)
- Progress bars handle division by zero gracefully


## Pitch
A web application that allows users to review their Cursor usage, budget how much usage they still have left in the month, work week and work day.

## Format
Web application, charts, dark theme, responsive desktop-first, design similar to the one in the `spec/design-guide/` folder screenshots.

## Pages
Single page containing elements as per User Stories below, following a consistent, modern, visually-appealing design.

## Tech Stack
Vanilla React, Vite, deployed on Vercel, GitHub Actions to run tests & auto deploy to Vercel, Playwright for testing.

## User Stories
1. The user clicks a button "Cursor Usage Dashboard", is taken to the Cursor Usage Dashboard page (https://cursor.com/dashboard?tab=usage) where they download their usage statistics. Back on our website, the user uploads a CSV file downloaded from the Cursor Usage Dashboard with their Cursor usage data (example file available in `spec/sample-cursor-data.csv`).
2. The user sees a chart showing cost by day as bars and cumulative cost as a line, as well as the total cost for the selected filters.
3. The user is able to set the filters for the chart. Setting the filters will update the chart and the total cost reactively.
    - Date range
      - If the monthly _billing period day of month_ is available, the default value is from the start of the current billing period until today. The start of a billing period is the past closest day of month that equals to the billing period day of month.
      - If the monthly _billing period day of month_ is not available, the default value is from the start of the current month until today.
    - Model
    - Usage type (e.g. included, on-demand etc)
4. The user is able to enter their _billing period day of month_. The default value is 1. Entering a new value will not update existing filters values. This value is persisted in the browser's local storage.
5. The user is able to set the _monthly cost limit_. Setting it to an empty string will remove the limit. This value is persisted in the browser's local storage.
6. If the _monthly cost limit_ is set, the user sees progress bars, annotated with actual costs and limits. These progress bars are not affectde by selected filters and are always calculated for the current billing period total usage. The following progress bars are displayed:
    - Monthly usage: current billing period usage vs monthly limit
    - Work week usage: current work week's total usage vs (`monthly limit` - `current billing period usage`) / (`weeks left in the billing period`) = `weekly limit`.
    - Work day usage: current work day's total usage vs (`weekly limit` - `current work week's total usage`) / (`work days left in the work week`) = `daily limit`. There are 5 work days in a work week.

## Deliverables
- Code
- Tests - unit and integration tests.
- Documentation

### Deliverable Documentation
Under `docs/` folder, produce documentation for the following:
- User Stories
- Deployment guide
- Data & Calculations Model

## Implementation Guide for AI Agent
You will break down the application into a series of small steps, each implementing a single feature or improvement. You will implement the application iteratively. Each iteration will be structure as follows:

- Implement the feature in code
- Verify the feature works using browser tool
- Write thorough unit tests for the feature as well as integration tests
- Run the tests, fix any issues with written and existing tests

You will autonomously execute the steps above until the application is complete.

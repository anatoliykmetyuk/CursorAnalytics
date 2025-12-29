# Deployment Guide

This guide describes how to deploy the Cursor Analytics application to Vercel.

## Prerequisites

- Node.js 20 or higher
- npm or yarn package manager
- GitHub account
- Vercel account

## Local Development Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd CursorAnalytics
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Building for Production

1. Build the application:
```bash
npm run build
```

The built files will be in the `dist/` directory.

2. Preview the production build:
```bash
npm run preview
```

## Testing

### Unit Tests

Run unit tests:
```bash
npm test
```

Run unit tests in watch mode:
```bash
npm test -- --watch
```

Run unit tests with UI:
```bash
npm run test:ui
```

### Integration Tests

Run Playwright integration tests:
```bash
npm run test:e2e
```

Run Playwright tests with UI:
```bash
npm run test:e2e:ui
```

## Deployment to Vercel

### Automatic Deployment via GitHub Actions

The project includes a GitHub Actions workflow (`.github/workflows/ci.yml`) that automatically:
1. Runs tests on push and pull requests
2. Builds the application
3. Deploys to Vercel on push to main branch

**Setup Steps:**

1. Push your code to GitHub

2. Connect your GitHub repository to Vercel:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import your GitHub repository
   - Configure build settings:
     - Framework Preset: Vite
     - Build Command: `npm run build`
     - Output Directory: `dist`
     - Install Command: `npm install`

3. Add Vercel secrets to GitHub:
   - Go to your repository settings on GitHub
   - Navigate to Secrets and variables > Actions
   - Add the following secrets:
     - `VERCEL_TOKEN`: Your Vercel API token (from Vercel account settings)
     - `VERCEL_ORG_ID`: Your Vercel organization ID
     - `VERCEL_PROJECT_ID`: Your Vercel project ID

4. The workflow will automatically deploy on every push to main

### Manual Deployment

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel
```

4. For production deployment:
```bash
vercel --prod
```

## Environment Variables

No environment variables are required for this application. All configuration is stored in browser local storage.

## CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/ci.yml`) performs the following:

1. **Test Job:**
   - Sets up Node.js 20
   - Installs dependencies
   - Runs unit tests
   - Installs Playwright browsers
   - Runs integration tests
   - Builds the application

2. **Deploy Job:**
   - Only runs on push to main branch
   - Builds the application
   - Deploys to Vercel using the `amondnet/vercel-action` action

## Troubleshooting

### Build Failures

- Ensure Node.js version is 20 or higher
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check for TypeScript errors: `npm run build`

### Test Failures

- Ensure all dependencies are installed: `npm install`
- For Playwright tests, ensure browsers are installed: `npx playwright install --with-deps`

### Deployment Issues

- Verify Vercel secrets are correctly set in GitHub
- Check Vercel project settings match the build configuration
- Review GitHub Actions logs for detailed error messages


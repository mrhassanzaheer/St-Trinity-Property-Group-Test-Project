# SauceDemo QA Automation Framework - Project SpeedLabs

## Overview

This is a high-performance QA automation framework for SauceDemo e-commerce platform, built with **Playwright** and **TypeScript**. The framework implements a "hybrid" approach that bypasses UI login for speed while maintaining robust test coverage.

## Key Features

- ⚡ **Programmatic Login**: Bypasses UI login using session injection (saves 2-5 seconds per test)
- 🎯 **Robust Selectors**: Uses data-test attributes and accessible roles (no brittle XPaths)
- 🏗️ **Page Object Model**: Clean, maintainable architecture
- 📱 **Mobile Testing**: Built-in mobile viewport support
- 🎨 **Visual Validation**: CSS property checks for UI state changes
- ⚡ **Performance Testing**: Automated performance threshold checks
- 🔄 **CI/CD Ready**: GitHub Actions workflow included

## Framework Choice: Playwright + TypeScript

**Why Playwright?**
- Fast parallel execution
- First-class state management (cookies, localStorage)
- Built-in network interception
- Cross-browser support (Chromium, Firefox, WebKit)
- Excellent TypeScript support
- Modern, actively maintained

## Project Structure

```
.
├── src/
│   ├── pages/              # Page Object Models
│   │   ├── BasePage.ts
│   │   ├── InventoryPage.ts
│   │   ├── CartPage.ts
│   │   ├── CheckoutPage.ts
│   │   └── CheckoutCompletePage.ts
│   ├── utils/              # Utilities and fixtures
│   │   ├── auth.ts         # Programmatic login logic
│   │   └── fixtures.ts     # Playwright fixtures
│   └── tests/              # Test suites
│       ├── checkout-flow.spec.ts
│       ├── visual-validation.spec.ts
│       ├── mobile-checkout.spec.ts
│       └── performance.spec.ts
├── .github/
│   └── workflows/
│       └── ci.yml          # CI/CD pipeline
├── playwright.config.ts    # Playwright configuration
├── package.json
├── tsconfig.json
└── README.md
```

## Installation

### Prerequisites

- Node.js 18+ (recommended: Node.js 20)
- npm or yarn

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/mrhassanzaheer/St-Trinity-Property-Group-Test-Project
   cd "Sauce Demo"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install Playwright browsers**
   ```bash
   npm run install:browsers
   ```

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Specific Test Suites
```bash
# Checkout flow tests
npm run test:checkout

# Visual validation tests
npm run test:visual

# Mobile tests
npm run test:mobile
```

### Run Tests in UI Mode (Interactive)
```bash
npm run test:ui
```

### Run Tests in Headed Mode (See Browser)
```bash
npm run test:headed
```

### Debug Tests
```bash
npm run test:debug
```

### View Test Report
```bash
npm run test:report
```

## Programmatic Login - How It Works

### The Problem
Traditional tests log in via UI for every test, adding 2-5 seconds per test. In a suite of 100+ tests, this wastes 3-8 minutes.

### The Solution
We bypass UI login by injecting authentication state (cookies + localStorage) directly into the browser context.

### Implementation Details

1. **Authentication State Extraction** (`src/utils/auth.ts`)
   - Creates a temporary browser context
   - Performs login once via headless browser
   - Extracts cookies and localStorage
   - Returns authentication state object

2. **State Injection** (`src/utils/fixtures.ts`)
   - Custom Playwright fixture (`authenticatedPage`)
   - Automatically injects auth state before each test
   - Tests start directly on authenticated pages

3. **Usage in Tests**
   ```typescript
   test('my test', async ({ authenticatedPage }) => {
     // User is already logged in!
     await authenticatedPage.goto('/inventory.html');
     // No login screen - straight to inventory
   });
   ```

### Reverse Engineering Session Storage

To understand how SauceDemo stores authentication:

1. **Open DevTools** in browser
2. **Navigate to Application tab**
3. **Login via UI** and observe:
   - **Cookies**: Check `Application > Cookies` for session cookies
   - **LocalStorage**: Check `Application > Local Storage` for auth tokens
   - **SessionStorage**: Check `Application > Session Storage` for session data

4. **Inspect Network Tab**:
   - Look for authentication API calls
   - Check response headers for Set-Cookie directives
   - Note any tokens or session IDs

5. **Our Implementation**:
   - Extracts ALL cookies from authenticated context
   - Captures localStorage and sessionStorage
   - Injects all of them into test contexts
   - Ensures complete session replication

### Key Files

- `src/utils/auth.ts` - Core authentication logic
- `src/utils/fixtures.ts` - Playwright fixtures for easy test usage

## Test Suites

### 1. Checkout Flow (`checkout-flow.spec.ts`)
- Complete end-to-end checkout process
- Uses programmatic login
- Verifies order completion

### 2. Visual Validation (`visual-validation.spec.ts`)
- Button state changes (text and color)
- CSS property assertions
- UI interaction verification

### 3. Mobile Checkout (`mobile-checkout.spec.ts`)
- Checkout flow on mobile viewport (iPhone 12/13)
- Touch target size verification
- Responsive UI checks

### 4. Performance Tests (`performance.spec.ts`)
- Page load time assertions (< 2.0 seconds)
- Performance metrics collection
- Interactive time verification

## Selector Strategy

We use **robust selectors** to avoid brittle tests:

✅ **Preferred:**
- `data-test` attributes: `[data-test="username"]`
- Accessible roles: `role="button"`
- Semantic HTML: `button`, `input[type="text"]`
- Text content: `.filter({ hasText: 'Product Name' })`

❌ **Avoided:**
- XPath selectors (brittle)
- Auto-generated IDs (unreliable)
- CSS selectors based on structure (fragile)
- Index-based selectors (`:nth-child(1)`)

## CI/CD Integration

### GitHub Actions

The framework includes a GitHub Actions workflow (`.github/workflows/ci.yml`) that:

1. Runs tests on push/PR to main/develop branches
2. Tests across multiple browsers (Chromium, Firefox, WebKit)
3. Uploads test reports as artifacts
4. Captures videos and screenshots on failure
5. Generates HTML test reports

### Running CI Locally

```bash
# Simulate CI environment
CI=true npm test
```

### Artifacts

After CI runs, download:
- **Test Reports**: HTML reports with detailed results
- **Videos**: Test execution videos (on failure)
- **Screenshots**: Failure screenshots

## Performance Metrics

The framework includes performance testing that:
- Measures page load time
- Verifies interactive time < 2.0 seconds
- Collects Performance API metrics
- Fails tests if thresholds are exceeded

## The "Hybrid" Approach

### What We Gain
- ⚡ **Speed**: 2-5 seconds saved per test
- 🔒 **Reliability**: Less flakiness from login UI
- 🎯 **Focus**: Tests focus on features, not infrastructure
- 📈 **Scalability**: Better parallel execution

### What We Lose (and How We Mitigate)
- **UI Login Coverage**: Mitigated by dedicated login test suite
- **Full E2E Authenticity**: Mitigated by smoke tests with UI login
- **Session Edge Cases**: Mitigated by separate session management tests

### Strategy
- **80%** of tests use programmatic login (feature tests)
- **20%** use UI login (critical paths, smoke tests)
- **Dedicated suite** for authentication testing

See `TEST_STRATEGY.md` for detailed explanation.

## Troubleshooting

### Tests Fail with "Element not found"
- Verify SauceDemo site is accessible
- Check if selectors match current UI
- Run in headed mode to see what's happening: `npm run test:headed`

### Authentication Not Working
- Verify credentials in `src/utils/auth.ts`
- Check if SauceDemo changed authentication mechanism
- Inspect browser DevTools to see actual session storage

### Performance Tests Failing
- Network conditions may affect load times
- Consider adjusting threshold in `performance.spec.ts`
- Run tests multiple times to account for variance

### CI/CD Issues
- Ensure Node.js version matches (20.x)
- Check browser installation in CI logs
- Verify GitHub Actions permissions

## Best Practices

1. **Use Page Objects**: All page interactions go through page objects
2. **Robust Selectors**: Always prefer data-test attributes
3. **Wait Strategies**: Use Playwright's auto-waiting, avoid hard waits
4. **Test Isolation**: Each test should be independent
5. **Clear Assertions**: Use descriptive expect statements
6. **Error Handling**: Let Playwright handle retries, don't catch errors unnecessarily

## Contributing

When adding new tests:

1. Follow Page Object Model pattern
2. Use `authenticatedPage` fixture for authenticated tests
3. Add data-test attributes if modifying SauceDemo (if possible)
4. Update this README if adding new features

## License

MIT

## Author

Senior QA Automation Engineer - Project SpeedLabs Assessment

---

## Video Walkthrough Notes

For the mandatory video walkthrough, demonstrate:

1. **Test Execution**: Show tests running successfully
2. **Session Injection**: Explain how you reverse-engineered the session:
   - Open DevTools during login
   - Show cookies/localStorage extraction
   - Demonstrate injection into test context
   - Show test starting directly on inventory page (no login screen)
3. **Key Features**: Highlight programmatic login, robust selectors, performance checks
4. **CI/CD**: Show GitHub Actions workflow (if applicable)

**Key Talking Points:**
- "We bypass UI login by extracting cookies and localStorage from an authenticated session"
- "The `getAuthState()` function performs login once, then we inject that state into all test contexts"
- "This saves 2-5 seconds per test, which adds up significantly in a large suite"
- "We maintain coverage by having dedicated login tests, but most feature tests use programmatic login"
# St-Trinity-Property-Group-Test-Project

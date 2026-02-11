# Session Reverse Engineering Guide

## Overview

This document explains how we reverse-engineered SauceDemo's authentication mechanism to implement programmatic login. This is crucial for understanding how the session injection works.

## Step-by-Step Process

### Step 1: Manual Login Analysis

1. **Open SauceDemo in Browser**
   - Navigate to `https://www.saucedemo.com`
   - Open Chrome DevTools (F12 or Cmd+Option+I)

2. **Navigate to Application Tab**
   - Click "Application" tab in DevTools
   - This shows all storage mechanisms

3. **Clear Existing Data**
   - Right-click on Cookies → Clear
   - Right-click on Local Storage → Clear
   - Right-click on Session Storage → Clear
   - This ensures we see only what's created during login

### Step 2: Perform Login

1. **Enter Credentials**
   - Username: `standard_user`
   - Password: `secret_sauce`
   - Click "Login"

2. **Observe Network Activity**
   - Switch to "Network" tab
   - Look for POST request to login endpoint
   - Check response headers for `Set-Cookie` directives

### Step 3: Inspect Storage Mechanisms

#### Cookies Analysis

After login, check `Application > Cookies > https://www.saucedemo.com`:

**Typical Cookies Found:**
- `session-username` - Contains the username (e.g., "standard_user")
- Potentially other session cookies

**How to Extract:**
```javascript
// In browser console or Playwright
const cookies = await context.cookies();
// Returns array of cookie objects with name, value, domain, path, etc.
```

#### LocalStorage Analysis

Check `Application > Local Storage > https://www.saucedemo.com`:

**What to Look For:**
- Keys that might contain authentication tokens
- User session data
- Any keys set during login

**How to Extract:**
```javascript
// In browser console
Object.keys(localStorage).forEach(key => {
  console.log(key, localStorage.getItem(key));
});

// In Playwright
const localStorage = await page.evaluate(() => {
  const storage = {};
  for (let i = 0; i < window.localStorage.length; i++) {
    const key = window.localStorage.key(i);
    if (key) storage[key] = window.localStorage.getItem(key);
  }
  return storage;
});
```

#### SessionStorage Analysis

Check `Application > Session Storage > https://www.saucedemo.com`:

**What to Look For:**
- Session-specific data
- Temporary authentication state

**How to Extract:**
```javascript
// Similar to localStorage
const sessionStorage = await page.evaluate(() => {
  const storage = {};
  for (let i = 0; i < window.sessionStorage.length; i++) {
    const key = window.sessionStorage.key(i);
    if (key) storage[key] = window.sessionStorage.getItem(key);
  }
  return storage;
});
```

### Step 4: Verify What's Required

**Test Hypothesis:**
1. Create a new incognito/private window
2. Navigate to `https://www.saucedemo.com/inventory.html`
3. You should see login page (not authenticated)

**Inject Extracted State:**
1. Use browser extension or DevTools to manually set cookies
2. Set localStorage values
3. Set sessionStorage values
4. Refresh page
5. If you see inventory page → authentication works!

### Step 5: Implementation in Playwright

Our implementation (`src/utils/auth.ts`) does this automatically:

```typescript
// 1. Create temporary context
const tempContext = await browser.newContext();

// 2. Perform login
const page = await tempContext.newPage();
await page.goto('/');
await page.fill('[data-test="username"]', 'standard_user');
await page.fill('[data-test="password"]', 'secret_sauce');
await page.click('[data-test="login-button"]');
await page.waitForURL('**/inventory.html');

// 3. Extract all state
const cookies = await tempContext.cookies();
const localStorage = await page.evaluate(() => {
  // Extract localStorage
});
const sessionStorage = await page.evaluate(() => {
  // Extract sessionStorage
});

// 4. Inject into test context
await context.addCookies(cookies);
await page.evaluate((storage) => {
  Object.keys(storage).forEach(key => {
    window.localStorage.setItem(key, storage[key]);
  });
}, localStorage);
```

## SauceDemo-Specific Findings

Based on analysis of SauceDemo:

### Cookies
- **session-username**: Stores the logged-in username
- **Domain**: `.saucedemo.com` or `www.saucedemo.com`
- **Path**: `/`
- **HttpOnly**: May vary
- **Secure**: May vary (depends on HTTPS)

### Storage
- SauceDemo may use **sessionStorage** for temporary session state
- **localStorage** might be used for user preferences
- Both are captured to ensure complete session replication

### Key Insight
SauceDemo appears to use **cookie-based authentication** primarily, with the `session-username` cookie being the critical piece. However, we capture **all** storage mechanisms to ensure robustness.

## Verification Methods

### Method 1: Manual Browser Test
1. Login via UI
2. Extract cookies/storage
3. Open new incognito window
4. Inject cookies/storage via DevTools
5. Navigate to `/inventory.html`
6. Should see authenticated page

### Method 2: Playwright Test
```typescript
// This is what our tests do
test('verify auth injection', async ({ authenticatedPage }) => {
  // authenticatedPage already has injected auth state
  await authenticatedPage.goto('/inventory.html');
  // Should NOT see login page
  // Should see inventory page directly
});
```

### Method 3: Network Inspection
1. Login via UI
2. Check Network tab for authentication requests
3. Note any tokens in response
4. Verify if tokens are stored in cookies or storage

## Common Pitfalls

### ❌ Only Extracting Cookies
- **Problem**: Some apps use localStorage/sessionStorage
- **Solution**: Extract ALL storage mechanisms

### ❌ Not Waiting for Login Completion
- **Problem**: Extracting state before login completes
- **Solution**: Wait for navigation to authenticated page

### ❌ Domain Mismatch
- **Problem**: Cookies extracted from wrong domain
- **Solution**: Ensure cookies have correct domain attribute

### ❌ Expired Sessions
- **Problem**: Sessions expire quickly
- **Solution**: Extract state fresh for each test run (or cache with expiration)

## Debugging Tips

### If Authentication Fails:

1. **Check What Was Extracted**
   ```typescript
   console.log('Cookies:', cookies);
   console.log('LocalStorage:', localStorage);
   console.log('SessionStorage:', sessionStorage);
   ```

2. **Verify Injection**
   ```typescript
   // After injection, verify state
   const injectedCookies = await context.cookies();
   console.log('Injected cookies:', injectedCookies);
   ```

3. **Test Navigation**
   ```typescript
   // Try navigating to protected page
   await page.goto('/inventory.html');
   // Check if redirected to login
   const url = page.url();
   console.log('Current URL:', url);
   ```

4. **Compare States**
   - Extract state from manual login
   - Extract state from programmatic login
   - Compare differences

## Video Walkthrough Script

When recording the video walkthrough, demonstrate:

1. **Open SauceDemo in Browser**
   - Show the login page

2. **Open DevTools**
   - Show Application tab
   - Show empty cookies/storage

3. **Perform Login**
   - Enter credentials
   - Click login
   - Show navigation to inventory

4. **Inspect Storage**
   - Show cookies (especially `session-username`)
   - Show localStorage (if any)
   - Show sessionStorage (if any)
   - Explain what each contains

5. **Extract State**
   - Show how our code extracts this
   - Point to `getAuthState()` function

6. **Inject State**
   - Show how we inject into test context
   - Point to `injectAuthState()` function

7. **Demonstrate Test**
   - Run a test
   - Show it starts directly on inventory page
   - No login screen appears
   - Explain the time savings

## Conclusion

The key to programmatic login is:
1. **Understanding** how the app stores authentication
2. **Extracting** all relevant state (cookies + storage)
3. **Injecting** that state into test contexts
4. **Verifying** it works correctly

Our implementation handles all of this automatically, making it easy to use in tests while maintaining the performance benefits of bypassing UI login.

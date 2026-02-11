import { BrowserContext, Page, Browser } from '@playwright/test';

export interface AuthState {
  cookies: Array<{
    name: string;
    value: string;
    domain: string;
    path: string;
  }>;
  localStorage: Record<string, string>;
  sessionStorage: Record<string, string>;
}

export interface LoginCredentials {
  username: string;
  password: string;
}


export const STANDARD_USER: LoginCredentials = {
  username: 'standard_user',
  password: 'secret_sauce',
};


export async function getAuthState(
  context: BrowserContext,
  credentials: LoginCredentials = STANDARD_USER
): Promise<AuthState> {
  // Create a new page for login
  const page = await context.newPage();
  
  try {
    // Navigate to login page
    await page.goto('/');
    
    // Fill in login form using robust selectors
    // Using data-test attributes or accessible selectors
    await page.fill('input[data-test="username"]', credentials.username);
    await page.fill('input[data-test="password"]', credentials.password);
    
    // Click login button
    await page.click('input[data-test="login-button"]');
    
    // Wait for navigation to inventory page (confirms successful login)
    await page.waitForURL('**/inventory.html', { timeout: 10000 });
    
    // Extract cookies
    const cookies = await context.cookies();
    
    // Extract localStorage
    const localStorage = await page.evaluate(() => {
      // window is available in browser context (page.evaluate runs in browser)
      const storage: Record<string, string> = {};
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key) {
          storage[key] = window.localStorage.getItem(key) || '';
        }
      }
      return storage;
    });
    
    // Extract sessionStorage
    const sessionStorage = await page.evaluate(() => {
      // window is available in browser context (page.evaluate runs in browser)
      const storage: Record<string, string> = {};
      for (let i = 0; i < window.sessionStorage.length; i++) {
        const key = window.sessionStorage.key(i);
        if (key) {
          storage[key] = window.sessionStorage.getItem(key) || '';
        }
      }
      return storage;
    });
    
    return {
      cookies,
      localStorage,
      sessionStorage,
    };
  } finally {
    await page.close();
  }
}


export async function injectAuthState(
  context: BrowserContext,
  authState: AuthState
): Promise<void> {
  // Add cookies to context
  if (authState.cookies.length > 0) {
    await context.addCookies(authState.cookies);
  }
  
  // Create a temporary page to set storage
  const page = await context.newPage();
  try {
    // Navigate to base URL to set storage in correct domain
    await page.goto('/');
    
    // Inject localStorage
    if (Object.keys(authState.localStorage).length > 0) {
      await page.evaluate((storage) => {
        Object.keys(storage).forEach((key) => {
          window.localStorage.setItem(key, storage[key]);
        });
      }, authState.localStorage);
    }
    
    // Inject sessionStorage
    if (Object.keys(authState.sessionStorage).length > 0) {
      await page.evaluate((storage) => {
        Object.keys(storage).forEach((key) => {
          window.sessionStorage.setItem(key, storage[key]);
        });
      }, authState.sessionStorage);
    }
  } finally {
    await page.close();
  }
}

export async function createAuthenticatedContext(
  browser: Browser,
  credentials: LoginCredentials = STANDARD_USER
): Promise<BrowserContext> {
  // Create a temporary context for login
  const tempContext = await browser.newContext();
  
  try {
    // Get authentication state
    const authState = await getAuthState(tempContext, credentials);
    
    // Create new context for tests
    const authenticatedContext = await browser.newContext();
    
    // Inject authentication state
    await injectAuthState(authenticatedContext, authState);
    
    return authenticatedContext;
  } finally {
    await tempContext.close();
  }
}

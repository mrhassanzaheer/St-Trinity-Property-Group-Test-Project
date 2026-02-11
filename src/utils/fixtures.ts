import { test as base } from '@playwright/test';
import { BrowserContext, Page } from '@playwright/test';
import { getAuthState, injectAuthState, STANDARD_USER, LoginCredentials } from './auth';


type AuthFixtures = {
  authenticatedContext: BrowserContext;
  authenticatedPage: Page;
};

export const test = base.extend<AuthFixtures>({
  authenticatedContext: async ({ browser }, use) => {
    // Create a temporary context to perform login
    const tempContext = await browser.newContext();
    
    try {
      // Get authentication state
      const authState = await getAuthState(tempContext, STANDARD_USER);
      
      // Create authenticated context for test
      const authenticatedContext = await browser.newContext();
      
      // Inject authentication state
      await injectAuthState(authenticatedContext, authState);
      
      // Provide context to test
      await use(authenticatedContext);
      
      // Cleanup
      await authenticatedContext.close();
    } finally {
      await tempContext.close();
    }
  },
  
  authenticatedPage: async ({ authenticatedContext }, use) => {
    // Create a page from authenticated context
    const page = await authenticatedContext.newPage();
    
    // Provide page to test
    await use(page);
    
    // Cleanup
    await page.close();
  },
});

export { expect } from '@playwright/test';

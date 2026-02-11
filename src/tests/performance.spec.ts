import { test, expect } from '../utils/fixtures';
import { InventoryPage } from '../pages/InventoryPage';

test.describe('Performance Tests', () => {
  test('Inventory page should become interactive within 2.0 seconds', async ({ authenticatedPage }) => {
    const inventoryPage = new InventoryPage(authenticatedPage);
    const maxLoadTime = 2000; // 2.0 seconds in milliseconds

    // Measure time to interactive
    const startTime = Date.now();

    // Navigate to inventory page
    await inventoryPage.goto();

    // Wait for the main content to be visible and interactive
    const productContainer = authenticatedPage.locator('[data-test="inventory-container"]');
    await productContainer.waitFor({ state: 'visible', timeout: 2000 });

    // Wait for at least one product to be visible (ensures content is loaded)
    const firstProduct = authenticatedPage.locator('[data-test="inventory-item"]').first();
    await firstProduct.waitFor({ state: 'visible', timeout: 2000 });

    // Wait for an interactive element (Add to Cart button) to be ready
    const addToCartButton = authenticatedPage
      .locator('[data-test="inventory-item"]')
      .first()
      .locator('button')
      .first();
    await addToCartButton.waitFor({ state: 'visible', timeout: 2000 });

    // Verify button is actually interactive (not just visible)
    await expect(addToCartButton).toBeEnabled();

    const endTime = Date.now();
    const loadTime = endTime - startTime;

    // Assert that load time is within acceptable limit
    expect(loadTime).toBeLessThanOrEqual(maxLoadTime);

    // Log performance metrics (visible in test report)
    console.log(`Inventory page load time: ${loadTime}ms`);
    console.log(`Performance threshold: ${maxLoadTime}ms`);
    console.log(`Performance margin: ${maxLoadTime - loadTime}ms`);
  });

  test('Measure and log detailed performance metrics', async ({ authenticatedPage }) => {
    const inventoryPage = new InventoryPage(authenticatedPage);

    // Use Performance API to get detailed metrics
    await authenticatedPage.goto('/inventory.html');

    // Get performance timing from browser
    const performanceMetrics = await authenticatedPage.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const navStart = navigation.startTime;

      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.fetchStart,
        domInteractive: navigation.domInteractive - navStart,
        domContentLoadedEvent: navigation.domContentLoadedEventEnd - navStart,
        loadEvent: navigation.loadEventEnd - navStart,
        firstPaint: performance.getEntriesByType('paint').find((entry) => entry.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint: performance.getEntriesByType('paint').find((entry) => entry.name === 'first-contentful-paint')?.startTime || 0,
      };
    });

    // Log metrics
    console.log('Performance Metrics:', JSON.stringify(performanceMetrics, null, 2));

    // Verify DOM interactive time is under 2 seconds
    const domInteractiveTime = performanceMetrics.domInteractive;
    expect(domInteractiveTime).toBeLessThanOrEqual(2000);

    // Verify page is actually interactive
    const addToCartButton = await inventoryPage.getAddToCartButton('Sauce Labs Backpack');
    await expect(addToCartButton).toBeEnabled();
  });
});

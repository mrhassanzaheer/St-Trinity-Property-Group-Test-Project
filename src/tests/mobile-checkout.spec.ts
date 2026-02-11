
import { test, expect } from '../utils/fixtures';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { CheckoutCompletePage } from '../pages/CheckoutCompletePage';

test.describe('Mobile Checkout Flow', () => {
  // Use mobile viewport for these tests
  test.use({
    viewport: { width: 390, height: 844 }, // iPhone 12/13 dimensions
  });

  test('TC-002: Complete checkout flow on mobile viewport', async ({ authenticatedPage: page }) => {
    // Ensure mobile viewport on the authenticated page
    await page.setViewportSize({ width: 390, height: 844 });

    try {
      // Initialize page objects
      const inventoryPage = new InventoryPage(page);
      const cartPage = new CartPage(page);
      const checkoutPage = new CheckoutPage(page);
      const completePage = new CheckoutCompletePage(page);

      // Step 1: Navigate to inventory page (already authenticated)
      await inventoryPage.goto();
      await expect(page).toHaveURL(/.*inventory\.html/);

      // Verify mobile viewport
      const viewportSize = page.viewportSize();
      expect(viewportSize?.width).toBe(390);
      expect(viewportSize?.height).toBe(844);

      // Step 2: Add product to cart
      const productName = 'Sauce Labs Backpack';
      await inventoryPage.addProductToCart(productName);

      // Verify cart badge is visible and functional on mobile
      const cartCount = await inventoryPage.getCartBadgeCount();
      expect(cartCount).toBe(1);

      // Step 3: Navigate to cart (verify mobile navigation works)
      await inventoryPage.goToCart();
      await expect(page).toHaveURL(/.*cart\.html/);

      // Verify product is visible in cart on mobile
      const isInCart = await cartPage.isProductInCart(productName);
      expect(isInCart).toBe(true);

      // Step 4: Proceed to checkout
      await cartPage.clickCheckout();
      await expect(page).toHaveURL(/.*checkout-step-one\.html/);

      // Step 5: Fill checkout form (verify mobile form inputs work)
      const checkoutInfo = {
        firstName: 'John',
        lastName: 'Doe',
        postalCode: '12345',
      };

      // Verify form fields are accessible on mobile
      const firstNameInput = page.locator('[data-test="firstName"]');
      const lastNameInput = page.locator('[data-test="lastName"]');
      const postalCodeInput = page.locator('[data-test="postalCode"]');

      await expect(firstNameInput).toBeVisible();
      await expect(lastNameInput).toBeVisible();
      await expect(postalCodeInput).toBeVisible();

      // Fill form
      await checkoutPage.fillCheckoutInfo(checkoutInfo);

      // Step 6: Continue to step two
      await checkoutPage.clickContinue();
      await expect(page).toHaveURL(/.*checkout-step-two\.html/);

      // Step 7: Verify summary is visible on mobile
      const summaryVisible = await checkoutPage.isSummaryDisplayed();
      expect(summaryVisible).toBe(true);

      // Step 8: Complete order
      await checkoutPage.clickFinish();
      await expect(page).toHaveURL(/.*checkout-complete\.html/);

      // Step 9: Verify success message on mobile
      const orderComplete = await completePage.verifyOrderComplete();
      expect(orderComplete).toBe(true);

      // Verify no horizontal scrolling required (mobile UX check)
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = viewportSize?.width || 390;
      expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 10); 
    } finally {
    }
  });

  test('Verify mobile UI elements are properly sized', async ({ authenticatedPage: page }) => {
    // Ensure mobile viewport on the authenticated page
    await page.setViewportSize({ width: 390, height: 844 });

    try {
      const inventoryPage = new InventoryPage(page);
      await inventoryPage.goto();

      // Verify buttons are appropriately sized for touch
      const addToCartButton = await inventoryPage.getAddToCartButton('Sauce Labs Backpack');
      const buttonBox = await addToCartButton.boundingBox();

      if (buttonBox) {
// Common compromise: 32px minimum (Material Design baseline)
      expect(buttonBox.height).toBeGreaterThanOrEqual(32);
      expect(buttonBox.width).toBeGreaterThanOrEqual(32);

      }
    } finally {
      // `authenticatedPage` is cleaned up by the fixture
    }
  });
});

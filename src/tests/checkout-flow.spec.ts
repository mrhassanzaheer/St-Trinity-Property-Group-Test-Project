/**
 * Checkout Flow Test Suite
 * 
 * Tests the complete checkout flow from inventory to order completion.
 * Uses programmatic login (no UI login) for speed.
 */

import { test, expect } from '../utils/fixtures';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { CheckoutCompletePage } from '../pages/CheckoutCompletePage';

test.describe('Checkout Flow', () => {
  test('TC-001: Complete checkout flow with programmatic login', async ({ authenticatedPage }) => {
    // Initialize page objects
    const inventoryPage = new InventoryPage(authenticatedPage);
    const cartPage = new CartPage(authenticatedPage);
    const checkoutPage = new CheckoutPage(authenticatedPage);
    const completePage = new CheckoutCompletePage(authenticatedPage);

    // Step 1: Navigate to inventory page (already authenticated via fixture)
    await inventoryPage.goto();

    // Verify we're on inventory page (not login page)
    await expect(authenticatedPage).toHaveURL(/.*inventory\.html/);

    // Step 2: Add "Sauce Labs Backpack" to cart
    const productName = 'Sauce Labs Backpack';
    await inventoryPage.addProductToCart(productName);

    // Step 3: Verify cart badge updates
    const cartCount = await inventoryPage.getCartBadgeCount();
    expect(cartCount).toBe(1);

    // Step 4: Navigate to cart
    await inventoryPage.goToCart();
    await expect(authenticatedPage).toHaveURL(/.*cart\.html/);

    // Step 5: Verify product is in cart
    const isInCart = await cartPage.isProductInCart(productName);
    expect(isInCart).toBe(true);

    // Step 6: Proceed to checkout
    await cartPage.clickCheckout();
    await expect(authenticatedPage).toHaveURL(/.*checkout-step-one\.html/);

    // Step 7: Fill in checkout information
    const checkoutInfo = {
      firstName: 'John',
      lastName: 'Doe',
      postalCode: '12345',
    };
    await checkoutPage.fillCheckoutInfo(checkoutInfo);

    // Step 8: Continue to step two
    await checkoutPage.clickContinue();
    await expect(authenticatedPage).toHaveURL(/.*checkout-step-two\.html/);

    // Step 9: Verify order summary is displayed
    const summaryVisible = await checkoutPage.isSummaryDisplayed();
    expect(summaryVisible).toBe(true);

    // Step 10: Complete the order
    await checkoutPage.clickFinish();
    await expect(authenticatedPage).toHaveURL(/.*checkout-complete\.html/);

    // Step 11: Verify success message
    const orderComplete = await completePage.verifyOrderComplete();
    expect(orderComplete).toBe(true);

    // Additional assertion: Verify the exact message text
    const successMessage = await completePage.getSuccessMessage();
    expect(successMessage.toLowerCase()).toContain('thank you for your order!');
  });

  test('TC-002: Verify cart badge updates correctly', async ({ authenticatedPage }) => {
    const inventoryPage = new InventoryPage(authenticatedPage);
    
    await inventoryPage.goto();

    // Initially, cart should be empty
    let cartCount = await inventoryPage.getCartBadgeCount();
    expect(cartCount).toBe(0);

    // Add first product
    await inventoryPage.addProductToCart('Sauce Labs Backpack');
    cartCount = await inventoryPage.getCartBadgeCount();
    expect(cartCount).toBe(1);

    // Add second product
    await inventoryPage.addProductToCart('Sauce Labs Bike Light');
    cartCount = await inventoryPage.getCartBadgeCount();
    expect(cartCount).toBe(2);
  });
});

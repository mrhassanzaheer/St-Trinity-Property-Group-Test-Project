import { test, expect } from '../utils/fixtures';
import { InventoryPage } from '../pages/InventoryPage';

test.describe('Visual Validation', () => {
  test('TC-003: Verify Add to Cart button state change (text and color)', async ({ authenticatedPage }) => {
    const inventoryPage = new InventoryPage(authenticatedPage);
    const productName = 'Sauce Labs Backpack';

    // Navigate to inventory page
    await inventoryPage.goto();

    // Get the Add to Cart button
    const addToCartButton = await inventoryPage.getAddToCartButton(productName);

    // Verify initial state: Button text should be "Add to cart"
    const initialText = await inventoryPage.getButtonText(addToCartButton);
    expect(initialText.toLowerCase()).toContain('add to cart');

    // Get initial button color (before clicking)
    // Note: We'll inspect the actual CSS to get the exact color
    const initialColor = await inventoryPage.getButtonColor(addToCartButton);
    
    // Click the button to add to cart
    await addToCartButton.click();

    // Wait for button state to change
    const removeButton = await inventoryPage.getRemoveButton(productName);
    await removeButton.waitFor({ state: 'visible', timeout: 5000 });

    // Verify button text changed to "Remove"
    const updatedText = await inventoryPage.getButtonText(removeButton);
    expect(updatedText.toLowerCase()).toContain('remove');

    // Verify button color changed to the specific red used by the site
    // SauceDemo typically uses a red color for the Remove button
    // Let's get the computed color value
    const updatedColor = await inventoryPage.getButtonColor(removeButton);
    
    // The color should be different from the initial color
    expect(updatedColor).not.toBe(initialColor);
    
    const colorValue = await removeButton.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        color: styles.color,
        backgroundColor: styles.backgroundColor,
        // Also check if there's a specific class or data attribute
        className: el.className,
      };
    });

    // Log the color for debugging (will be visible in test report)
    console.log('Button color after click:', colorValue);

    // Assert that the color is red (RGB values indicate red)
    expect(colorValue.color).toMatch(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    
    // Extract RGB values
    const rgbMatch = colorValue.color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (rgbMatch) {
      const r = parseInt(rgbMatch[1], 10);
      const g = parseInt(rgbMatch[2], 10);
      const b = parseInt(rgbMatch[3], 10);
      
      expect(r).toBeGreaterThan(g);
      expect(r).toBeGreaterThan(b);
      expect(r).toBeGreaterThan(200); // Strong red component
    }
  });

  test('Verify button is clickable and functional', async ({ authenticatedPage }) => {
    const inventoryPage = new InventoryPage(authenticatedPage);
    const productName = 'Sauce Labs Backpack';

    await inventoryPage.goto();

    const addToCartButton = await inventoryPage.getAddToCartButton(productName);

    // Verify button is visible and enabled
    await expect(addToCartButton).toBeVisible();
    await expect(addToCartButton).toBeEnabled();

    // Verify button is clickable
    await expect(addToCartButton).toBeVisible({ timeout: 5000 });

    // Click and verify state change
    await addToCartButton.click();

    // Verify cart badge updates
    const cartCount = await inventoryPage.getCartBadgeCount();
    expect(cartCount).toBe(1);
  });
});

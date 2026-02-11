import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export interface Product {
  name: string;
  description: string;
  price: string;
  addToCartButton: Locator;
  removeButton: Locator;
}

export class InventoryPage extends BasePage {
  // Page URL
  readonly url = '/inventory.html';

  // Selectors using data-test attributes (most robust)
  private readonly productContainer = '[data-test="inventory-container"]';
  private readonly cartBadge = '[data-test="shopping-cart-badge"]';
  private readonly cartLink = '[data-test="shopping-cart-link"]';
  private readonly sortDropdown = '[data-test="product-sort-container"]';

  constructor(page: Page) {
    super(page);
  }


  async goto(): Promise<void> {
    await super.goto(this.url);
  }


  async getProductByName(productName: string): Promise<Product> {
    // Find product container by name (using accessible text)
    const productLocator = this.page
      .locator('[data-test="inventory-item"]')
      .filter({ hasText: productName });

    // Get product details
    const name = await productLocator.locator('[data-test="inventory-item-name"]').textContent() || '';
    const description = await productLocator.locator('[data-test="inventory-item-desc"]').textContent() || '';
    const price = await productLocator.locator('[data-test="inventory-item-price"]').textContent() || '';
    
    // Get add to cart button (will change to remove after clicking)
    const addToCartButton = productLocator.locator('button').filter({ hasText: /Add to cart/i });
    const removeButton = productLocator.locator('button').filter({ hasText: /Remove/i });

    return {
      name: name.trim(),
      description: description.trim(),
      price: price.trim(),
      addToCartButton,
      removeButton,
    };
  }

  async addProductToCart(productName: string): Promise<void> {
    const product = await this.getProductByName(productName);
    await product.addToCartButton.click();
    
    // Wait for button state to change (becomes "Remove")
    await product.removeButton.waitFor({ state: 'visible', timeout: 5000 });
  }

  async removeProductFromCart(productName: string): Promise<void> {
    const product = await this.getProductByName(productName);
    await product.removeButton.click();
    
    // Wait for button to change back to "Add to Cart"
    await product.addToCartButton.waitFor({ state: 'visible', timeout: 5000 });
  }

  async getCartBadgeCount(): Promise<number> {
    const badge = this.page.locator(this.cartBadge);
    if (await badge.isVisible()) {
      const text = await badge.textContent();
      return parseInt(text || '0', 10);
    }
    return 0;
  }


  async goToCart(): Promise<void> {
    await this.page.click(this.cartLink);
  }


  async getAddToCartButton(productName: string): Promise<Locator> {
    const product = await this.getProductByName(productName);
    return product.addToCartButton;
  }


  async getRemoveButton(productName: string): Promise<Locator> {
    const product = await this.getProductByName(productName);
    return product.removeButton;
  }


  async getButtonColor(button: Locator): Promise<string> {
    return await button.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return styles.color;
    });
  }


  async getButtonBackgroundColor(button: Locator): Promise<string> {
    return await button.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return styles.backgroundColor;
    });
  }


  async getButtonText(button: Locator): Promise<string> {
    return (await button.textContent()) || '';
  }
}

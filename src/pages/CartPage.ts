import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class CartPage extends BasePage {
  readonly url = '/cart.html';

  // Selectors
  private readonly cartItem = '[data-test="cart-item"]';
  private readonly checkoutButton = '[data-test="checkout"]';
  private readonly continueShoppingButton = '[data-test="continue-shopping"]';
  private readonly removeButton = '[data-test="remove"]';

  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await super.goto(this.url);
  }


  getCartItem(productName: string): Locator {
    return this.page.locator(
      '[data-test="inventory-item-name"]',
      { hasText: productName }
    );
  }
  
  async isProductInCart(productName: string): Promise<boolean> {
    const item = this.getCartItem(productName);
  
    try {
      // Wait until the item is actually visible (auto-wait)
      await item.waitFor({ state: 'visible', timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  async clickCheckout(): Promise<void> {
    await this.page.click(this.checkoutButton);
  }

  async removeProduct(productName: string): Promise<void> {
    const item = this.getCartItem(productName);
    await item.locator(this.removeButton).click();
  }

  async getItemCount(): Promise<number> {
    const items = this.page.locator(this.cartItem);
    return await items.count();
  }
}

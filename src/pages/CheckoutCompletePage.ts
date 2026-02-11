import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class CheckoutCompletePage extends BasePage {
  readonly url = '/checkout-complete.html';

  // Selectors - using multiple strategies for robustness
  private readonly completeHeader = 'h2.complete-header'; // CSS class
  private readonly completeText = '[data-test="complete-text"]'; // data-test attribute
  private readonly backHomeButton = '[data-test="back-to-products"]'; // data-test attribute
  private readonly ponyExpressImage = '.pony_express'; // CSS class

  constructor(page: Page) {
    super(page);
  }


  async goto(): Promise<void> {
    await super.goto(this.url);
  }

  async getSuccessMessage(): Promise<string> {
    return await this.page
      .locator('[data-test="complete-header"]')
      .innerText();
  }
  
  async verifyOrderComplete(): Promise<boolean> {
    try {
      await this.page
        .locator('[data-test="complete-header"]')
        .waitFor({ state: 'visible', timeout: 5000 });
  
      return true;
    } catch {
      return false;
    }
  }
  


  async clickBackHome(): Promise<void> {
    await this.page.click(this.backHomeButton);
  }

  async isCompletionImageVisible(): Promise<boolean> {
    return await this.page.locator(this.ponyExpressImage).isVisible();
  }
}

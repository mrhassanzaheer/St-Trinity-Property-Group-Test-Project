import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export interface CheckoutInfo {
  firstName: string;
  lastName: string;
  postalCode: string;
}

export class CheckoutPage extends BasePage {
  readonly stepOneUrl = '/checkout-step-one.html';
  readonly stepTwoUrl = '/checkout-step-two.html';

  // Step One Selectors
  private readonly firstNameInput = '[data-test="firstName"]';
  private readonly lastNameInput = '[data-test="lastName"]';
  private readonly postalCodeInput = '[data-test="postalCode"]';
  private readonly continueButton = '[data-test="continue"]';
  private readonly cancelButton = '[data-test="cancel"]';

  // Step Two Selectors
  private readonly finishButton = '[data-test="finish"]';
  private readonly summaryInfo = '[data-test="checkout-summary-container"]';

  constructor(page: Page) {
    super(page);
  }


  async gotoStepOne(): Promise<void> {
    await super.goto(this.stepOneUrl);
  }

  async fillCheckoutInfo(info: CheckoutInfo): Promise<void> {
    await this.page.fill(this.firstNameInput, info.firstName);
    await this.page.fill(this.lastNameInput, info.lastName);
    await this.page.fill(this.postalCodeInput, info.postalCode);
  }


  async clickContinue(): Promise<void> {
    await this.page.click(this.continueButton);
    // Wait for navigation to step two
    await this.page.waitForURL('**/checkout-step-two.html', { timeout: 10000 });
  }


  async clickFinish(): Promise<void> {
    await this.page.click(this.finishButton);
  }


  async completeCheckout(info: CheckoutInfo): Promise<void> {
    await this.fillCheckoutInfo(info);
    await this.clickContinue();
    await this.clickFinish();
  }

  async isSummaryDisplayed(): Promise<boolean> {
    return await this.page.locator(this.summaryInfo).isVisible();
  }
}

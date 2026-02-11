import { Page, Locator } from '@playwright/test';

export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async waitForLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  async goto(path: string): Promise<void> {
    await this.page.goto(path);
    await this.waitForLoad();
  }

  async getTitle(): Promise<string> {
    return await this.page.title();
  }

  async screenshot(path: string): Promise<void> {
    await this.page.screenshot({ path });
  }
}

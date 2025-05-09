import { Injectable } from '@nestjs/common';
import { Capabilities, Builder, Browser, WebDriver } from 'selenium-webdriver';
import { ConfigService } from '../config/config.service';

@Injectable()
export class SeleniumService {
  constructor(private readonly configService: ConfigService) {}

  async execute<T>(
    callback: (driver: WebDriver) => Promise<T>,
    existingDriver?: WebDriver,
  ): Promise<T> {
    const driver = await this.prepareDriver(existingDriver);
    try {
      return await callback(driver);
    } finally {
      await driver.deleteDownloadableFiles();
      await driver.quit();
    }
  }

  private async prepareDriver(existingDriver?: WebDriver) {
    if (existingDriver) {
      return existingDriver;
    }

    const chromCapabilities = Capabilities.chrome();
    chromCapabilities.set('chromeOptions', {
      args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage:'],
    });
    chromCapabilities.set('se:downloadsEnabled', true);
    // set download directory
    chromCapabilities.set(
      'download.default_directory',
      this.configService.get('SELENIUM_DOWNLOAD_PATH'),
    );
    const seleniumServer = this.configService.get('SELENIUM_HUB_URL');
    return new Builder()
      .usingServer(seleniumServer)
      .forBrowser(Browser.CHROME)
      .withCapabilities(chromCapabilities)
      .build();
  }
}

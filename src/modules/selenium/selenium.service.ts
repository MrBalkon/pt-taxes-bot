import { Injectable } from '@nestjs/common';
import { Capabilities, Builder, Browser, WebDriver } from 'selenium-webdriver';
import { ConfigService } from '../config/config.service';

@Injectable()
export class SeleniumService {
	constructor(
		private readonly configService: ConfigService,
	) {}

	async execute<T>(callback: (driver: WebDriver) => Promise<T>) {
		const driver = await this.prepareDriver()
		try {
			return await callback(driver)
		} finally {
			await driver.quit()
		}
	}

	private async prepareDriver() {
		const chromCapabilities = Capabilities.chrome()
		chromCapabilities.set('chromeOptions', {
			'args': ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage:']
		})
		const seleniumServer = this.configService.get('SELENIUM_HUB_URL')
		return new Builder().usingServer(seleniumServer).forBrowser(Browser.CHROME).withCapabilities(chromCapabilities).build()
	}
}
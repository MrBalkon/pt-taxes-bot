import { WebDriver } from "selenium-webdriver"
import { PageException } from "../task-processing.error"
import { Logger } from "@nestjs/common"

export const goPage = (pageName: string, url: string) => async (driver: WebDriver) => {
	try {
		await driver.get(url)
	} catch (error) {
		throw new PageException(`Failed to go to ${pageName} page`)
	}
}

export const goBack = async (driver: WebDriver) => {
	try {
		await driver.navigate().back()
	} catch (error) {
		throw new PageException('Failed to go back')
	}
}

export interface SeleniumExecuteScenarioArgs {
	driver: WebDriver
	logger: Logger
}

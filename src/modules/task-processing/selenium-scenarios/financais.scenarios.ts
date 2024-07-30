import { By, Key, WebDriver } from "selenium-webdriver"
import { ServiceUnavailableError, TaskProcessingError } from "../task-processing.error"

export const financaisGoMainPage = async (driver: WebDriver) => {
	try {
		await driver.get('https://sitfiscal.portaldasfinancas.gov.pt/geral/dashboard')
	} catch (error) {
		throw new ServiceUnavailableError('Finanças')
	}
}

export const financaisLogin = async (driver: WebDriver, { nif, password }) => {
	try {
		const nameInput = await driver.findElement(By.name('username'))
		await nameInput.sendKeys(nif)

		const passInput = await driver.findElement(By.name('password'))
		await passInput.sendKeys(password, Key.RETURN)

		await driver.findElement(By.xpath("//a[contains(text(), 'Sair')]"))
	} catch (error) {
		throw new TaskProcessingError('Failed to login to Seg Social')
	}
}
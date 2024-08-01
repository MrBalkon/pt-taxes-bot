import { By, Key, WebDriver } from "selenium-webdriver"
import { PageException, ServiceUnavailableError, TaskProcessingError, WrongCredentialsError } from "../task-processing.error"

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
		throw new WrongCredentialsError('Failed to login to Seg Social')
	}
}

export const gotToAtividadePage = async (driver: WebDriver) => {
	try {
		await driver.get('https://sitfiscal.portaldasfinancas.gov.pt/integrada/presentation?queryStringS=targetScreen%3DecraActividade%26hmac%3DNYiJFiu6j3kZKB2L7YDSHFj8GPM%3D')
	} catch (error) {
		throw new PageException('Failed to go to Atividade page')
	}
}

export const retrieveAtividadeData = async (driver: WebDriver) => {

}

export const retrieveCategoryData = async (driver: WebDriver) => {
	await gotToAtividadePage(driver)


}
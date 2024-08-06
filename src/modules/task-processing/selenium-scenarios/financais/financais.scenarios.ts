// @ts-ignore
import { By, Key, WebDriver, Select } from "selenium-webdriver"
import { goPage } from "../default.scenarios"
import { ServiceUnavailableError, WrongCredentialsError, TaskProcessingError } from "src/modules/task-processing-queue/task-processing-queue.error"
export const financaisGoMainPage = async (driver: WebDriver) => {
	try {
		await driver.get('https://sitfiscal.portaldasfinancas.gov.pt/geral/dashboard')
	} catch (error) {
		throw new ServiceUnavailableError('Finanças')
	}
}

export const financaisLogin = async (driver: WebDriver, { nif, password }) => {
	try {
		const nifTab = await driver.findElement(By.xpath("//span[contains(text(), 'NIF')]"))
		await nifTab.click()

		const nameInput = await driver.findElement(By.name('username'))
		await nameInput.sendKeys(nif)

		const passInput = await driver.findElement(By.name('password'))
		await passInput.sendKeys(password, Key.RETURN)

		await driver.findElement(By.xpath("//a[contains(text(), 'Sair')]"))
	} catch (error) {
		throw new WrongCredentialsError('Failed to login in finacais')
	}
}

export const gotToAtividadePage = goPage('Atividade', 'https://sitfiscal.portaldasfinancas.gov.pt/integrada/presentation?queryStringS=targetScreen%3DecraActividade%26hmac%3DNYiJFiu6j3kZKB2L7YDSHFj8GPM%3D')

export const retrieveAtividadePageData = async (driver: WebDriver) => {
	const category = await retrieveCategoryData(driver)

	return {
		category
	}
}

export const retrieveCategoryData = async (driver: WebDriver) => {
	const workType = await driver.findElement(By.xpath("//dt[contains(text(), 'Tipo de Sujeito Passivo')]//following-sibling::dd"))

	const text = await workType.getText()
	const regex = /Cat\.([A-Z])/
	const match = text.match(regex)
	if (!match) {
		throw new TaskProcessingError('Failed to retrieve category data')
	}
	const category = match[1]
	return category
}

export const getActivityStartDate = async (driver: WebDriver) => {
	const startDate = await driver.findElement(By.xpath("//dt[contains(text(), 'Data de Início')]//following-sibling::dd"))

	const text = await startDate.getText()
	return text
}

// date format is 'YYYY-MM-DD'
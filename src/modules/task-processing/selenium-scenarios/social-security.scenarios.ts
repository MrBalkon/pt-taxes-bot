import { By, Key, WebDriver, until } from "selenium-webdriver"
import { TaskProcessingError } from "../task-processing.error"

export const socialSecuriyGoMainPage = async (driver: WebDriver) => {
	try {
		await driver.get('https://app.seg-social.pt/ptss/')
	} catch (error) {
		throw new TaskProcessingError('Failed to go to Seg Social main page')
	}
}

export const socialSecurityLogin = async (driver: WebDriver, { niss, password }) => {
	try {
		const nameInput = await driver.findElement(By.name('username'))
		await nameInput.sendKeys(niss)

		const passInput = await driver.findElement(By.name('password'))
		await passInput.sendKeys(password, Key.RETURN)

		// find if there <span>Sair</span> on page
		// if not, it means that login failed
		await driver.findElement(By.xpath("//span[contains(text(), 'Sair')]"))
	} catch (error) {
		throw new TaskProcessingError('Failed to login to Seg Social')
	}
}

export const fillDeclarationWaitAndPressNext = async (driver: WebDriver) => {
	await driver.wait(until.elementLocated(By.name('mainForm:proximoPassoBtn')),400);
	const nextStepButton = await driver.findElement(By.name('mainForm:proximoPassoBtn'))
	await nextStepButton.click()
}

export const fillTrimesterIncome = async (driver: WebDriver, income: string, month: number) => {
	await driver.wait(until.elementLocated(By.xpath(`//*[@id="mainForm:rendimentosPanel:ps:valorMes${month}_input"]`)),300);
	const trimesterInput = await driver.findElement(By.xpath(`//*[@id="mainForm:rendimentosPanel:ps:valorMes${month}_input"]`))
	await trimesterInput.sendKeys(income)
}

export const socialSecurityFillDeclaration = async (driver: WebDriver) => {
	try {
		const trimesterIncome1 = '5000';
		const trimesterIncome2 = '5000';
		const trimesterIncome3 = '5000';

		await driver.get('https://app.seg-social.pt/ptss/qlf/trabalhadores-independentes/registar_declaracao?frawmenu=1&dswid=-1')

		const radioYesInput = await driver.findElement(By.xpath('//*[@id="mainForm:temRendimentosCustomRadio:customRadioPanel"]/div[1]/label'))
		await radioYesInput.click()

		await fillDeclarationWaitAndPressNext(driver)

		const servicesProvisionElement = await driver.findElement(By.xpath('//*[@id="mainForm:rendimentosPanel"]/h3[1]/div/div/font/font'))
		await servicesProvisionElement.click()

		await fillTrimesterIncome(driver, trimesterIncome1, 1)
		await fillTrimesterIncome(driver, trimesterIncome2, 2)
		await fillTrimesterIncome(driver, trimesterIncome3, 3)

		await fillDeclarationWaitAndPressNext(driver)

		const radioYesInput2 = await driver.findElement(By.xpath('//*[@id="mainForm:temRendimentosCustomRadio:customRadioPanel"]/div[1]/label'))

	} catch (error) {
		console.error(error)
		throw new TaskProcessingError('Failed to go to Seg Social main page')
	}
}

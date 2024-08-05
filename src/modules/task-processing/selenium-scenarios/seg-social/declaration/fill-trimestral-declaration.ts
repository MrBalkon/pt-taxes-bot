import { TaskProcessingError } from "src/modules/task-processing-queue/task-processing.error";
import { goPage } from "../../default.scenarios";
import { WebDriver, until, By } from "selenium-webdriver";

const goRegisterDeclarationPage = goPage('Registar Declaração', 'https://app.seg-social.pt/ptss/qlf/trabalhadores-independentes/registar_declaracao?frawmenu=1&dswid=-1')

const goConsultarTrimestralDeclarationPage = goPage('Consultar Declaração Trimestral', 'https://app.seg-social.pt/ptss/qlf/trabalhadores-independentes/consultar_declaracao_trimestral?frawmenu=1&dswid=-1')

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

export const checkIfDeclarationIsFilled = async (driver: WebDriver, data: SocialSecurityDeclarationData) => {
	await goConsultarTrimestralDeclarationPage(driver)

	const yearSelect = await driver.findElement(By.id('declaracaoForm:qlfTiConsultaDeclaracaoTrimestralRendimentoAnual'))
	// find li item in dropdown with data.previousQuarterYear value
	// It's custom select
	await yearSelect.click()

	// find li item in dropdown with data.previousQuarterYear value
	const xpath = `//*[@id="declaracaoForm:qlfTiConsultaDeclaracaoTrimestralRendimentoAnual_panel"]//li[contains(text(), '${data.previousQuarterYear}')]`
	const yearSelectItem = await driver.wait(until.elementLocated(By.xpath(xpath)), 20000)

	await yearSelectItem.click()

	const tableRows = await driver.findElements(By.xpath('//*[@id="declaracaoForm:declaracacoesTreeTable"]//tbody/tr/td[1]'))

	for (const row of tableRows) {
		const text = await row.getText()
		if (text.includes(`${data.previousQuarter}º Trimestre`)) {
			return true
		}
	}

	return false
}

export interface SocialSecurityDeclarationData {
	previousQuarterYear: number
	previousQuarter: number
}

export const socialSecurityFillTrimestralDeclaration = async (driver: WebDriver, data: SocialSecurityDeclarationData) => {
	if (await checkIfDeclarationIsFilled(driver, data)) {
		return
	}

	const trimesterIncome1 = '5000';
	const trimesterIncome2 = '5000';
	const trimesterIncome3 = '5000';

	await goRegisterDeclarationPage(driver)

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
}

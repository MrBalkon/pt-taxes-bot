/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-expect-error
import { By, WebDriver, Select, WebElement, until } from 'selenium-webdriver';
import { goBack, goPage } from '../default.scenarios';
import {
  DownloadFinancaisFaturaTable,
  downloadFinancais,
} from './download-financais';
import { parse } from 'csv-parse/sync';
import { DateTime } from 'luxon';
import { group, sumFloats } from 'src/utils';

export enum FaturaVerdeType {
  FATURA_RECIBO = 'Fatura-Recibo',
  FATURA_RECIBO_ATO_ISOLADO = 'Fatura-Recibo Ato Isolado',
  FATURA = 'Fatura',
  FATURA_ATO_ISOLADO = 'Fatura Ato Isolado',
  RECIBO = 'Recibo',
  RECIBO_ATO_ISOLADO = 'Recibo Ato Isolado',
}

export enum FaturaVerdeIncomeStatus {
  EMITIDO = 'Emitido',
  ANULADO = 'Anulado',
  SEM_PREENCHIMENTO = 'Sem Preenchimento',
}

export interface FaturaVerdeIncomeArgs {
  emissionStartDate: string;
  emissionEndDate: string;
  status: FaturaVerdeIncomeStatus;
  type: FaturaVerdeType;
}

export const goFaturaVerdePage = goPage(
  'Fatura Verde',
  'https://irs.portaldasfinancas.gov.pt/recibos/portal/consultar',
);

export enum FaturaVerdeIncomeTableColumns {
  REFERENCIA = 'Referência',
  TIPO_DOCUMENTO = 'Tipo Documento',
  ATCUD = 'ATCUD',
  SITUACAO = 'Situação',
  DATA_TRANSACAO = 'Data da Transação',
  DATA_EMISSAO = 'Data de Emissão',
  NIF_PRESTADOR = 'NIF Prestador',
  NIF_ADQUIRENTE = 'NIF Adquirente',
  NOME_ADQUIRENTE = 'Nome do Adquirente',
  VALOR_TRIBUTAVEL = 'Valor Tributável (em euros)',
  VALOR_IVA = 'Valor do IVA (em euros)',
  IMPOSTO_DO_SELO = 'Imposto do Selo como Retenção na Fonte',
  VALOR_IMPOSTO_DO_SELO = 'Valor do Imposto do Selo (em euros)',
  VALOR_IRS = 'Valor do IRS (em euros)',
  TOTAL_IMPOSTOS = 'Total de Impostos (em euros)',
  TOTAL_COM_IMPOSTOS = 'Total com Impostos (em euros)',
  TOTAL_RETENCOES = 'Total de Retenções na Fonte (em euros)',
  CONTRIBUICAO_CULTURA = 'Contribuição Cultura (em euros)',
  TOTAL_DOCUMENTO = 'Total do Documento (em euros)',
}

export const retrieveFaturaVerdeIncome = async (
  driver: WebDriver,
  args: DownloadFinancaisFaturaTable,
) => {
  const csvString = await downloadFinancais(driver, args);

  const records = parse(csvString, {
    columns: true,
    delimiter: ';',
    skip_empty_lines: true,
  }) as Record<FaturaVerdeIncomeTableColumns, string>[];

  return combine(records);
};

export const parseTableNumber = (value: string) => {
  // "5.310" => 5310
  // "1.221,3" => 1221.3

  return parseFloat(value.replace('.', '').replace(',', '.'));
};

const sumTablesRecordColumns = (
  records: Record<FaturaVerdeIncomeTableColumns, string>[],
  column: FaturaVerdeIncomeTableColumns,
) => {
  return sumFloats(records.map((r) => parseTableNumber(r[column])));
};

export const combine = (
  records: Record<FaturaVerdeIncomeTableColumns, string>[],
) =>
  group((record) => {
    const date = DateTime.fromISO(
      record[FaturaVerdeIncomeTableColumns.DATA_TRANSACAO],
    );
    return `${date.year}-${date.month}`;
  })(records).map(
    (records: Record<FaturaVerdeIncomeTableColumns, string>[]) => {
      const date = DateTime.fromISO(
        records[0][FaturaVerdeIncomeTableColumns.DATA_TRANSACAO],
      );
      return {
        year: date.year,
        month: date.month,
        [FaturaVerdeIncomeTableColumns.NIF_ADQUIRENTE]:
          records[0][FaturaVerdeIncomeTableColumns.NIF_ADQUIRENTE],
        [FaturaVerdeIncomeTableColumns.NIF_PRESTADOR]:
          records[0][FaturaVerdeIncomeTableColumns.NIF_PRESTADOR],
        incomeReciebaVerde: sumTablesRecordColumns(
          records,
          FaturaVerdeIncomeTableColumns.VALOR_TRIBUTAVEL,
        ),
        ivaFaturaRecieba: sumTablesRecordColumns(
          records,
          FaturaVerdeIncomeTableColumns.VALOR_IVA,
        ),
        irsFaturaRecieba: sumTablesRecordColumns(
          records,
          FaturaVerdeIncomeTableColumns.VALOR_IRS,
        ),
      };
    },
  );

// {
// 	"Refer�ncia": "R ATSIRE01R/19",
// 	"Tipo Documento": "Fatura-Recibo",
// 	ATCUD: "JFGS7BVK-19",
// 	"Situa��o": "Emitido",
// 	"Data da Transa��o": "2024-07-22",
// 	"Data de Emiss�o": "2024-07-22",
// 	"NIF Prestador": "315300752",
// 	"NIF Adquirente": "516542486",
// 	"Nome do Adquirente": "INTENTO UNIPESSOAL - LDA",
// 	"Valor Tribut�vel (em euros)": "5.310",
// 	"Valor do IVA (em euros)": "1.221,3",
// 	"Imposto do Selo como Reten��o na Fonte": "",
// 	"Valor do Imposto do Selo (em euros)": "0",
// 	"Valor do IRS (em euros)": "1.062",
// 	"Total de Impostos (em euros)": "",
// 	"Total com Impostos (em euros)": "6.531,3",
// 	"Total de Reten��es na Fonte (em euros)": "",
// 	"Contribui��o Cultura (em euros)": "0",
// 	"Total do Documento (em euros)": "5.469,3",
//   }

// export const setTableSize = async (driver: WebDriver, size: number = 50) => {
// 	// set page size to 50
// 	// - Find element button with name dropdownMenu1
// 	// - Wait until element is visible
// 	const dropdownMenu1 = await driver.wait(until.elementLocated(By.id('dropdownMenu1')), 20000)
// 	// - Click on button element with name dropdownMenu1
// 	await dropdownMenu1.click()
// 	// - Find ul element with role menu and aria-labelledby="dropdownMenu1"
// 	const dropdownMenu1Ul = await driver.findElement(By.xpath('//ul[@role="menu" and @aria-labelledby="dropdownMenu1"]'))
// 	// - Find li.a element with text 50
// 	const dropdownMenu1Li = await dropdownMenu1Ul.findElement(By.xpath(`//li/a[contains(text(), "${size}")]`))
// 	// - Click on li.a element with text 50
// 	await dropdownMenu1Li.click()

// 	// wait 2 seconds for page to update
// 	await driver.sleep(2000)
// }

// export const retrieveFaturaVerdeIncomeDeprecated = async (driver: WebDriver, args: FaturaVerdeIncomeArgs) => {
// 	const { emissionStartDate, emissionEndDate, status, type } = args
// 	// Fill emission start date
// 	// - Find element with id "#dataEmissaoInicio"
// 	const dataEmissaoInicio = await driver.findElement(By.id('dataEmissaoInicio'))
// 	// - Clear element value
// 	await dataEmissaoInicio.clear()
// 	// - Set value to {YEAR}-01-01
// 	await dataEmissaoInicio.sendKeys(emissionStartDate)
// 	// - Find element with id "#dataEmissaoInicio"
// 	const dataEmissaoInicioValue = await dataEmissaoInicio.getAttribute('value')
// 	// - Check if value is {YEAR}-01-01
// 	if (dataEmissaoInicioValue !== emissionStartDate) {
// 		throw new TaskProcessingError('Failed to set dataEmissaoInicio value')
// 	}

// 	// Fill emission start end date
// 	// - Find element with id "#dataEmissaoFim"
// 	const dataEmissaoFim = await driver.findElement(By.id('dataEmissaoFim'))
// 	// - Clear element value
// 	await dataEmissaoFim.clear()
// 	// - Set value to {YEAR}-12-31
// 	await dataEmissaoFim.sendKeys(emissionEndDate)
// 	// - Find element with id "#dataEmissaoFim"
// 	const dataEmissaoFimValue = await dataEmissaoFim.getAttribute('value')
// 	// - Check if value is {YEAR}-12-31
// 	if (dataEmissaoFimValue !== emissionEndDate) {
// 		throw new TaskProcessingError('Failed to set dataEmissaoFim value')
// 	}

// 	// Open additions filter options
// 	// Click button with text opções
// 	const opcoesButton = await driver.findElement(By.xpath("//button[contains(text(), 'opções')]"))
// 	await opcoesButton.click()

// 	// Fill status
// 	// - Find element select with name "cSituacao"
// 	const situacaoSelectEl = await driver.findElement(By.xpath('//select[@name="cSituaca"]'))
// 	const situacaoSelect = new Select(situacaoSelectEl)

// 	await situacaoSelect.selectByVisibleText(status)

// 	// Fill type
// 	const typeSelectEl = await driver.findElement(By.xpath('//select[@name="tipoRecibo"]'))
// 	const typeSelect = new Select(typeSelectEl)

// 	await typeSelect.selectByVisibleText(type)

// 	// // set page size to 50
// 	await setTableSize(driver)

// 	// iterate throw table rows and get values
// 	// Find table element
// 	const table = await driver.findElement(By.xpath('//table'))
// 	// Find tbody element
// 	const tbody = await table.findElement(By.xpath('//tbody'))
// 	// Find all tr elements
// 	const trs = await tbody.findElements(By.xpath('//tr'))

// 	// - Find button element  with text Pesquisar
// 	const pesquisarButton = await driver.findElement(By.xpath("//button[contains(text(), 'Pesquisar')]"))
// 	// - Click on button element with text Pesquisar
// 	await pesquisarButton.click()

// 	// Download csv file via by clicking on button with Exportar Tabela text
// 	// const data = []
// 	// for (const tr of trs) {
// 	// 	// find button with text "Ver"
// 	// 	const verButton = await tr.findElement(By.xpath('//button[contains(text(), "Ver")]'))
// 	// 	// click on button with text "Ver"
// 	// 	await verButton.click()
// 	// }

// 	// wait until export table button is visible
// 	const exportarTabelaButton = await driver.findElement(By.xpath("//button[contains(text(), 'Exportar Tabela')]"))
// 	await driver.wait(until.elementIsVisible(exportarTabelaButton), 10000)
// 	await exportarTabelaButton.click()

// 	await downloadFinancais(driver)

// 	console.log('test')
// 	// - Retrieve income data for it for i in range 1 to 12 where i = month
// 	// 	- Find element with id `#valor${i}`
// }

// export const downloadFile = async (driver: WebDriver) => {
// 	await driver.executeScript('window.open()')

// 	const handles = await driver.getAllWindowHandles()
// 	const newWindowHandle = handles[1]

// 	await driver.switchTo().window(newWindowHandle)

// 	await driver.get('chrome://downloads')

// 	await driver.wait(() => {
// 		return driver.executeScript('return downloads.Manager.get().items_.length > 0 && downloads.Manager.get().items_[0].state === "COMPLETE"');
// 	}, 600000)

// 	const items = await driver.executeScript('return downloads.Manager.get().items_')
// 	console.log(items)
// }

// <dl class="col-xs-12 dl-horizontal-values">
//                     <div class="col-md-10 col-xs-9">
//                         <dt>Valor Base</dt>
//                     </div>
//                     <div class="col-md-2 col-xs-3">
//                                                     <dd>5.310,00 €</dd>

//                     </div>

//                     <div class="col-md-10 col-xs-9">
//                         <dt>Valor de IVA Continente - 23% [taxa normal atual]</dt>
//                     </div>
//                     <div class="col-md-2 col-xs-3">
//                                                     <dd>1.221,30 €</dd>
//                                             </div>

//                                             <div class="col-md-10 col-xs-9">
//                             <dt>Imposto do Selo</dt>
//                         </div>
//                         <div class="col-md-2 col-xs-3">
//                                                             <dd>0,00 €</dd>
//                                                     </div>
//                                                     <div class="col-md-10 col-xs-9">
//                                 <dt>Valor de IRS Sobre 100% - art. 101.º, n.ºs 1 e 9, do CIRS - À taxa de 20% - art. 101.º, n.º1, do CIRS</dt>
//                             </div>
//                                                 <div class="col-md-2 col-xs-3">
//                                                             <dd>1.062,00 €</dd>
//                                                     </div>

//                     <div class="col-md-10 col-xs-9">
//                     <dt>Importância recebida</dt>                                        </div>
//                     <div class="col-md-2 col-xs-3">
//                                                     <dd>5.469,30 €</dd>
//                                             </div>
//                 </dl>

// const extractFloatDataFromTable = async (driver: WebDriver, text: string) => {
// 	// Valor base value
// 	const element = await driver.findElement(By.xpath(`//dt[contains(text(), "${text}")]/../following-sibling::div/dd`))
// 	const valueText = await element.getText()
// 	// parse using regex
// 	const result = parseFloat(valueText.replace(/[^0-9,]/g, '').replace(',', '.'))

// 	if (isNaN(result)) {
// 		throw new TaskProcessingError(`Failed to parse ${text} value`)
// 	}

// 	return result
// }

// export const extractFaturaDataFromTr = async (driver: WebDriver, tr: WebElement) => {
// 	// find button with text "Ver"
// 	const verButton = await tr.findElement(By.xpath('//button[contains(text(), "Ver")]'))
// 	// click on button with text "Ver"
// 	await verButton.click()

// 	// wait 2 seconds for page to update
// 	await driver.sleep(2000)
// 	// parse using regex
// 	const valorBase = extractFloatDataFromTable(driver, "Valor Base")

// 	//

// 	await setTableSize(driver)
// 	await goBack(driver)

// 	return {
// 		valorBase
// 	}
// }

import { WebDriver, until, Actions } from 'selenium-webdriver';
import { getLastDownloadableFileContent, goPage } from '../default.scenarios';
import command from 'selenium-webdriver/lib/command';
import * as jszip from 'jszip';
import { TaskProcessingError } from 'src/modules/task-processing-queue/task-processing-queue.error';
import { parsePeriodicIvaDeclaration } from './utils/parsePeriodicIvaDeclaration';

export const goConsultarPeriodicIVA = goPage(
  'Consultar Periódico IVA',
  'https://iva.portaldasfinancas.gov.pt/dpiva/portal/consultar-declaracao',
);

export interface ExistingDeclaration {
  declarationQuarter: number;
  declarationQuarterStr: string;
  date: string;
}
export const findExistingDeclarations = async (
  driver: WebDriver,
): Promise<ExistingDeclaration[]> => {
  const table = await driver.wait(until.elementLocated({ id: 'table' }), 10000);
  const tBody = await table.findElement({ tagName: 'tbody' });

  const rows = await tBody.findElements({ tagName: 'tr' });

  const declarations = [];

  for (const row of rows) {
    const cells = await row.findElements({ tagName: 'td' });

    const declarationQuarterStr = await cells[0]
      .findElement({ tagName: 'p' })
      .getText();
    // 24 = year, 03 = last month of the quarter, return quarter
    // get first quarter from 2403T -> 1
    // get second quarter from 2406T -> 2
    // get third quarter from 2409T -> 3
    // get fourth quarter from 2412T -> 4
    const lastQuarterMonth = parseInt(declarationQuarterStr.slice(2, 4));
    const declarationQuarter = lastQuarterMonth / 3;

    const date = await cells[1].getText();

    declarations.push({
      declarationQuarter,
      declarationQuarterStr,
      date,
    });
  }

  return declarations;
};

export const goFillDeclarationPage = goPage(
  'Preencher Declaração',
  'https://iva.portaldasfinancas.gov.pt/dpiva/portal/entregar-declaracao',
);

export interface FillPeriodIVAInput {
  quarter: number;
  // year: number
  hasApprovedSubmit?: boolean;
}

export const handleAutomaticIVA = async (driver: WebDriver) => {
  try {
    // Handle automatic IVA modal
    const modalText = await driver.wait(
      until.elementLocated({
        xpath: "//p[contains(text(), 'Deseja utilizar esta funcionalidade?')]",
      }),
      10000,
    );

    // find button with text Fechar in parent of modal text with role=document
    const closeButton = await modalText.findElement({
      xpath:
        "ancestor::div[@role='document']//button/span[contains(text(), 'Fechar')]",
    });

    await closeButton.click();
  } catch (e) {}
};

export const handlePrefillModal = async (
  driver: WebDriver,
  data: FillPeriodIVAInput,
) => {
  // find modal woith text Assistente de Pré-Preenchimento
  const preFillModalText = await driver.wait(
    until.elementLocated({
      xpath: "//p[contains(text(), 'Assistente de Pré-Preenchimento')]",
    }),
    10000,
  );

  // find parent modal with role=document
  const preFillModal = await preFillModalText.findElement({
    xpath: "ancestor::div[@role='dialog']",
  });

  // find periodo declarativo select
  const periodoDeclarativoSelect = await driver.findElement({
    xpath:
      "//p[contains(text(), 'Assistente de Pré-Preenchimento')]//ancestor::div[@role='dialog']//lf-select[@path='periodoDeclaracao']//ng-select//span[contains(@class, 'ng-arrow-wrapper')]",
  });

  // wait for select to be clickable
  await driver.wait(until.elementIsVisible(periodoDeclarativoSelect), 10000);

  await periodoDeclarativoSelect.click();

  // select Xº. Trimestre, where x = data.quarter
  const quarterOption = await driver.wait(
    until.elementLocated({
      xpath: `//div[contains(text(), '${data.quarter}º. Trimestre')]/..`,
    }),
    10000,
  );

  await quarterOption.click();

  // click Pré-Preencher = <button class="btn btn-primary btn-sm" type="button"><!----><!----><span class="btn-text">Pré-Preencher </span></button>
  const preFillButtonEl = await preFillModal.findElement({
    xpath: "//button/span[contains(text(), 'Pré-Preencher')]",
  });

  // wait for button to be clickable
  const preFillButton = await driver.wait(
    until.elementIsVisible(preFillButtonEl),
    10000,
  );

  await preFillButton.click();
};

export const prefillPeriodicIVA = async (
  driver: WebDriver,
  data: FillPeriodIVAInput,
) => {
  await driver.sleep(2000);

  await handleAutomaticIVA(driver);

  await handlePrefillModal(driver, data);
};

export const getIvaXml = async (driver: WebDriver) => {
  // find button with span and text = Guardar
  const downloadButton = await driver.wait(
    until.elementLocated({
      xpath: "//button/span[contains(text(), 'Guardar')]",
    }),
    10000,
  );

  await downloadButton.click();

  const ivaXml = await getLastDownloadableFileContent(driver);

  return parsePeriodicIvaDeclaration(ivaXml);
};

export const validateIvaDeclaration = async (driver: WebDriver) => {
  const validateButton = await driver.wait(
    until.elementLocated({
      xpath: "//button/span[contains(text(), 'Validar')]",
    }),
    10000,
  );

  await validateButton.click();

  // find div with role = alert inside tag lf-validation-panel
  const validationAlert = await driver.wait(
    until.elementLocated({
      xpath: "//lf-validation-panel//div[@role='alert']",
    }),
    10000,
  );

  const alertClasses = await validationAlert.getAttribute('class');

  if (alertClasses.includes('success')) {
    return true;
  }

  throw new TaskProcessingError('Validation failed');
};

import { By, until, WebDriver } from 'selenium-webdriver';
import { goPage } from '../../default.scenarios';

export const PERIODIC_IVA_HOST = 'https://iva.portaldasfinancas.gov.pt';

export const PERIODIC_IVA_PAYMENT_LINK = `${PERIODIC_IVA_HOST}/dpiva/portal/obter-doc-pagamento`;

export const goPayementsPage = goPage('Pagamentos', PERIODIC_IVA_PAYMENT_LINK);

export interface GetPayementDataProps {
  quarter: number;
  year: number;
}

export interface PeriodicIVAPaymentData {
  id: string;
  paymentLink: string;
  valueAmount: string;
  period: string;
}

// export const getPayementData = async (
//   driver: WebDriver,
// ): Promise<PeriodicIVAPaymentData[]> => {};

export const getPayementInformation = async (
  driver: WebDriver,
  props: GetPayementDataProps,
) => {};

export const periodicIVARetrievePayements = async (
  driver: WebDriver,
  props: GetPayementDataProps,
): Promise<PeriodicIVAPaymentData[]> => {
  // find table tag element by tag name
  const table = await driver.wait(
    until.elementLocated({ tagName: 'tbody' }),
    10000,
  );

  // search through table rows
  const rows = await table.findElements({ tagName: 'tr' });

  const resultPayments = [];
  const existingQuarters = [];

  const originalHandle = await driver.getWindowHandle();
  for (const row of rows) {
    const cells = await row.findElements({ tagName: 'td' });

    // get from p element
    const id = await cells[0].findElement({ tagName: 'p' }).getText();
    // peroiodo format: 03T, 06T, 09T, 12T
    const periodo = await cells[1].findElement({ tagName: 'p' }).getText();

    const quater = parseInt(periodo.slice(0, 2)) / 3;

    if (existingQuarters.includes(props.quarter)) {
      continue;
    }

    if (quater !== props.quarter) {
      continue;
    }

    // find link element by tag name
    const link = await row.findElement({ tagName: 'a' });

    const href = await link.getAttribute('href');
    const paymentLink = href;

    // open new tab
    await driver.executeScript('window.open()');
    const newTabHandle = (await driver.getAllWindowHandles()).pop();

    await driver.switchTo().window(newTabHandle);

    await goPage('Pagamentos', paymentLink)(driver);

    // find element with text = Montante
    const label = await driver.wait(
      until.elementLocated(By.xpath('//*[contains(text(), "Montante")]')),
      10000,
    );

    // find sibling's element text
    const valueAmountStr = await label
      .findElement({ xpath: 'following-sibling::dd//span' })
      .getText();

    // transform from '3 529,21 €' to '3529.21'
    const valueAmount = valueAmountStr
      .replace(/[^0-9,]/g, '')
      .replace(',', '.');

    resultPayments.push({
      id,
      paymentLink,
      valueAmount,
      period: quater,
    });
    existingQuarters.push(quater);

    // clow current tab
    await driver.close();
    await driver.switchTo().window(originalHandle);

    return resultPayments;
  }

  return resultPayments;
};

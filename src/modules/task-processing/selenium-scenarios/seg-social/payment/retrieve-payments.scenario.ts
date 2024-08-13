import { By, WebDriver, until } from 'selenium-webdriver';
import { goPage } from '../../default.scenarios';
import { DateTime } from 'luxon';

export const PAYMENT_LINK =
  'https://app.seg-social.pt/ptss/ci/documento-pagamento/pesquisar-doc-pagamento';

export const goPayementsPage = goPage('Pagamentos', PAYMENT_LINK);

export interface SegSocialPaymentData {
  type: string;
  state: string;
  documentNumber: string;
  expirationDate: DateTime;
  valueAmount: string;
}

export const retrievePayments = async (
  driver: WebDriver,
): Promise<SegSocialPaymentData[]> => {
  // find table with id = "form:DPDataTable_data"
  const table = await driver.wait(
    until.elementLocated({ id: 'form:DPDataTable_data' }),
    10000,
  );

  // search through table rows
  const rows = await table.findElements(By.css('tr'));

  const resultPayments: SegSocialPaymentData[] = [];

  for (const row of rows) {
    const cells = await row.findElements(By.css('td'));

    const type = await cells[0].getText();
    const state = await cells[1].getText();
    const documentNumber = await cells[2].getText();
    const expirationDate = DateTime.fromISO(await cells[3].getText());
    const valueAmount = await cells[4].getText();

    resultPayments.push({
      type,
      state,
      documentNumber,
      expirationDate,
      valueAmount,
    });
  }

  return resultPayments;
};

// example of table row:
// <tr data-ri="0" class="ui-widget-content ui-datatable-even resultado" role="row"><td role="gridcell" style="text-align: left;" class="texto"><span id="form:DPDataTable:0:descLongaTipoDP"><font style="vertical-align: inherit;"><font style="vertical-align: inherit;">Automatic doc. contributions...</font></font></span></td><td role="gridcell" style="text-align: left;" class="texto"><font style="vertical-align: inherit;"><font style="vertical-align: inherit;">Payment</font></font></td><td role="gridcell" style="text-align: right;" class="numero"><font style="vertical-align: inherit;"><font style="vertical-align: inherit;">77047569</font></font></td><td role="gridcell" style="text-align: left;" class="data"><font style="vertical-align: inherit;"><font style="vertical-align: inherit;">2024-09-02</font></font></td><td role="gridcell" style="text-align: right;" class="moeda"><font style="vertical-align: inherit;"><font style="vertical-align: inherit;">596.58</font></font></td><td role="gridcell" style="text-align: left;" class="acoes"><span id="form:DPDataTable:0:acoes" class="ui-menubutton"><button id="form:DPDataTable:0:acoes_button" name="form:DPDataTable:0:acoes_button" type="button" class="ui-button ui-widget ui-state-default ui-corner-all ui-button-text-icon-left" role="button" aria-disabled="false"><span class="ui-button-icon-left ui-icon ui-c ui-icon-triangle-1-s"></span><span class="ui-button-text ui-c"><font style="vertical-align: inherit;"><font style="vertical-align: inherit;">Actions</font></font></span></button></span></td></tr>

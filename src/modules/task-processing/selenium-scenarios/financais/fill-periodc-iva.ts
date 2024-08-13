import { WebDriver, until, Actions } from 'selenium-webdriver';
import { goPage } from '../default.scenarios';

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
}

// <div role="document" class="modal-content modal-content-primary-alt"><div class="modal-header"><h4 class="modal-title modal-header-title"><button type="button" aria-label="Close" class="close"><span aria-hidden="true">×</span></button><!----><lf-modal-header><p>Assistente de Pré-Preenchimento</p></lf-modal-header></h4></div><!----><div class="modal-body"><lf-modal-body><!----><div><p> Para efetuar o preenchimento da sua declaração de forma simples e rápida, pode optar pelo pré-preenchimento dos campos das transmissões de bens e prestações de serviços com imposto liquidado. </p><p> Caso não pretenda estes campos preenchidos deve fechar este 'Assistente' através do botão 'Fechar'. </p></div><lf-form path="prePreenchimentoWizard" class="lf-value"><form novalidate="" name="/prePreenchimentoWizard" class="ng-untouched ng-pristine ng-valid"><div class="row content-header"><div class="top-main-container"><div class="table-main-title"><h4 class="main-header-tabno align-center"></h4><h4 class="main-header-title"></h4><div class="side-help help-btn-shortcut"><!----></div></div></div></div><div class="form-wrapper"><div class="content-divider"><lf-panel code="1"><div class="panel"><div class="panel-header"><h5 class="panel-code pull-left">1</h5><!----><h5 class="panel-title"><lf-panel-header><p>Sujeito Passivo</p></lf-panel-header></h5><!----></div><div class="panel-body"><lf-panel-body><div class="row"><div class="col-sm-5"><lf-nif path="nif" class="lf-value lf-focusable-value"><div class="form-group form-group-sm"><lf-help-label><label class="input-title" for="undefined"><!----> Número de Identificação Fiscal <!----></label><!----><!----></lf-help-label><!----><!----><div tabindex="-1" class="input-group input-group-sm"><!----><input type="text" mask="000000000" autocomplete="off" class="form-control input-sm" name="/prePreenchimentoWizard/nif" maxlength="9"></div><!----><!----><!----><!----></div><!----><!----><!----><!----></lf-nif><!----></div><div class="col-sm-4"><lf-select path="localizacaoSede" class="lf-value lf-focusable-value"><div class="form-group form-group-sm"><lf-help-label><label class="input-title" for="undefined"><!----> Localização da Sede <!----></label><!----><!----></lf-help-label><!----><!----><div tabindex="-1" class="input-group input-group-sm"><!----><fieldset tabindex="-1"><ng-select bindlabel="label" bindvalue="value" appendto="body" class="ng-select ng-select-single ng-select-searchable ng-select-clearable ng-untouched ng-pristine ng-valid"><div class="ng-select-container ng-has-value"><div class="ng-value-container"><div class="ng-placeholder"></div><div class="ng-value"><!----><span aria-hidden="true" class="ng-value-icon left">×</span><span class="ng-value-label">Continente</span><!----></div><!----><!----><!----><!----><div role="combobox" aria-haspopup="listbox" class="ng-input" aria-expanded="false"><input aria-autocomplete="list" type="text" autocorrect="off" autocapitalize="off" autocomplete="a2f2468eee6d"></div></div><!----><span class="ng-clear-wrapper" title="Clear all"><span aria-hidden="true" class="ng-clear">×</span></span><!----><span class="ng-arrow-wrapper"><span class="ng-arrow"></span></span></div><!----></ng-select></fieldset></div><!----><!----><!----><!----></div><!----><!----><!----><!----></lf-select><!----></div></div></lf-panel-body></div><!----></div><!----><!----></lf-panel><lf-panel code="2"><div class="panel"><div class="panel-header"><h5 class="panel-code pull-left">2</h5><!----><h5 class="panel-title"><lf-panel-header><p>Período</p></lf-panel-header></h5><!----></div><div class="panel-body"><lf-panel-body><div class="row"><div class="col-sm-4"><lf-select path="anoDeclaracao" class="lf-value lf-focusable-value"><div class="form-group form-group-sm"><lf-help-label><label class="input-title" for="undefined"><!----> Ano <!----></label><!----><!----></lf-help-label><!----><!----><div tabindex="-1" class="input-group input-group-sm"><!----><fieldset tabindex="-1"><ng-select bindlabel="label" bindvalue="value" appendto="body" class="ng-select ng-select-single ng-select-searchable ng-select-clearable ng-untouched ng-pristine ng-valid"><div class="ng-select-container ng-has-value"><div class="ng-value-container"><div class="ng-placeholder"></div><div class="ng-value"><!----><span aria-hidden="true" class="ng-value-icon left">×</span><span class="ng-value-label">2024</span><!----></div><!----><!----><!----><!----><div role="combobox" aria-haspopup="listbox" class="ng-input" aria-expanded="false"><input aria-autocomplete="list" type="text" autocorrect="off" autocapitalize="off" autocomplete="acdb788b9569"></div></div><!----><span class="ng-clear-wrapper" title="Clear all"><span aria-hidden="true" class="ng-clear">×</span></span><!----><span class="ng-arrow-wrapper"><span class="ng-arrow"></span></span></div><!----></ng-select></fieldset></div><!----><!----><!----><!----></div><!----><!----><!----><!----></lf-select><!----></div><div class="col-sm-5"><lf-select path="periodoDeclaracao" class="lf-value lf-focusable-value"><div class="form-group form-group-sm"><lf-help-label><label class="input-title" for="undefined"><!----> Período declarativo <!----></label><!----><!----></lf-help-label><!----><!----><div tabindex="-1" class="input-group input-group-sm"><!----><fieldset tabindex="-1"><ng-select bindlabel="label" bindvalue="value" appendto="body" class="ng-select ng-select-single ng-select-searchable ng-select-clearable ng-pristine ng-valid ng-select-bottom ng-touched"><div class="ng-select-container ng-has-value"><div class="ng-value-container"><div class="ng-placeholder"></div><div class="ng-value"><!----><span aria-hidden="true" class="ng-value-icon left">×</span><span class="ng-value-label">2º. Trimestre</span><!----></div><!----><!----><!----><!----><div role="combobox" aria-haspopup="listbox" class="ng-input" aria-expanded="false"><input aria-autocomplete="list" type="text" autocorrect="off" autocapitalize="off" autocomplete="a98f7016c555"></div></div><!----><span class="ng-clear-wrapper" title="Clear all"><span aria-hidden="true" class="ng-clear">×</span></span><!----><span class="ng-arrow-wrapper"><span class="ng-arrow"></span></span></div><!----></ng-select></fieldset></div><!----><!----><!----><!----></div><!----><!----><!----><!----></lf-select><!----></div></div></lf-panel-body></div><!----></div><!----><!----></lf-panel><!----></div><!----></div></form><!----><lf-modal><div tabindex="-1" role="dialog" aria-hidden="true" class="modal fade"><div class="modal-dialog"><div role="document" class="modal-content modal-content-primary-alt"><div class="modal-header"><h4 class="modal-title modal-header-title"><!----><lf-modal-header> Adicionar undefined </lf-modal-header></h4></div><!----><div class="modal-body"><lf-modal-body><lf-alert><div role="alert" class="alert alert-danger"><button type="button" aria-label="closeTitleText" class="close" title="Fechar"><span aria-hidden="true">×</span></button><!----><ul><li lfvalidationissue="" class="validation-error"><p>O titulo do formulário encontra-se duplicado.</p>
// </li><!----></ul></div><!----><!----><!----></lf-alert><!----></lf-modal-body></div><div class="modal-footer"><lf-modal-footer><lf-button><button class="btn btn-default btn-md" type="button"><!----><!----><span class="btn-text"><lf-i18n key="cancelText">Cancelar</lf-i18n></span></button><!----><!----></lf-button><lf-button><button class="btn btn-md btn-primary" type="button"><!----><!----><span class="btn-text"><lf-i18n key="addText">Adicionar</lf-i18n></span></button><!----><!----></lf-button></lf-modal-footer></div><!----></div></div></div><!----><!----></lf-modal><!----><!----><!----></lf-form></lf-modal-body></div><div class="modal-footer"><lf-modal-footer><lf-button size="sm"><button class="btn btn-secondary btn-sm" type="button"><!----><!----><span class="btn-text">Fechar </span></button><!----><!----></lf-button><lf-button size="sm"><button class="btn btn-primary btn-sm" type="button"><!----><!----><span class="btn-text">Pré-Preencher </span></button><!----><!----></lf-button></lf-modal-footer></div><!----></div>
export const fillPeriodicIVA = async (
  driver: WebDriver,
  data: FillPeriodIVAInput,
) => {
  await driver.sleep(2000);

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

  // find modal woith text Assistente de Pré-Preenchimento
  const preFillModalText = await driver.wait(
    until.elementLocated({
      xpath: "//p[contains(text(), 'Assistente de Pré-Preenchimento')]",
    }),
    10000,
  );

  // find parent modal with role=document
  const preFillModal = await preFillModalText.findElement({
    xpath: "ancestor::div[@role='document']",
  });

  // find periodo declarativo select
  const periodoDeclarativoSelect = await preFillModal.findElement({
    xpath: "//lf-select[@path='periodoDeclaracao']//input",
  });

  // wait for select to be clickable
  await driver.wait(until.elementIsVisible(periodoDeclarativoSelect), 10000);

  // click on select
  // await periodoDeclarativoSelect.click().perform()
  await driver.actions().click(periodoDeclarativoSelect).perform();

  // select Xº. Trimestre, where x = data.quarter
  const quarterOption = await driver.findElement({
    xpath: `//div[contains(text(), '${data.quarter}º. Trimestre')]/..`,
  });

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

  console.log('lol');
};

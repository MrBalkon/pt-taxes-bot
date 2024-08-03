import axios from "axios";
import fetch from "node-fetch";
import { WebDriver } from "selenium-webdriver"
//

// <option label="Emitido" value="string:E">Emitido</option>
// <option label="Anulado" value="string:A">Anulado</option>
// <option label="Sem Preenchimento" value="string:S">Sem Preenchimento</option>
export enum DownloadFinancaisFaturaTableCSituaca {
	EMITIDO = "E",
	ACEITE = "A",
	SEM_PREENCHIMENTO = "S"
}

// <option label="Fatura-Recibo" value="string:R|FR">Fatura-Recibo</option>
// <option label="Fatura-Recibo Ato Isolado" value="string:A|FRI">Fatura-Recibo Ato Isolado</option>
// <option label="Fatura" value="string:FTR|FT">Fatura</option>
// <option label="Fatura Ato Isolado" value="string:FTA|FTI">Fatura Ato Isolado</option>
// <option label="Recibo" value="string:RPR|RG">Recibo</option>
// <option label="Recibo Ato Isolado" value="string:RPA|RGI">Recibo Ato Isolado</option>
export enum DownloadFinancaisFaturaTableTipoRecibo {
	FATURA_RECIBO = "R|FR",
	FATURA_RECIBO_ATO_ISOLADO = "A|FRI",
	FATURA = "FTR|FT",
	FATURA_ATO_ISOLADO = "FTA|FTI",
	RECIBO = "RPR|RG",
	RECIBO_ATO_ISOLADO = "RPA|RGI"
}

export interface DownloadFinancaisFaturaTable {
	nif: string
	dataEmissaoInicio: string
	dataEmissaoFim: string
	cSituaca: DownloadFinancaisFaturaTableCSituaca
	tipoRecibo: DownloadFinancaisFaturaTableTipoRecibo
}

export const downloadFinancais = async (driver: WebDriver, args: DownloadFinancaisFaturaTable) => {
	const cookies = await driver.manage().getCookies()
	const userAgent = await driver.executeScript('return navigator.userAgent')
	const cookieString = cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ')

	const headers = {
		"Referer": "https://irs.portaldasfinancas.gov.pt/recibos/portal/consultar",
		"Cookie": cookieString,
		"User-Agent": userAgent as string,
		"Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
		"Accept-Language": "en-US,en;q=0.9",
		"Accept-Encoding": "gzip, deflate, br, zstd",
		// "Content-Type": "application/x-www-form-urlencoded",
		"Connection": "keep-alive",
		"Sec-Fetch-Dest": "navigate",
		"Sec-Fetch-Mode": "navigate",
		"Sec-Fetch-Site": "same-origin",
		"Sec-Fetch-User": "?1",
		"Upgrade-Insecure-Requests": "1",
		"sec-ch-ua": `"Not/A)Brand";v="99", "Chromium";v="99", "Google Chrome";v="99"`,
		"sec-ch-ua-mobile": "?0",
		"sec-ch-ua-platform": "macOS"
	}

	//https://irs.portaldasfinancas.gov.pt/recibos/portal/consultar/exportConsulta?modoConsulta=Prestador&nifPrestadorServicos=315300752&isAutoSearchOn=on&dataEmissaoInicio=2023-08-02&dataEmissaoFim=2024-08-02&cSituaca=E&tipoRecibo=R%7CFR&tipoPesquisa=1&tableSize=5&offset=0
	const query = {
		modoConsulta: "Prestador",
		nifPrestadorServicos: args.nif,
		isAutoSearchOn: "on",
		dataEmissaoInicio: args.dataEmissaoInicio,
		dataEmissaoFim: args.dataEmissaoFim,
		cSituaca: args.cSituaca,
		tipoRecibo: args.tipoRecibo,
		tipoPesquisa: "1",
		tableSize: "50",
		offset: "0"
	}

	const url = `https://irs.portaldasfinancas.gov.pt/recibos/portal/consultar/exportConsulta?${new URLSearchParams(query).toString()}`
	const response = await axios(url, { headers, responseType: 'arraybuffer' })

	// get utf8 string
	return (new TextDecoder('iso-8859-1')).decode(response.data)
}
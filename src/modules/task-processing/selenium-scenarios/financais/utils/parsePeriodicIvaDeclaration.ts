// example file:
// <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
// <dpiva xmlns="http://www.at.gov.pt/schemas/dpiva" version="06">
// <rosto>
// 	<apuramento>
// 		<btBensUETotal>0</btBensUETotal>
// 		<btTaxaNormal>1593000</btTaxaNormal>
// 		<btTotal>1593000</btTotal>
// 		<ivaAEntregar>352921</ivaAEntregar>
// 		<ivaARecuperar>0</ivaARecuperar>
// 		<ivaBensUETotal>0</ivaBensUETotal>
// 		<ivaDedutivelAnexosRTotal>0</ivaDedutivelAnexosRTotal>
// 		<ivaDedutivelImobilizado>7696</ivaDedutivelImobilizado>
// 		<ivaDedutivelOutros>5773</ivaDedutivelOutros>
// 		<ivaDedutivelTotal>13469</ivaDedutivelTotal>
// 		<ivaFavorEstadoTotal>366390</ivaFavorEstadoTotal>
// 		<ivaFavorSujPassivoTotal>13469</ivaFavorSujPassivoTotal>
// 		<ivaTaxaNormal>366390</ivaTaxaNormal>
// 		<temOperacoesAdquirenteComLiqImposto>02</temOperacoesAdquirenteComLiqImposto>
// 	</apuramento>
// 	<desenvolvimento>
// 		<totalQuadro06A>0</totalQuadro06A>
// 	</desenvolvimento>
// 	<inicio>
// 		<anoDeclaracao>2024</anoDeclaracao>
// 		<apresentouDeclRecapitulativa>false</apresentouDeclRecapitulativa>
// 		<atividadesImobiliarias>false</atividadesImobiliarias>
// 		<localizacaoSede>1</localizacaoSede>
// 		<nif>315300752</nif>
// 		<periodoDeclaracao>06T</periodoDeclaracao>
// 		<prazo>1</prazo>
// 		<temAnexoRAcores>false</temAnexoRAcores>
// 		<temAnexoRContinente>false</temAnexoRContinente>
// 		<temAnexoRMadeira>false</temAnexoRMadeira>
// 	</inicio>
// </rosto>
// </dpiva>

import { XMLParser, XMLBuilder, XMLValidator } from 'fast-xml-parser';

export interface PeriodicIvaDeclaration {
  dpiva: {
    '@_xmlns': string;
    '@_version': string;
    rosto: {
      apuramento: {
        btBensUETotal: string;
        btTaxaNormal: string;
        btTotal: string;
        ivaAEntregar: string;
        ivaARecuperar: string;
        ivaBensUETotal: string;
        ivaDedutivelAnexosRTotal: string;
        ivaDedutivelImobilizado: string;
        ivaDedutivelOutros: string;
        ivaDedutivelTotal: string;
        ivaFavorEstadoTotal: string;
        ivaFavorSujPassivoTotal: string;
        ivaTaxaNormal: string;
        temOperacoesAdquirenteComLiqImposto: string;
      };
      desenvolvimento: {
        totalQuadro06A: string;
      };
      inicio: {
        anoDeclaracao: string;
        apresentouDeclRecapitulativa: string;
        atividadesImobiliarias: string;
        localizacaoSede: string;
        nif: string;
        periodoDeclaracao: string;
        prazo: string;
        temAnexoRAcores: string;
        temAnexoRContinente: string;
        temAnexoRMadeira: string;
      };
    };
  };
}

export const parsePeriodicIvaDeclaration = async (xmlStr: string) => {
  const options = {
    attributeNamePrefix: '',
    ignoreAttributes: false,
    parseNodeValue: true,
    parseAttributeValue: true,
    trimValues: true,
    arrayMode: false,
    stopNodes: ['parse-me-as-string'],
  };

  const parser = new XMLParser(options);
  const jsonObj = parser.parse(xmlStr) as PeriodicIvaDeclaration;
  return jsonObj.dpiva;
};

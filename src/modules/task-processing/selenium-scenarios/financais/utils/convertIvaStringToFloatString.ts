// iva = 123123 => 1231.23
// iva = 123 => 1.23
// iva = 1 => 0.01
// iva = 0 => 0.00

export const convertIvaStringToFloatString = (ivaStr: string) => {
  if (ivaStr.length === 1) {
    return `0.0${ivaStr}`;
  }
  if (ivaStr.length === 2) {
    return `0.${ivaStr}`;
  }
  return `${ivaStr.slice(0, -2)}.${ivaStr.slice(-2)}`;
};

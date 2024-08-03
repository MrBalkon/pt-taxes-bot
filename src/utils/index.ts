export const group = (fn) => (xs) => Object .values (
	xs .reduce ((a, x, _, __, k = fn (x)) => ((a [k] = [... a [k] || [], x]), a), {})
  )

export const sum = (ns) => ns .reduce ((a, b) => a + b, 0)
export const sumFloats = (ns) => ns .reduce ((a, b) => (parseFloat(a) + parseFloat(b)).toFixed(2), 0)

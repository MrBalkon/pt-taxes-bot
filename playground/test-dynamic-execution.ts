'use strict';
import fetch from 'node-fetch'

const otherNumber = 4

const functionCode = `
	'use strict';
	// fetch example.com
	// const result = await context.fetch('https://example.com')
	// const json = await result.text()
	// process.exit()
	// console.log(json)
	// return json
	console.log(123)
	process.exit(1)
	console.log(444)
`

const context = {
	a: 1,
	b: 2,
	fetch,
}

const AsyncFuncion = Object.getPrototypeOf(async function(){}).constructor

const funct = new AsyncFuncion('context', functionCode);

const evalFunc = async (context: any) => {
	'use strict';
	return await eval(functionCode)
}

const main = async () => {
	'use strict';
	console.log(funct(context))
	console.log('done')
}

main()
import { Input }  from "./Input"
import { Output }  from "./Output"
import { CardFunc } from "./CardFunc"
import { PayFunc } from "./PayFunc"

export async function process(input: Input): Promise<Output> {
	const pf = await PayFunc.create(input.key)
	const cf = await CardFunc.create(pf.merchant.option.card as string)
	return {
		merchant: pf.merchant.name,
		account: await Promise.all(input.account
			.map(a => cf.create(a))
			.map(async a => pf.create(await a)))
	}
}


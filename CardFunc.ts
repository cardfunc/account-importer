import * as gracely from "gracely"
import * as cardfunc from "@cardfunc/model"
import * as payfunc from "@payfunc/model"
import { AccountData } from "./AccountData"
import { Service } from "./Service"

export class CardFunc {
	get merchant(): cardfunc.Merchant.Key { return this.service.merchant }
	private constructor(private readonly service: Service<cardfunc.Merchant.Key>) { }
	async create(account: AccountData): Promise<payfunc.Account.Creatable | gracely.Error> {
		const body: cardfunc.Authorization.Creatable = {
			...account,
			account: "create",
		}
		if (!cardfunc.Authorization.Creatable.is(body))
			console.error("Not a valid Authorization.Creatable", JSON.stringify(body))
		const response = await this.service.post<cardfunc.Authorization>("authorization", body)
		return gracely.Error.is(response) ? response :
			{
				number: response.number,
				method: [
					{
						type: "card",
						scheme: response.card.scheme,
						iin: response.card.iin,
						last4: response.card.last4,
						expires: response.card.expires,
						reference: response.card.account ?? "",
					}
				]
			}
	}
	static async create(key: string): Promise<CardFunc> {
		return new CardFunc(await Service.create(key))
	}
}

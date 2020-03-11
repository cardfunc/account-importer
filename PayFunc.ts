import * as gracely from "gracely"
import * as payfunc from "@payfunc/model"
import { Service } from "./Service"

export class PayFunc {
	get merchant(): payfunc.Merchant.Key { return this.service.merchant }
	private constructor(private readonly service: Service<payfunc.Merchant.Key>) { }
	async create(account: payfunc.Account.Creatable | gracely.Error): Promise<payfunc.Account | gracely.Error> {
		return gracely.Error.is(account) ? account : this.service.post<payfunc.Account>("account", account)
	}
	static async create(key: string): Promise<PayFunc> {
		return new PayFunc(await Service.create(key))
	}
}

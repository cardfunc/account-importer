import * as gracely from "gracely"
import * as payfunc from "@payfunc/model"

export interface Output {
	merchant: string
	account: (payfunc.Account | gracely.Error)[]
}

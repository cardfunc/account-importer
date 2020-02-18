import * as authly from "authly"
import * as model from "@cardfunc/model"

export interface Authorization extends model.Authorization {
	merchant: authly.Identifier,
}
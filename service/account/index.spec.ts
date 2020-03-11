import * as dotenv from "dotenv"
dotenv.config()

import * as model from "@payfunc/model"
import * as card from "@cardfunc/model"
import { create as accountCreate } from "./create"
import { create as authorizationCreate } from "../authorization/create"
import { AccountInput } from "../../model/AccountInput"

describe("test-create", () => {
	it("create test", async () => {
		expect(model.Account.is(await accountCreate(process.env.accountApiKeySecret ? process.env.accountApiKeySecret : "", "test", {
			"number": "abcd",
			"method": [
				{
					"reference": "abc.def.ghi",
					"type": "card",
					"scheme": "visa",
					"iin": "411111",
					"last4": "1111",
					"expires": [
						2,
						22
					]
				}
			]
		})))
	})
	it("both test", async () => {
		if (process.env.accountApiKeySecret && process.env.authorizationApiKeySecret) {
			const auth = await authorizationCreate(process.env.authorizationApiKeySecret, "test", { "number": "abcd", "pan": "411111111111", "month": 5, "year": 24, "csc": "987", "pares": "an.example.pares" })
			if (AccountInput.is(auth))
				expect(model.Account.is(await accountCreate(process.env.accountApiKeySecret, "test", auth)))
		}
	})
})

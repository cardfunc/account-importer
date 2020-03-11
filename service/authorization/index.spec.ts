import * as dotenv from "dotenv"
dotenv.config()

import { create } from "./create"
import { AccountInput } from "../../model/AccountInput"

describe("test-create", () => {
	it("create test", async () => {
		expect(await create(process.env.authorizationApiKeySecret ? process.env.authorizationApiKeySecret : "", "test", { "number": "abcd", "pan": "411111111111", "month": 5, "year": 24, "csc": "987", "pares": "an.example.pares" })).toEqual(
			{
				"id": expect.any(String),
				"number": "import-abcd",
				"card": {
					"id": expect.any(String),
					"scheme": expect.any(String),
					"iin": expect.any(String),
					"last4": expect.any(String),
					"expires": [
						expect.any(Number),
						expect.any(Number)
					],
					"account": expect.any(String)
				},
				"reference": expect.any(String),
				"capture": [],
				"refund": [],
				"created": expect.any(String),
			}
		)
	})
	it("create test", async () => {
		expect(AccountInput.is(await create(process.env.authorizationApiKeySecret ? process.env.authorizationApiKeySecret : "", "test", { "number": "abcd", "pan": "411111111111", "month": 5, "year": 24, "csc": "987", "pares": "an.example.pares" })))
	})
})

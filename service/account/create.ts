import { default as fetch } from "node-fetch"
import * as authly from "authly"
import * as model from "@payfunc/model"
import * as card from "@cardfunc/model"
import * as gracely from "gracely"
import { AccountInput } from "../../model/AccountInput"

const verifier = authly.Verifier.create("public")

export async function create(key: authly.Token, numberInput: string, input: model.Account.Creatable | AccountInput): Promise<string | model.Account | authly.Token | gracely.Error> {
	let result: model.Account | gracely.Error
	const accountKey = authly.Token.is(key) && verifier && await verifier.verify(key) || undefined
	if (!input)
		result = gracely.client.malformedContent("authorizationInput", "AuthorizationInput", "Not a valid authorization input")
	else if (!accountKey)
		result = gracely.client.malformedContent("type", `"authorization"`, "Authorization is invalid for the current API key.")
	else {
		const request: model.Account.Creatable = model.Account.Creatable.is(input) ? input : {
			number: input.number,
			method: [{
				type: "card",
				scheme: input.card.scheme,
				iin: input.card.iin,
				last4: input.card.last4,
				expires: input.card.expires,
				reference: input.card.account,
			}],
		}
		const response = await fetch(accountKey.iss + "/account", {
			method: "POST",
			headers: {
				"Content-Type": "application/json; charset=utf-8",
				"Accept": "application/json; charset=utf-8",
				"authorization": `Bearer ${ key }`
			},
			body: JSON.stringify(request)
		})
		let account: model.Account | gracely.Error | undefined
		account = !response.ok ? createErrorReference(numberInput) : await response.json()
		result = gracely.Error.is(account) || model.Account.is(account) ? account : createErrorReference(numberInput)
	}
	return result
}

function createErrorReference(numberInput: string): gracely.Error {
	return gracely.client.malformedContent("number", "string", numberInput)
}

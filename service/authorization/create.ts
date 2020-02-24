import { default as fetch } from "node-fetch"
import * as authly from "authly"
import * as model from "@cardfunc/model"
import * as gracely from "gracely"
import { AuthorizationInput } from "../../model/AuthorizationInput"

const verifier = authly.Verifier.create("public")

export async function create(key: authly.Token, numberInput: string, input: any[] | AuthorizationInput): Promise<model.Authorization | authly.Token | gracely.Error> {
	let result: model.Authorization | authly.Token | gracely.Error
	const authorizationKey = authly.Token.is(key) && verifier && await verifier.verify(key) || undefined
	const data = AuthorizationInput.is(input) ? input : AuthorizationInput.objectify(input)
	if (!data)
		result = gracely.client.malformedContent("authorizationInput", "AuthorizationInput", "Not a valid authorization input")
	else if (!authorizationKey)
		result = gracely.client.malformedContent("type", `"authorization"`, "Authorization is invalid for the current API key.")
	else {
		const request: model.Authorization.Creatable = {
			number: "import-" + data.number,
			card: {
				pan: data.pan,
				expires: [
					data.month,
					data.year,
				],
				csc: "xxx",
			},
			account: "create",
			pares: "<insert correct pares here>",
		}
		const response = await fetch(authorizationKey.iss + "/authorization", {
			method: "POST",
			headers: {
				"Content-Type": "application/json; charset=utf-8",
				Accept: "application/json; charset=utf-8",
				authorization: `Bearer ${ key }`
			},
			body: JSON.stringify(request)
		})
		let authorization: model.Authorization | gracely.Error | undefined
		let signed: authly.Token | undefined
		switch (response.headers.get("content-type")) {
			case "application/json; charset=utf-8":
				authorization = await response.json() as gracely.Error | model.Authorization
				break
			case "application/jwt; charset=utf-8":
				signed = await response.text() as authly.Token
				authorization = await model.Authorization.verify(signed)
				break
			default:
				authorization = gracely.server.backendFailure("Unexpected answer from CardFunc.")
				break
		}
		result = gracely.Error.is(authorization) ? createErrorReference(numberInput) : authorization ? authorization : createErrorReference(numberInput)
	}
	if (!model.Authorization.is(result))
		result = createErrorReference(numberInput)
	return result
}

function createErrorReference(numberInput: string): gracely.Error {
	return gracely.client.malformedContent("number", "string", numberInput)
}

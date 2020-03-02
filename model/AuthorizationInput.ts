import * as authly from "authly"
import * as gracely from "gracely"
import * as model from "@cardfunc/model"

export interface AuthorizationInput {
	number: string,
	pan: model.Card.Pan,
	month: model.Card.Expires.Month,
	year: model.Card.Expires.Year,
	csc: string,
	pares: authly.Token,
}

export namespace AuthorizationInput {
	export function objectify(input: any[]): AuthorizationInput | undefined {
		return input.length >= 6 ? {
			number: input[0],
			pan: input[1],
			month: Number.parseInt(input[2]) as model.Card.Expires.Month,
			year: Number.parseInt(input[3]) as model.Card.Expires.Year,
			csc: input[4],
			pares: input[5] as authly.Token,
		} : undefined
	}
	export function is(value: AuthorizationInput | any): value is AuthorizationInput {
		return typeof(value) == "object" &&
			typeof(value.number) == "string" &&
			model.Card.Pan.is(value.pan) &&
			model.Card.Expires.Month.is(value.month) &&
			model.Card.Expires.Year.is(value.year) &&
			typeof(value.csc) == "string" && value.csc.length == 3 &&
			authly.Token.is(value.pares)
	}
	export function flaw(value: AuthorizationInput | any): gracely.Flaw {
		return {
			type: "model.AuthorizationInput",
			flaws: typeof value != "object" ? undefined :
				[
					typeof(value.number) == "string" || { property: "number", type: "string" },
					model.Card.Pan.is(value.pan) || { property: "pan", type: "Card.Pan" },
					model.Card.Expires.Month.is(value.month) || { property: "expires.month", type: "Card.Expires.Month" },
					model.Card.Expires.Year.is(value.year) || { property: "expires.year", type: "Card.Expires.Year" },
					typeof(value.csc) == "string" && value.csc.length == 3 || { property: "csc", type: "string" },
					authly.Token.is(value.pares) || { property: "pares", type: "authly.Token" },
				].filter(gracely.Flaw.is) as gracely.Flaw[],
		}
	}
	export async function verify(token: authly.Token): Promise<AuthorizationInput | undefined> {
		const result = await model.Authorization.verify(token)
		return is(result) ? result : undefined
	}
}

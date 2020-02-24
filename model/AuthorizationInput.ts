import * as authly from "authly"
import * as model from "@cardfunc/model"

export interface AuthorizationInput {
	number: string,
	pan: model.Card.Pan,
	month: model.Card.Expires.Month,
	year: model.Card.Expires.Year,
}

export namespace AuthorizationInput {
	export function objectify(input: any[]): AuthorizationInput | undefined {
		return input.length > 3 ? {
			number: input[0],
			pan: input[1],
			month: Number.parseInt(input[2]) as model.Card.Expires.Month,
			year: Number.parseInt(input[3]) as model.Card.Expires.Year,
		} : undefined
	}
	export function is(value: AuthorizationInput | any): value is AuthorizationInput {
		return typeof(value) == "object" &&
			(typeof(value.number) == "string") &&
			model.Card.Pan.is(value.pan) &&
			model.Card.Expires.Month.is(value.month) &&
			model.Card.Expires.Year.is(value.year)
	}
	export async function verify(token: authly.Token): Promise<AuthorizationInput | undefined> {
		const result = await model.Authorization.verify(token)
		return is(result) ? result : undefined
	}
}

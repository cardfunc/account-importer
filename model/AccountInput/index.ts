import * as authly from "authly"
import * as model from "@payfunc/model"
import { Card as InputCard } from "./card"

export interface AccountInput {
	number: string,
	card: InputCard,
}

export namespace AccountInput {
	export function is(value: AccountInput | any): value is AccountInput {
		return typeof(value) == "object" &&
			typeof(value.number) == "string" &&
			Card.is(value.card)
	}
	export async function verify(token: authly.Token): Promise<AccountInput | undefined> {
		const result = await model.Account.Method.verify(token)
		return is(result) ? result : undefined
	}
	export type Card = InputCard
	export namespace Card {
		// tslint:disable-next-line: no-shadowed-variable
		export const is = InputCard.is
	}
}

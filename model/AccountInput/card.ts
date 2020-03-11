import * as authly from "authly"
import * as card from "@cardfunc/model"

export interface Card {
	account: authly.Token,
	scheme: card.Card.Scheme,
	iin: string,
	last4: string,
	expires: card.Card.Expires,
}

export namespace Card {
	export function is(value: Card | any): value is Card {
		return typeof value == "object" &&
			authly.Token.is(value.account) &&
			card.Card.Scheme.is(value.scheme) &&
			typeof value.iin == "string" && value.iin.length == 6 &&
			typeof value.last4 == "string" && value.last4.length == 4 &&
			card.Card.Expires.is(value.expires)
	}
}

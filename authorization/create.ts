import * as gracely from "gracely"
import * as model from "@cardfunc/model"
import * as service from "../service"

export async function create(authorization: model.Authorization, orderId: string, order: model.Order.Creatable | model.Order): Promise<model.Order | gracely.Error> {
	let result: gracely.Error //model.Order | gracely.Error
	/*switch (order.payment.type) {
		case "card":
			result = await service.card.payment.create(merchant, orderId, order)
			break
		case "invoice":
		case "installment":
			result = await service.mash.payment.create(merchant, orderId, order)
			break
		case "defer":
			result = await service.defer.payment.create(merchant, orderId, order)
			break
		case "swish":
			result = await service.swish.payment.create(merchant, orderId, order)
			break
		default:
			result = gracely.client.malformedContent("order.payment.type", "Payment.Type", "Unable to handle payments of the given type.")
			break
	}*/
	return result
}
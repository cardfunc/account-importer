import * as model from "@cardfunc/model"
import * as authorization from "../service/authorization"
import { AuthorizationInput } from "../model/AuthorizationInput"
import * as gracely from "gracely"
import * as isoly from "isoly"
import * as fs from 'fs'

export async function executeCommands(command: string[] | undefined): Promise<string> {
	if (command) {
		if (command.length == 2) {
			if (!fs.existsSync(command[0]))
				return "input file doesn't exist"
			const data = fs.readFileSync(command[0])
			if (!data) {
				return "Can't read input file: " + command[0]
			}
			else {
				const folder = command[1]
				if (!fs.existsSync(folder)) {
					return "Can't find output folder."
				}
				const parsedData: any[] = JSON.parse(data.toString())
				const importKey = parsedData[0].importKey
				if (!importKey) {
					return "First object in import array needs to be import key in format: { \"importKey\": <key> }"
				}
				const promisesArray: Promise<any>[] = []
				parsedData.forEach(element => {
					if (!element.importKey && AuthorizationInput.is(element)) {
						element = element as AuthorizationInput
						const numberInput = element.number
						element.month = Number.parseInt(element.month) as model.Card.Expires.Month
						element.year = Number.parseInt(element.year) as model.Card.Expires.Year
						promisesArray.push(authorization.create(importKey, numberInput, element))
					}
					else {
						promisesArray.push(authorization.create("", (element && element.length && element.length > 1) ? element[0] : "should fail: import key object", element))
					}
				})
				const okOutput: model.Authorization[] = []
				const errorOutput: any[] = []
				return Promise.resolve(Promise.all(promisesArray).then((promised: any[]) => {
					promised.forEach(element => {
						const reducedElement = {
							...element,
							reference: undefined,
							created: undefined,
							refund: undefined,
							capture: undefined,
						}
						if (!gracely.Error.is(element) && model.Authorization.is(element))
							okOutput.push(reducedElement)
						else
							errorOutput.push({ status: "failed import", number: reducedElement.content.description })
					})
					const timeStamp = isoly.DateTime.localize(isoly.DateTime.parse(isoly.DateTime.now()), "sv")
					if (fs.existsSync(folder + "exported.txt"))
						fs.renameSync(folder + "exported.txt", folder + "OLD_exported_" + timeStamp + ".txt")
					fs.writeFileSync(folder + "exported.txt", JSON.stringify(okOutput, undefined, 1))
					if (fs.existsSync(folder + "errors.txt"))
						fs.renameSync(folder + "errors.txt", folder + "OLD_errors_" + timeStamp + ".txt")
					fs.writeFileSync(folder + "errors.txt", JSON.stringify(errorOutput, undefined, 1))
					if (errorOutput.length > 0)
						return "Successfully imported card data, some errors have been reported to output file errors.txt"
					else
						return "Successfully imported card data"
				}).catch(() => {
					return "error thrown when importing"
				}))
			}
		}
		else {
			return "--addjsonfile (-f) command require two arguments, see help with -h argument for more information."
		}
	}
	else
		return "command is undefined"
}

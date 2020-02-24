#!/usr/bin/env node
import * as dotenv from "dotenv"
dotenv.config()
import * as commander from "commander"
import * as model from "@cardfunc/model"
import * as authorization from "./service/authorization"
import { AuthorizationInput } from "./model/AuthorizationInput"
import * as gracely from "gracely"
import * as isoly from "isoly"
import * as fs from 'fs'

function fileNames(value: string, dummyPrevious: string) {
	return value.split(" ").filter(Boolean)
}

commander.option("-t, --test <input>", "Write something to echo")
commander.option("-f, --addjsonfile, <items>", "import a json list of cards from a file, specify input filename and output filefolder within one pair of quotation marks (Example parameters: -f \"input.txt output/\")", fileNames)

commander.parse(process.argv)

if (commander.addjsonfile !== undefined) {
	if (commander.addjsonfile.length == 2) {
		fs.readFile(commander.addjsonfile[0], async (error, data) => {
			if (error)
				console.error("Can't read file: ", commander.addjsonfile[0])
			else {
				const folder = commander.addjsonfile[1]
				if (!fs.existsSync(folder)) {
					console.error("Can't find output folder.")
					process.exit(-1)
				}
				const parsedData: any[] = JSON.parse(data.toString())
				const importKey = parsedData[0].importKey
				if (!importKey) {
					console.error("First object in import array needs to be import key in format: { \"importKey\": <key> }")
					process.exit(-1)
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
				Promise.all(promisesArray).then((promised: any[]) => {
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
				}).finally(() => {
					const timeStamp = isoly.DateTime.localize(isoly.DateTime.parse(isoly.DateTime.now()), "sv")
					if (fs.existsSync(folder + "exported.txt"))
						fs.renameSync(folder + "exported.txt", folder + "OLD_exported_" + timeStamp + ".txt")
					fs.writeFileSync(folder + "exported.txt", JSON.stringify(okOutput, undefined, 1))
					if (fs.existsSync(folder + "errors.txt"))
						fs.renameSync(folder + "errors.txt", folder + "OLD_errors_" + timeStamp + ".txt")
					fs.writeFileSync(folder + "errors.txt", JSON.stringify(errorOutput, undefined, 1))
					if (errorOutput.length > 0)
						console.log("Successfully imported card data, some errors have been reported to output file errors.txt")
					else
						console.log("Successfully imported card data")
				})
			}
		})
	}
	else
		console.error("--addjsonfile (-f) command require two arguments, see help with -h argument for more information.")
}

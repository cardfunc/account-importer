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


function commaSeparatedList(value: string, dummyPrevious: string) {
	return value.split(/[ ,]+/).filter(Boolean)
}

function listOfJSON(value: string, dummyPrevious: string) {
	return value.match(/({[0-9a-z ":,]+})+/gi)
}

function fileNames(value: string, dummyPrevious: string) {
	return value.split(" ").filter(Boolean)
}

commander.option("-t, --test <input>", "Write something to echo")
commander.option("-l, --addlist [<input>]", "import an authorization", commaSeparatedList)
commander.option("-j, --addjson <input>", "import an authorization")
commander.option("-a, --addjsonlist [<input>]", "import several json authorizations", listOfJSON)
commander.option("-f, --addjsonfile, <items>", "import a json list of cards from a file, specify input filename and output filefolder within one pair of quotation marks (Example parameters: -f \"input.txt output/\")", fileNames)

commander.parse(process.argv)

const testKey = ""

if (commander.test !== undefined)
	console.log("Testing: ", commander.test)
if (commander.addlist !== undefined) {
	const input: string[] = commander.addlist
	if (input.length == 4) {
		console.log("accepted indata for: ", input)
		authorization.create(testKey, input[0], input).then((testAuth) => {
			if (model.Authorization.is(testAuth))
				console.log("Input could be created: ", testAuth)
			else
				console.log("Input could not be created: ", testAuth)
		})
	}
	else
		console.log("Input requires 4 values: ", input)
}
if (commander.addjson !== undefined) {
	console.log("account for: ", commander.addjson)
	const inputObject: any = JSON.parse(commander.addjson)
	inputObject.month = Number.parseInt(inputObject.month) as model.Card.Expires.Month
	inputObject.year = Number.parseInt(inputObject.year) as model.Card.Expires.Year
	const input: AuthorizationInput = inputObject
	console.log("input (json): ", input)
	if (input && AuthorizationInput.is(input)) {
		authorization.create(testKey, input.number, input).then((testAuth) => {
			if (model.Authorization.is(testAuth))
				console.log("Input could be created: ", testAuth)
			else
				console.log("Input could not be created: ", testAuth)
		})
	}
	else
		console.log("Input is supposed to be of type authorizationInput")
}
if (commander.addjsonlist !== undefined) {
	commander.addjsonlist.forEach((element: any) => {
		const inputObject: any = JSON.parse(element)
		inputObject.month = Number.parseInt(inputObject.month) as model.Card.Expires.Month
		inputObject.year = Number.parseInt(inputObject.year) as model.Card.Expires.Year
		const input: AuthorizationInput = inputObject
		console.log("input (json): ", input)
		if (input && AuthorizationInput.is(input)) {
			authorization.create(testKey, input.number, input).then((testAuth) => {
				if (model.Authorization.is(testAuth))
					console.log("Input could be created: ", testAuth)
				else
					console.log("Input could not be created: ", testAuth)
			})
		}
		else
			console.log("Input is supposed to be of type authorizationInput")
	})
}
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
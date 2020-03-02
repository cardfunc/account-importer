#!/usr/bin/env node

import * as commander from "commander"
import * as execute from "./execute"

function fileNames(value: string, dummyPrevious: string) {
	return value.split(" ").filter(Boolean)
}

commander.option("-t, --test <input>", "Write something to echo")
commander.option("-f, --addjsonfile, <items>", "import a json list of cards from a file, specify input filename and output filefolder within one pair of quotation marks (Example parameters: -f \"input.txt output/\")", fileNames)

commander.parse(process.argv)

execute.executeCommands(commander.addjsonfile).then((message: string) => {
	console.log(message)
})

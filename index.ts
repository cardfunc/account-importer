#!/usr/bin/env node
import * as commander from "commander"

commander.option("-t, --test <input>", "Write something to echo", "add -t (or --test) for test echo function")

commander.parse(process.argv)

console.log("Testing: ", commander.test)
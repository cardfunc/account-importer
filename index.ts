#!/usr/bin/env node
import * as data from "./data/test3.json"
import { Input } from "./Input"
import { process } from "./process"

export const input = data as any as Input

process(input).then(v => console.log(JSON.stringify(v)))


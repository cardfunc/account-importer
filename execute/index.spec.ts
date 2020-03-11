import * as dotenv from "dotenv"
dotenv.config()

import * as isoly from "isoly"
import * as execute from "../execute"
import * as fs from "fs"

describe("test-import", () => {
	it("test all", async () => {
		await execute.executeCommands(["test3.txt", "output/"])
	})
	it.skip("fileimport", async () => {
			if (process.env.accountImporterApiKeySecret && process.env.testInputFile && process.env.testOutputFolder) {
				const folder = process.env.testOutputFolder
				const timeStamp = isoly.DateTime.localize(isoly.DateTime.parse(isoly.DateTime.now()), "sv")
				if (fs.existsSync(folder + "exported.txt"))
					fs.renameSync(folder + "exported.txt", folder + "OLD_exported_" + timeStamp + ".txt")
				fs.writeFileSync(folder + "exported.txt", "{ \"status\": \"emptied for testing\" }")
				if (fs.existsSync(folder + "errors.txt"))
					fs.renameSync(folder + "errors.txt", folder + "OLD_errors_" + timeStamp + ".txt")
				fs.writeFileSync(folder + "errors.txt", "{ \"status\": \"emptied for testing\" }")
				fs.writeFileSync(process.env.testInputFile, JSON.stringify([
					{ "importKey": process.env.accountImporterApiKeySecret
					},
					{ "number": "abcd", "pan": "411111111111", "month": "05", "year": "24", "csc": "987", "pares": "an.example.pares" },
					{ "number": "uiop", "pan": "411111111111", "month": "07", "year": "23", "csc": "987", "pares": "an.example.pares" },
					{ "number": "fghj", "pan": "123456789012", "month": "01", "year": "24", "csc": "987", "pares": "an.example.pares" }
				], undefined, 1))
				expect(JSON.parse(fs.readFileSync(folder + "exported.txt").toString())).toEqual({ "status": "emptied for testing" })
				expect(JSON.parse(fs.readFileSync(folder + "errors.txt").toString())).toEqual({ "status": "emptied for testing" })
				expect(await execute.executeCommands([process.env.testInputFile, process.env.testOutputFolder])).toStrictEqual(true)
				expect(JSON.parse(fs.readFileSync(folder + "exported.txt").toString())).toEqual(
					[
						{
							"id": expect.any(String),
							"number": "import-abcd",
							"card": {
								"id": expect.any(String),
								"scheme": "visa",
								"iin": "411111",
								"last4": "1111",
								"expires": [
									5,
									24
								],
								"account": expect.any(String)
							}
						},
						{
							"id": expect.any(String),
							"number": "import-uiop",
							"card": {
								"id": expect.any(String),
								"scheme": "visa",
								"iin": "411111",
								"last4": "1111",
								"expires": [
									7,
									23
								],
								"account": expect.any(String)
							}
						}
					])
				expect(JSON.parse(fs.readFileSync(folder + "errors.txt").toString())).toEqual(
				[
					{
						"status": "failed import",
						"number": "should fail: import key object"
					},
					{
						"status": "failed import",
						"number": "fghj"
					}
				])
			}
			else
				fail("No input file or output folder defined in local .env file")
	})
})

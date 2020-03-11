import { fetch, RequestInit } from "./fetch"
import * as authly from "authly"
import * as gracely from "gracely"

export class Service<M extends authly.Payload> {
	private constructor(readonly merchant: M, readonly baseUrl: string, readonly key: string) {
	}
	private async fetch<T>(resource: string, init: RequestInit, body?: any): Promise<T | gracely.Error> {
		const url = this.baseUrl + "/" + resource
		if (body)
			init.body = JSON.stringify(body)
		init = {
			...init,
			headers: {
				...init.headers,
				"Content-Type": "application/json; charset=utf-8",
				Accept: "application/json; charset=utf-8",
				Authorization: `Bearer ${ await this.key }`,
			},
		}
		let result: T | gracely.Error
		try {
			const response = await fetch(url, init)
			result = response.headers.get("Content-Type") == "application/json; charset=utf-8" ? await response.json() as T | gracely.Error : { status: response.status, type: "unknown" }
		} catch (error) {
			result = gracely.server.unavailable()
		}
		return result
	}
	get<T>(resource: string): Promise<T | gracely.Error> {
		return this.fetch<T>(resource, { method: "GET" })
	}
	put<T>(resource: string, body: any): Promise<T | gracely.Error> {
		return this.fetch<T>(resource, { method: "PUT" }, body)
	}
	post<T>(resource: string, body: any): Promise<T | gracely.Error> {
		return this.fetch<T>(resource, { method: "POST" }, body)
	}
	patch<T>(resource: string, body: any): Promise<T | gracely.Error> {
		return this.fetch<T>(resource, { method: "PATCH" }, body)
	}
	delete<T>(resource: string): Promise<T | gracely.Error> {
		return this.fetch(resource, { method: "DELETE" })
	}
	options<T>(resource: string): Promise<T | gracely.Error> {
		return this.fetch(resource, { method: "OPTIONS" })
	}
	static async create<M extends authly.Payload>(key: authly.Token): Promise<Service<M>> {
		const merchant = await authly.Verifier.create("public").verify(key) as M
		return new Service(merchant, merchant.iss ?? "", key)
	}
}
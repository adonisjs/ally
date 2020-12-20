/*
 * @adonisjs/ally
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/// <reference path="../../adonis-typings/index.ts" />

import got, { CancelableRequest, Response } from 'got'
import { HttpClientContract } from '@ioc:Adonis/Addons/Ally'

/**
 * An HTTP client abstraction we need for making Oauth requests
 */
export class HttpClient implements HttpClientContract {
	private gotRequestType: 'json' | 'urlencoded' = 'urlencoded'
	private gotResponseType: 'json' | 'text' | 'buffer' = 'text'

	public params: { [key: string]: any } = {}
	public fields: { [key: string]: any } = {}
	public headers: { [key: string]: any } = {}

	constructor(private baseUrl: string) {}

	/**
	 * Returns the got options for the request
	 */
	private getGotOptions(requestMethod: 'GET' | 'POST') {
		const hasBody = Object.keys(this.fields).length > 0
		return {
			...(hasBody
				? this.gotRequestType === 'json'
					? { json: this.fields }
					: { form: this.fields }
				: {}),
			searchParams: this.params,
			allowGetBody: requestMethod === 'GET' && hasBody,
			headers: this.headers,
		}
	}

	/**
	 * Returns the response body of the got instance
	 */
	private getResponseBody(request: CancelableRequest<Response>) {
		if (this.gotResponseType === 'json') {
			return request.json()
		}

		if (this.gotResponseType === 'text') {
			return request.text()
		}

		return request.buffer()
	}

	/**
	 * Define query string param
	 */
	public param(key: string, value: any) {
		this.params[key] = value
		return this
	}

	/**
	 * Define request body
	 */
	public field(key: string, value: any) {
		this.fields[key] = value
		return this
	}

	/**
	 * Define request header
	 */
	public header(key: string, value: any) {
		this.headers[key] = value
		return this
	}

	/**
	 * Set the request content type using a shortcut.
	 */
	public requestType(type: 'json' | 'urlencoded'): this {
		this.gotRequestType = type
		return this
	}

	/**
	 * Define how to parse the response
	 */
	public parseResponseAs(type: 'json' | 'text' | 'buffer'): this {
		this.gotResponseType = type
		return this
	}

	/**
	 * Make a post request
	 */
	public async post(): Promise<any> {
		return this.getResponseBody(got.post(this.baseUrl, this.getGotOptions('POST')))
	}

	/**
	 * Make a get request
	 */
	public async get(): Promise<any> {
		return this.getResponseBody(got.get(this.baseUrl, this.getGotOptions('GET')))
	}
}

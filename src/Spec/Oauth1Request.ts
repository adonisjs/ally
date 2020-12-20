/*
 * @adonisjs/ally
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/// <reference path="../../adonis-typings/index.ts" />

import { parse } from 'querystring'
import {
	Oauth1AccessToken,
	Oauth1RequestToken,
	Oauth1RequestConfig,
	Oauth1RequestContract,
} from '@ioc:Adonis/Addons/Ally'
import { randomString } from '@poppinss/utils'

import { HttpClient } from '../HttpClient'
import { Oauth1Signature } from './Oauth1Signature'

/**
 * Abstracts the API calls for the OAuth1 request
 */
export class Oauth1Request implements Oauth1RequestContract {
	private httpClient = new HttpClient(this.baseUrl)
	public oAuthParams: { [key: string]: any } = {}

	constructor(private baseUrl: string, private options: Oauth1RequestConfig) {}

	/**
	 * Get the signature for the request
	 */
	private getSignature() {
		return new Oauth1Signature(
			Object.assign(
				{
					nonce: randomString(32),
					url: this.baseUrl,
					method: 'POST',
					unixTimestamp: Math.floor(new Date().getTime() / 1000),
					params: {
						...this.httpClient.params,
						...this.oAuthParams,
					},
				},
				this.options
			)
		).generate()
	}

	/**
	 * Makes an HTTP post request
	 */
	private async makeRequest() {
		/**
		 * Generate oauth header and signature
		 */
		const { oauthHeader } = this.getSignature()

		/**
		 * Set the oauth header
		 */
		this.header('Authorization', `OAuth ${oauthHeader}`)
		const response = await this.httpClient.post()

		return parse(response)
	}

	/**
	 * Define request param
	 */
	public param(key: string, value: any): this {
		this.httpClient.param(key, value)
		return this
	}

	/**
	 * Params that are added to the oauth header and not the query string
	 */
	public oauthParam(key: string, value: any): this {
		this.oAuthParams[key] = value
		return this
	}

	/**
	 * Define request header
	 */
	public header(key: string, value: any): this {
		this.httpClient.header(key, value)
		return this
	}

	/**
	 * Define request field
	 */
	public field(key: string, value: any): this {
		this.httpClient.field(key, value)
		return this
	}

	/**
	 * Returns the oauthToken and the oauthSecret
	 */
	public async getRequestToken(): Promise<Oauth1RequestToken> {
		const {
			oauth_token: oauthToken,
			oauth_token_secret: oauthTokenSecret,
			...parsed
		} = await this.makeRequest()

		/**
		 * We expect the response to have "oauth_token" and "oauth_token_secret"
		 */
		if (!oauthToken || !oauthTokenSecret) {
			throw new Error(`Invalid oauth1 response. Missing "oauth_token" and "oauth_token_secret"`)
		}

		return {
			oauthToken: oauthToken as string,
			oauthTokenSecret: oauthTokenSecret as string,
			...parsed,
		}
	}

	/**
	 * Returns the oauthToken and the oauthSecret
	 */
	public async getAccessToken(): Promise<Oauth1AccessToken> {
		if (!this.options.oauthToken) {
			throw new Error('"oauthToken" is required to generate the access token')
		}

		const {
			oauth_token: oauthToken,
			oauth_token_secret: oauthTokenSecret,
			...parsed
		} = await this.makeRequest()

		/**
		 * We expect the response to have "oauth_token" and "oauth_token_secret"
		 */
		if (!oauthToken || !oauthTokenSecret) {
			throw new Error(`Invalid oauth1 response. Missing "oauth_token" and "oauth_token_secret"`)
		}

		return {
			oauthToken: oauthToken as string,
			oauthTokenSecret: oauthTokenSecret as string,
			...parsed,
		}
	}
}

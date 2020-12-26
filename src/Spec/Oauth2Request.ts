/*
 * @adonisjs/ally
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/// <reference path="../../adonis-typings/index.ts" />

import { DateTime } from 'luxon'
import {
	Oauth2AccessToken,
	Oauth2RequestConfig,
	Oauth2RequestContract,
} from '@ioc:Adonis/Addons/Ally'
import { HttpClient } from '../HttpClient'
import { OauthException } from '../Exceptions'

/**
 * Abstracts the API calls for the Oauth2 request
 */
export class Oauth2Request implements Oauth2RequestContract {
	private httpClient = new HttpClient(this.baseUrl)

	constructor(private baseUrl: string, private options: Oauth2RequestConfig) {
		this.httpClient.field('grant_type', this.options.grantType || 'authorization_code')
		this.httpClient.field('code', this.options.code)
		this.httpClient.field('redirect_uri', this.options.redirectUri)
		this.httpClient.field('client_id', this.options.clientId)
		this.httpClient.field('client_secret', this.options.clientSecret)
	}

	/**
	 * Makes an HTTP post request
	 */
	private async makeRequest() {
		this.httpClient.parseResponseAs('json')
		return await this.httpClient.post()
	}

	/**
	 * Define request param
	 */
	public param(key: string, value: any): this {
		this.httpClient.param(key, value)
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
	 * Request the access token
	 */
	public async getAccessToken(): Promise<Oauth2AccessToken> {
		const {
			access_token: accessToken,
			token_type: tokenType,
			expires_in: expiresIn,
			refresh_token: refreshToken,
			...parsed
		} = await this.makeRequest()

		/**
		 * We expect the response to have "access_token"
		 */
		if (!accessToken) {
			throw OauthException.missingAccessToken()
		}

		return {
			accessToken,
			tokenType,
			expiresIn,
			...(expiresIn ? { expiresAt: DateTime.local().plus({ seconds: expiresIn }) } : {}),
			refreshToken,
			...parsed,
		}
	}
}

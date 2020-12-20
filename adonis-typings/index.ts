/*
 * @adonisjs/ally
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

declare module '@ioc:Adonis/Addons/Ally' {
	/**
	 * Shape of the oauth1 request token response
	 */
	export type Oauth1RequestToken = {
		oauthToken: string
		oauthTokenSecret: string
	} & { [key: string]: string | string[] }

	/**
	 * Config for the Oauth1 request
	 */
	export type Oauth1RequestConfig = {
		consumerKey: string
		consumerSecret: string
		nonce?: string
		unixTimestamp?: number
		oAuthToken?: string
		oAuthTokenSecret?: string
	}

	/**
	 * A generic HTTP client for making OAuth requests
	 */
	export interface HttpClientContract {
		params: { [key: string]: any }
		headers: { [key: string]: any }
		fields: { [key: string]: any }
		param(key: string, value: any): this
		header(key: string, value: any): this
		field(key: string, value: any): this
		parseResponseAs(type: 'json' | 'text' | 'buffer'): this
		requestType(type: 'json' | 'urlencoded'): this
		post<T extends any>(): Promise<T>
		get<T extends any>(): Promise<T>
	}

	/**
	 * Url builder
	 */
	export interface UrlBuilderContract {
		params: { [key: string]: any }
		param(key: string, value: any): this
		makeUrl(): string
	}

	/**
	 * Oauth1 request client
	 */
	export interface Oauth1RequestContract {
		param(key: string, value: any): this
		oauthParam(key: string, value: any): this
		header(key: string, value: any): this
		field(key: string, value: any): this
		getRequestToken(): Promise<Oauth1RequestToken>
		getAccessToken(): Promise<Oauth1RequestToken>
	}
}

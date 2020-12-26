/*
 * @adonisjs/ally
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/// <reference path="../../../adonis-typings/index.ts" />

import {
	GithubScopes,
	GithubDriverConfig,
	GithubRedirectRequestContract,
} from '@ioc:Adonis/Addons/Ally'

import { github } from '../../Config'
import { UrlBuilder } from '../../UrlBuilder'

/**
 * The redirect request instance for github driver
 */
export class GithubRedirectRequest implements GithubRedirectRequestContract {
	private urlBuilder = new UrlBuilder(this.config.authorizeUrl || github.AUTHORIZE_URL)

	/**
	 * Reference to the params
	 */
	public get params() {
		return this.urlBuilder.params
	}

	constructor(private config: GithubDriverConfig) {
		this.defineBaseParams()
		this.defineConditionalParams()
	}

	/**
	 * Define the base (always required) params from the config
	 */
	private defineBaseParams() {
		this.param('client_id', this.config.clientId)
		this.param('redirect_uri', this.config.callbackUrl)
		this.param('response_type', 'code')
		this.scopes(this.config.scopes || ['user'])
	}

	/**
	 * Define the conditional params from the config
	 */
	private defineConditionalParams() {
		this.config.login && this.login(this.config.login)
		this.config.allowSignup && this.allowSignup(this.config.allowSignup)
	}

	/**
	 * Define scopes to accept. Otherwise one defined inside the config
	 * will be used
	 */
	public scopes(scopes: GithubScopes[]): this {
		this.urlBuilder.param('scope', scopes.join(' '))
		return this
	}

	/**
	 * Define a custom login account
	 */
	public login(account: string): this {
		this.param('login', account)
		return this
	}

	/**
	 * Explicitly allow or dis-allow signups
	 */
	public allowSignup(enable: boolean): this {
		this.param('allow_signup', enable)
		return this
	}

	/**
	 * Define any set of params
	 */
	public param(key: string, value: any): this {
		this.urlBuilder.param(key, value)
		return this
	}

	/**
	 * Make url
	 */
	public toString() {
		return this.urlBuilder.makeUrl()
	}
}

/*
 * @adonisjs/ally
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { UrlBuilder } from '@poppinss/oauth-client'
import { RedirectRequestContract } from '@ioc:Adonis/Addons/Ally'

/**
 * Redirect request with first class support for defining scopes.
 */
export class RedirectRequest<Scope extends string>
	extends UrlBuilder
	implements RedirectRequestContract<Scope> {
	constructor(baseUrl: string, private scopeParamName: string, private scopeSeparator: string) {
		super(baseUrl)
	}

	/**
	 * Define an array of scopes.
	 */
	public scopes(scopes: Scope[]): this {
		this.param(this.scopeParamName, scopes.join(this.scopeSeparator))
		return this
	}

	/**
	 * Clear existing scopes
	 */
	public clearScopes(): this {
		this.clearParam(this.scopeParamName)
		return this
	}

	/**
	 * Merge to existing scopes
	 */
	public mergeScopes(scopes: Scope[]): this {
		const mergedScopes = (this.params[this.scopeParamName] || []).concat(scopes)
		this.scopes(mergedScopes)

		return this
	}
}

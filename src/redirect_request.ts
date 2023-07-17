/*
 * @adonisjs/ally
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { UrlBuilder } from '@poppinss/oauth-client'
import { LiteralStringUnion } from './types.js'

/**
 * Redirect request with first class support for defining scopes.
 */
export class RedirectRequest<Scopes extends string> extends UrlBuilder {
  #scopesTransformer: undefined | ((scopes: LiteralStringUnion<Scopes>[]) => string[])
  #scopeParamName: string
  #scopeSeparator: string

  constructor(baseUrl: string, scopeParamName: string, scopeSeparator: string) {
    super(baseUrl)
    this.#scopeParamName = scopeParamName
    this.#scopeSeparator = scopeSeparator
  }

  transformScopes(callback: (scopes: LiteralStringUnion<Scopes>[]) => string[]): this {
    this.#scopesTransformer = callback
    return this
  }

  /**
   * Define an array of scopes.
   */
  scopes(scopes: LiteralStringUnion<Scopes>[]): this {
    if (typeof this.#scopesTransformer === 'function') {
      scopes = this.#scopesTransformer(scopes)
    }

    this.param(this.#scopeParamName, scopes.join(this.#scopeSeparator))
    return this
  }

  /**
   * Clear existing scopes
   */
  clearScopes(): this {
    this.clearParam(this.#scopeParamName)
    return this
  }

  /**
   * Merge to existing scopes
   */
  mergeScopes(scopes: LiteralStringUnion<Scopes>[]): this {
    if (typeof this.#scopesTransformer === 'function') {
      scopes = this.#scopesTransformer(scopes)
    }

    const params = this.getParams()
    const mergedScopes = (params[this.#scopeParamName] || []).concat(scopes)
    this.scopes(mergedScopes)

    return this
  }
}

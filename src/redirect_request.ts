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

  /**
   * Register a custom function to transform scopes. Exposed for drivers
   * to implement.
   */
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
   * Merge to existing scopes
   */
  mergeScopes(scopes: LiteralStringUnion<Scopes>[]): this {
    if (typeof this.#scopesTransformer === 'function') {
      scopes = this.#scopesTransformer(scopes)
    }

    const existingScopes = this.getParams()[this.#scopeParamName]
    const scopesString = scopes.join(this.#scopeSeparator)

    if (!existingScopes) {
      this.param(this.#scopeParamName, scopesString)
      return this
    }

    this.param(this.#scopeParamName, `${existingScopes}${this.#scopeSeparator}${scopesString}`)
    return this
  }

  /**
   * Clear existing scopes
   */
  clearScopes(): this {
    this.clearParam(this.#scopeParamName)
    return this
  }
}

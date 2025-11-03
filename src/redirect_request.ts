/*
 * @adonisjs/ally
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { UrlBuilder } from '@poppinss/oauth-client'
import { type LiteralStringUnion } from './types.js'

/**
 * Redirect request with first-class support for defining OAuth scopes.
 * Extends the UrlBuilder from the OAuth client to provide scope management
 * capabilities specific to social authentication providers.
 */
export class RedirectRequest<Scopes extends string> extends UrlBuilder {
  #scopesTransformer: undefined | ((scopes: LiteralStringUnion<Scopes>[]) => string[])
  #scopeParamName: string
  #scopeSeparator: string

  /**
   * @param baseUrl - The authorization URL for the OAuth provider
   * @param scopeParamName - The query parameter name for scopes (e.g., 'scope')
   * @param scopeSeparator - The character used to separate multiple scopes (e.g., ' ' or ',')
   */
  constructor(baseUrl: string, scopeParamName: string, scopeSeparator: string) {
    super(baseUrl)
    this.#scopeParamName = scopeParamName
    this.#scopeSeparator = scopeSeparator
  }

  /**
   * Register a custom function to transform scopes before they are
   * added to the authorization URL. This is useful for providers that
   * require scope prefixes or transformations.
   *
   * @param callback - Function that transforms the scopes array
   *
   * @example
   * ```ts
   * request.transformScopes((scopes) => {
   *   return scopes.map(scope => `https://provider.com/auth/${scope}`)
   * })
   * ```
   */
  transformScopes(callback: (scopes: LiteralStringUnion<Scopes>[]) => string[]): this {
    this.#scopesTransformer = callback
    return this
  }

  /**
   * Define the scopes to request during authorization. This replaces
   * any previously set scopes.
   *
   * @param scopes - Array of scope strings to request
   *
   * @example
   * ```ts
   * request.scopes(['user:email', 'read:org'])
   * ```
   */
  scopes(scopes: LiteralStringUnion<Scopes>[]): this {
    if (typeof this.#scopesTransformer === 'function') {
      scopes = this.#scopesTransformer(scopes)
    }

    this.param(this.#scopeParamName, scopes.join(this.#scopeSeparator))
    return this
  }

  /**
   * Merge additional scopes with any existing scopes. This is useful
   * for adding scopes without replacing the default ones.
   *
   * @param scopes - Array of scope strings to merge
   *
   * @example
   * ```ts
   * request
   *   .scopes(['user:email'])
   *   .mergeScopes(['read:org'])
   * ```
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
   * Clear all existing scopes from the authorization request.
   *
   * @example
   * ```ts
   * request.clearScopes().scopes(['user'])
   * ```
   */
  clearScopes(): this {
    this.clearParam(this.#scopeParamName)
    return this
  }
}

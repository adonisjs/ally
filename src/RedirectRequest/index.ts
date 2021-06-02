/*
 * @adonisjs/ally
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { UrlBuilder } from '@poppinss/oauth-client'
import { RedirectRequestContract, LiteralStringUnion } from '@ioc:Adonis/Addons/Ally'

/**
 * Redirect request with first class support for defining scopes.
 */
export class RedirectRequest<Scopes extends string>
  extends UrlBuilder
  implements RedirectRequestContract<Scopes>
{
  private scopesTransformer: undefined | ((scopes: LiteralStringUnion<Scopes>[]) => string[])

  constructor(baseUrl: string, private scopeParamName: string, private scopeSeparator: string) {
    super(baseUrl)
  }

  public transformScopes(callback: (scopes: LiteralStringUnion<Scopes>[]) => string[]): this {
    this.scopesTransformer = callback
    return this
  }

  /**
   * Define an array of scopes.
   */
  public scopes(scopes: LiteralStringUnion<Scopes>[]): this {
    if (typeof this.scopesTransformer === 'function') {
      scopes = this.scopesTransformer(scopes)
    }

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
  public mergeScopes(scopes: LiteralStringUnion<Scopes>[]): this {
    if (typeof this.scopesTransformer === 'function') {
      scopes = this.scopesTransformer(scopes)
    }

    const mergedScopes = (this.params[this.scopeParamName] || []).concat(scopes)
    this.scopes(mergedScopes)

    return this
  }
}

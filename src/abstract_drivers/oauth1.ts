/*
 * @adonisjs/ally
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Exception } from '@poppinss/utils'
import { Oauth1Client } from '@poppinss/oauth-client'
import type { HttpContext } from '@adonisjs/core/http'

import {
  AllyUserContract,
  Oauth1AccessToken,
  Oauth1DriverConfig,
  ApiRequestContract,
  AllyDriverContract,
  RedirectRequestContract,
} from '../types.js'

import * as errors from '../exceptions.js'
import { RedirectRequest } from '../redirect_request.js'

/**
 * Abstract implementation for an Oauth1 driver
 */
export abstract class Oauth1Driver<Token extends Oauth1AccessToken, Scopes extends string>
  extends Oauth1Client<Token>
  implements AllyDriverContract<Token, Scopes>
{
  /**
   * The cookie name for storing the "oauth_token". Must be unique for your
   * driver. One option is to prefix the driver name. For example:
   * `twitter_oauth_token`
   */
  protected abstract oauthTokenCookieName: string

  /**
   * Name of the "oauth_token" param. This is the query string value post
   * authorization redirect
   */
  protected abstract oauthTokenParamName: string

  /**
   * Name of the "oauth_verifier" param. This is the query string value post
   * authorization redirect
   */
  protected abstract oauthTokenVerifierName: string

  /**
   * The parameter name from which to fetch the error message or error code
   * post redirect.
   *
   * You must check the auth provider docs to find it
   */
  protected abstract errorParamName: string

  /**
   * Request token URL for the auth provider. The initial set of tokens
   * are generated from this url
   */
  protected abstract requestTokenUrl: string

  /**
   * Authorization URL for the auth provider. The user will be redirected
   * to this URL
   */
  protected abstract authorizeUrl: string

  /**
   * The URL to hit to get an access token
   */
  protected abstract accessTokenUrl: string

  /**
   * The query param name for defining the Authorization scopes.
   * Mostly it is `scope`. Leave to empty string when scopes
   * are not applicable
   */
  protected abstract scopeParamName: string

  /**
   * The identifier for joining multiple scopes. Mostly it is a space.
   */
  protected abstract scopesSeparator: string

  /**
   * Returns details for the authorized user
   */
  abstract user(callback?: (request: ApiRequestContract) => void): Promise<AllyUserContract<Token>>

  /**
   * Finds the user by access token
   */
  abstract userFromTokenAndSecret(
    token: string,
    secret: string,
    callback?: (request: ApiRequestContract) => void
  ): Promise<AllyUserContract<{ token: string; secret: string }>>

  /**
   * Find if the current error code is for access denied
   */
  abstract accessDenied(): boolean

  /**
   * Oauth client version
   */
  version = 'oauth1' as const

  /**
   * The value of "oauth_token" and "oauth_secret" from the cookies
   */
  protected oauthTokenCookieValue?: string
  protected oauthSecretCookieValue?: string

  /**
   * The cookie name for storing the secret
   */
  protected get oauthSecretCookieName() {
    return `${this.oauthTokenCookieName}_secret`
  }

  constructor(
    protected ctx: HttpContext,
    public config: Oauth1DriverConfig
  ) {
    super(config)
  }

  /**
   * The Oauth1Client will use the instance returned from this method to
   * build the redirect url
   */
  protected urlBuilder(url: string) {
    return new RedirectRequest(url, this.scopeParamName, this.scopesSeparator)
  }

  /**
   * Loads the value of state from the cookie and removes it right
   * away. We read the cookie value and clear it during the
   * current request lifecycle.
   *
   * :::::
   * NOTE
   * :::::
   *
   * This child class must call this method inside the constructor.
   */
  protected loadState() {
    /**
     * Read and cache in-memory
     */
    this.oauthTokenCookieValue = this.ctx.request.encryptedCookie(this.oauthTokenCookieName)
    this.oauthSecretCookieValue = this.ctx.request.encryptedCookie(this.oauthSecretCookieName)

    /**
     * Clear cookies
     */
    this.ctx.response.clearCookie(this.oauthTokenCookieName)
    this.ctx.response.clearCookie(this.oauthSecretCookieName)
  }

  /**
   * Persists the token (aka state) inside the cookie
   */
  #persistToken(token: string): void {
    this.ctx.response.encryptedCookie(this.oauthTokenCookieName, token, {
      sameSite: false,
      httpOnly: true,
    })
  }

  /**
   * Persists the secret inside the cookie
   */
  #persistSecret(secret: string): void {
    this.ctx.response.encryptedCookie(this.oauthSecretCookieName, secret, {
      sameSite: false,
      httpOnly: true,
    })
  }

  /**
   * Perform stateless authentication. Only applicable for Oauth1 client
   */
  stateless(): never {
    throw new Exception('OAuth1 does not support stateless authorization')
  }

  /**
   * Returns the redirect URL for the request.
   */
  async redirectUrl(
    callback?: (request: RedirectRequestContract<Scopes>) => void
  ): Promise<string> {
    return this.getRedirectUrl(callback as any)
  }

  /**
   * Redirect user for authorization.
   */
  async redirect(callback?: (request: RedirectRequestContract<Scopes>) => void): Promise<void> {
    const { token, secret } = await this.getRequestToken()

    /**
     * Storing token and secret inside cookies. We need them
     * later
     */
    this.#persistToken(token)
    this.#persistSecret(secret)

    const url = await this.redirectUrl((request) => {
      request.param(this.oauthTokenParamName, token)

      if (typeof callback === 'function') {
        callback(request)
      }
    })

    this.ctx.response.redirect(url)
  }

  /**
   * Find if there is a state mismatch
   */
  stateMisMatch(): boolean {
    return this.oauthTokenCookieValue !== this.ctx.request.input(this.oauthTokenParamName)
  }

  /**
   * Find if there is an error post redirect
   */
  hasError(): boolean {
    return !!this.getError()
  }

  /**
   * Get the post redirect error
   */
  getError(): string | null {
    const error = this.ctx.request.input(this.errorParamName)
    if (error) {
      return error
    }

    if (!this.hasCode()) {
      return 'unknown_error'
    }

    return null
  }

  /**
   * Returns the "oauth_verifier" token
   */
  getCode(): string | null {
    return this.ctx.request.input(this.oauthTokenVerifierName, null)
  }

  /**
   * Find it the code exists
   */
  hasCode(): boolean {
    return !!this.getCode()
  }

  /**
   * Get access token
   */
  async accessToken(callback?: (request: ApiRequestContract) => void): Promise<Token> {
    /**
     * We expect the user to handle errors before calling this method
     */
    if (this.hasError()) {
      throw new errors.E_OAUTH_MISSING_CODE([this.oauthTokenVerifierName])
    }

    /**
     * We expect the user to properly handle the state mis-match use case before
     * calling this method
     */
    if (this.stateMisMatch()) {
      throw new errors.E_OAUTH_STATE_MISMATCH()
    }

    /**
     * Get access token by providing the authorization code
     */
    return this.getAccessToken(
      { token: this.oauthTokenCookieValue!, secret: this.oauthSecretCookieValue! },
      (request) => {
        request.oauth1Param(this.oauthTokenVerifierName, this.getCode())

        if (typeof callback === 'function') {
          callback(request)
        }
      }
    )
  }

  /**
   * Not applicable with Oauth1
   */
  async userFromToken(): Promise<never> {
    throw new Exception(
      '"userFromToken" is not available with Oauth1. Use "userFromTokenAndSecret" instead'
    )
  }
}

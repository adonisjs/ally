/*
 * @adonisjs/ally
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/// <reference path="../../../adonis-typings/index.ts" />

import { Exception } from '@poppinss/utils'
import { Oauth2Client } from '@poppinss/oauth-client'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import {
  AllyUserContract,
  Oauth2AccessToken,
  Oauth2DriverConfig,
  ApiRequestContract,
  AllyDriverContract,
  RedirectRequestContract,
} from '@ioc:Adonis/Addons/Ally'

import { OauthException } from '../../Exceptions'
import { RedirectRequest } from '../../RedirectRequest'

/**
 * Abstract implementation for an Oauth2 driver
 */
export abstract class Oauth2Driver<Token extends Oauth2AccessToken, Scopes extends string>
  extends Oauth2Client<Token>
  implements AllyDriverContract<Token, Scopes>
{
  /**
   * Is the authorization process stateless?
   */
  protected isStateless: boolean = false

  /**
   * The cookie name for storing the CSRF token. Must be unique for your
   * driver. One option is to prefix the driver name. For example:
   * `gh_oauth_state`
   */
  protected abstract stateCookieName: string

  /**
   * The parameter in which to send the state to the oauth provider. The same
   * input is used to retrieve the state post redirect as well.
   *
   * You must check the auth provider docs to find it
   */
  protected abstract stateParamName: string

  /**
   * The parameter name from which to fetch the error message or error code
   * post redirect.
   *
   * You must check the auth provider docs to find it
   */
  protected abstract errorParamName: string

  /**
   * The parameter name from which to fetch the authorization code. It is usually
   * named as "code".
   *
   * You must check the auth provider docs to find it
   */
  protected abstract codeParamName: string

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
   * Mostly it is `scope`
   */
  protected abstract scopeParamName: string

  /**
   * The identifier for joining multiple scopes. Mostly it is a space.
   */
  protected abstract scopesSeparator: string

  /**
   * Returns details for the authorized user
   */
  public abstract user(
    callback?: (request: ApiRequestContract) => void
  ): Promise<AllyUserContract<Token>>

  /**
   * Finds the user by access token
   */
  public abstract userFromToken(
    token: string,
    callback?: (request: ApiRequestContract) => void
  ): Promise<AllyUserContract<{ token: string; type: 'bearer' }>>

  /**
   * Find if the current error code is for access denied
   */
  public abstract accessDenied(): boolean

  /**
   * Oauth client version
   */
  public version = 'oauth2' as const

  /**
   * The value of state read from the cookies.
   */
  protected stateCookieValue?: string

  constructor(protected ctx: HttpContextContract, public config: Oauth2DriverConfig) {
    super(config)
  }

  /**
   * The Oauth2Client will use the instance returned from this method to
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
    if (this.isStateless) {
      return
    }

    this.stateCookieValue = this.ctx.request.encryptedCookie(this.stateCookieName)
    this.ctx.response.clearCookie(this.stateCookieName)
  }

  /**
   * Persists the state inside the cookie
   */
  private persistState(): string | undefined {
    if (this.isStateless) {
      return
    }

    const state = this.getState()
    this.ctx.response.encryptedCookie(this.stateCookieName, state, {
      sameSite: false,
      httpOnly: true,
    })

    return state
  }

  /**
   * Perform stateless authentication. Only applicable for Oauth2 client
   */
  public stateless(): this {
    this.isStateless = true
    return this
  }

  /**
   * Returns the redirect URL for the request.
   */
  public async redirectUrl(
    callback?: (request: RedirectRequestContract<Scopes>) => void
  ): Promise<string> {
    const url = this.getRedirectUrl(callback)
    return url
  }

  /**
   * Redirect user for authorization.
   */
  public async redirect(
    callback?: (request: RedirectRequestContract<Scopes>) => void
  ): Promise<void> {
    const url = await this.redirectUrl((request) => {
      const state = this.persistState()
      state && request.param(this.stateParamName, state)

      if (typeof callback === 'function') {
        callback(request)
      }
    })

    this.ctx.response.redirect(url)
  }

  /**
   * Find if there is a state mismatch
   */
  public stateMisMatch(): boolean {
    if (this.isStateless) {
      return false
    }

    return this.stateCookieValue !== this.ctx.request.input(this.stateParamName)
  }

  /**
   * Find if there is an error post redirect
   */
  public hasError(): boolean {
    return !!this.getError()
  }

  /**
   * Get the post redirect error
   */
  public getError(): string | null {
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
   * Returns the authorization code
   */
  public getCode(): string | null {
    return this.ctx.request.input(this.codeParamName, null)
  }

  /**
   * Find it the code exists
   */
  public hasCode(): boolean {
    return !!this.getCode()
  }

  /**
   * Get access token
   */
  public async accessToken(callback?: (request: ApiRequestContract) => void): Promise<Token> {
    /**
     * We expect the user to handle errors before calling this method
     */
    if (this.hasError()) {
      throw OauthException.missingAuthorizationCode(this.codeParamName)
    }

    /**
     * We expect the user to properly handle the state mis-match use case before
     * calling this method
     */
    if (this.stateMisMatch()) {
      throw OauthException.stateMisMatch()
    }

    /**
     * Get access token by providing the authorization code
     */
    return this.getAccessToken((request) => {
      request.field(this.codeParamName, this.getCode())

      if (typeof callback === 'function') {
        callback(request)
      }
    })
  }

  /**
   * Not applicable with Oauth2
   */
  public async userFromTokenAndSecret(): Promise<never> {
    throw new Exception(
      '"userFromTokenAndSecret" is not applicable with Oauth2. Use "userFromToken" instead'
    )
  }
}

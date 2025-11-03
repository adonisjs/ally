/*
 * @adonisjs/ally
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'
import { Oauth1Client } from '@poppinss/oauth-client/oauth1'

import {
  type AllyUserContract,
  type Oauth1AccessToken,
  type Oauth1DriverConfig,
  type ApiRequestContract,
  type AllyDriverContract,
  type RedirectRequestContract,
} from '../types.ts'

import * as errors from '../errors.ts'
import { RedirectRequest } from '../redirect_request.ts'

/**
 * Abstract base class for implementing OAuth1 social authentication drivers.
 * Extends the OAuth1 client to provide AdonisJS-specific functionality like
 * token management via cookies and integration with HTTP context.
 *
 * @example
 * ```ts
 * export class CustomDriver extends Oauth1Driver<CustomToken, CustomScopes> {
 *   protected oauthTokenCookieName = 'custom_oauth_token'
 *   protected oauthTokenParamName = 'oauth_token'
 *   protected oauthTokenVerifierName = 'oauth_verifier'
 *   protected errorParamName = 'error'
 *   protected requestTokenUrl = 'https://provider.com/oauth/request_token'
 *   protected authorizeUrl = 'https://provider.com/oauth/authorize'
 *   protected accessTokenUrl = 'https://provider.com/oauth/access_token'
 *   protected scopeParamName = ''
 *   protected scopesSeparator = ' '
 *
 *   async user() {
 *     // Implementation
 *   }
 * }
 * ```
 */
export abstract class Oauth1Driver<Token extends Oauth1AccessToken, Scopes extends string>
  extends Oauth1Client<Token>
  implements AllyDriverContract<Token, Scopes>
{
  /**
   * The cookie name for storing the OAuth token. Must be unique for
   * your driver to avoid conflicts. For example: `twitter_oauth_token`
   */
  protected abstract oauthTokenCookieName: string

  /**
   * The query parameter name for the OAuth token returned after
   * authorization redirect. This is typically 'oauth_token'.
   */
  protected abstract oauthTokenParamName: string

  /**
   * The query parameter name for the OAuth verifier returned after
   * authorization redirect. This is typically 'oauth_verifier'.
   */
  protected abstract oauthTokenVerifierName: string

  /**
   * The query parameter name for error messages returned by the provider
   * after authorization redirect.
   */
  protected abstract errorParamName: string

  /**
   * The OAuth provider's endpoint for obtaining a request token.
   * This is the first step in the OAuth1 flow.
   */
  protected abstract requestTokenUrl: string

  /**
   * The OAuth provider's authorization URL where users are redirected
   * to grant permissions.
   */
  protected abstract authorizeUrl: string

  /**
   * The OAuth provider's endpoint for exchanging the request token
   * and verifier for an access token.
   */
  protected abstract accessTokenUrl: string

  /**
   * The query parameter name for defining authorization scopes.
   * Leave as empty string if scopes are not supported by the provider.
   */
  protected abstract scopeParamName: string

  /**
   * The separator character for joining multiple scopes. This is
   * typically a space ' '.
   */
  protected abstract scopesSeparator: string

  /**
   * Fetch the user details from the OAuth provider using the
   * authorization from the current request.
   *
   * @param callback - Optional callback to customize the API request
   */
  abstract user(callback?: (request: ApiRequestContract) => void): Promise<AllyUserContract<Token>>

  /**
   * Fetch user details using an existing access token and secret.
   * This is the OAuth1 equivalent of `userFromToken`.
   *
   * @param token - The access token
   * @param secret - The token secret
   * @param callback - Optional callback to customize the API request
   */
  abstract userFromTokenAndSecret(
    token: string,
    secret: string,
    callback?: (request: ApiRequestContract) => void
  ): Promise<AllyUserContract<{ token: string; secret: string }>>

  /**
   * Check if the current error indicates that the user denied access.
   * Different providers use different error codes for access denial.
   */
  abstract accessDenied(): boolean

  /**
   * OAuth protocol version identifier
   */
  version = 'oauth1' as const

  /**
   * Cached OAuth token and secret values read from cookies
   */
  protected oauthTokenCookieValue?: string
  protected oauthSecretCookieValue?: string

  /**
   * The cookie name for storing the OAuth token secret.
   * Automatically derived from the token cookie name.
   */
  protected get oauthSecretCookieName() {
    return `${this.oauthTokenCookieName}_secret`
  }

  /**
   * @param ctx - The current HTTP context
   * @param config - OAuth1 driver configuration
   */
  constructor(
    protected ctx: HttpContext,
    public config: Oauth1DriverConfig
  ) {
    super(config)
  }

  /**
   * Creates a URL builder instance for constructing authorization URLs
   * with scope support.
   *
   * @param url - The base authorization URL
   */
  protected urlBuilder(url: string) {
    return new RedirectRequest(url, this.scopeParamName, this.scopesSeparator)
  }

  /**
   * Loads the OAuth token and secret from encrypted cookies and immediately
   * clears the cookies. This must be called by child classes in their
   * constructor to enable token verification.
   *
   * @example
   * ```ts
   * constructor(ctx: HttpContext, config: DriverConfig) {
   *   super(ctx, config)
   *   this.loadState()
   * }
   * ```
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
   * Stores the OAuth token in an encrypted cookie for later use
   */
  #persistToken(token: string): void {
    this.ctx.response.encryptedCookie(this.oauthTokenCookieName, token, {
      sameSite: false,
      httpOnly: true,
    })
  }

  /**
   * Stores the OAuth token secret in an encrypted cookie for later use
   */
  #persistSecret(secret: string): void {
    this.ctx.response.encryptedCookie(this.oauthSecretCookieName, secret, {
      sameSite: false,
      httpOnly: true,
    })
  }

  /**
   * OAuth1 does not support stateless authentication due to the
   * three-legged authentication flow requiring token persistence.
   */
  stateless(): never {
    throw new Exception('OAuth1 does not support stateless authorization')
  }

  /**
   * Get the authorization redirect URL without performing the redirect.
   * Useful when you need to manually handle the redirect or use the URL
   * in a different context.
   *
   * @param callback - Optional callback to customize the redirect request
   *
   * @example
   * ```ts
   * const url = await ally.use('twitter').redirectUrl()
   * ```
   */
  async redirectUrl(
    callback?: (request: RedirectRequestContract<Scopes>) => void
  ): Promise<string> {
    return this.getRedirectUrl(callback as any)
  }

  /**
   * Redirect the user to the OAuth provider's authorization page.
   * The request token is automatically obtained and stored in cookies.
   *
   * @param callback - Optional callback to customize the redirect request
   *
   * @example
   * ```ts
   * await ally.use('twitter').redirect()
   * ```
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
   * Check if the OAuth token from the callback matches the token
   * stored in the cookie.
   */
  stateMisMatch(): boolean {
    return this.oauthTokenCookieValue !== this.ctx.request.input(this.oauthTokenParamName)
  }

  /**
   * Check if an error was returned by the OAuth provider.
   */
  hasError(): boolean {
    return !!this.getError()
  }

  /**
   * Get the error code or message returned by the OAuth provider.
   * Returns 'unknown_error' if no verifier is present and no error was specified.
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
   * Get the OAuth verifier from the callback request.
   */
  getCode(): string | null {
    return this.ctx.request.input(this.oauthTokenVerifierName, null)
  }

  /**
   * Check if the OAuth verifier is present in the callback request.
   */
  hasCode(): boolean {
    return !!this.getCode()
  }

  /**
   * Exchange the request token and verifier for an access token.
   * This method validates the token and checks for errors before
   * making the request.
   *
   * @param callback - Optional callback to customize the token request
   *
   * @example
   * ```ts
   * const token = await ally.use('twitter').accessToken()
   * ```
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
   * Not applicable with OAuth1. Use `userFromTokenAndSecret` instead.
   */
  async userFromToken(): Promise<never> {
    throw new Exception(
      '"userFromToken" is not available with Oauth1. Use "userFromTokenAndSecret" instead'
    )
  }
}

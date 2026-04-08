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
import { Oauth2Client } from '@poppinss/oauth-client/oauth2'

import {
  type AllyUserContract,
  type Oauth2AccessToken,
  type Oauth2DriverConfig,
  type ApiRequestContract,
  type AllyDriverContract,
  type RedirectRequestContract,
} from '../types.ts'

import * as errors from '../errors.ts'
import { RedirectRequest } from '../redirect_request.ts'

/**
 * Abstract base class for implementing OAuth2 social authentication drivers.
 * Extends the OAuth2 client to provide AdonisJS-specific functionality like
 * CSRF protection, state management, and integration with HTTP context.
 *
 * @example
 * ```ts
 * export class CustomDriver extends Oauth2Driver<CustomToken, CustomScopes> {
 *   protected stateCookieName = 'custom_oauth_state'
 *   protected stateParamName = 'state'
 *   protected errorParamName = 'error'
 *   protected codeParamName = 'code'
 *   protected authorizeUrl = 'https://provider.com/oauth/authorize'
 *   protected accessTokenUrl = 'https://provider.com/oauth/token'
 *   protected scopeParamName = 'scope'
 *   protected scopesSeparator = ' '
 *
 *   async user() {
 *     // Implementation
 *   }
 * }
 * ```
 */
export abstract class Oauth2Driver<Token extends Oauth2AccessToken, Scopes extends string>
  extends Oauth2Client<Token>
  implements AllyDriverContract<Token, Scopes>
{
  /**
   * Whether the authorization process is stateless. When true,
   * state verification via cookies is disabled.
   */
  protected isStateless: boolean = false

  /**
   * The cookie name for storing the CSRF state token. Must be unique
   * for your driver to avoid conflicts. For example: `gh_oauth_state`
   */
  protected abstract stateCookieName: string

  /**
   * The cookie name for storing the PKCE code verifier. Define this property
   * in child classes that require PKCE.
   */
  protected codeVerifierCookieName?: string

  /**
   * The cookie name for storing the origin URL. The origin URL is
   * the page the user was on before being redirected to the OAuth
   * provider. It is used to redirect the user back when an error
   * occurs during the callback.
   */
  protected get originUrlCookieName() {
    return `${this.stateCookieName}_origin_url`
  }

  /**
   * The query parameter name for sending the state to the OAuth provider.
   * This is typically 'state' but varies by provider. Check the provider's
   * OAuth documentation.
   */
  protected abstract stateParamName: string

  /**
   * The query parameter name for error messages returned by the provider
   * after authorization redirect. This is typically 'error'.
   */
  protected abstract errorParamName: string

  /**
   * The query parameter name for the authorization code returned by the
   * provider. This is typically 'code'.
   */
  protected abstract codeParamName: string

  /**
   * The OAuth provider's authorization URL where users are redirected
   * to grant permissions.
   */
  protected abstract authorizeUrl: string

  /**
   * The OAuth provider's endpoint for exchanging the authorization code
   * for an access token.
   */
  protected abstract accessTokenUrl: string

  /**
   * The query parameter name for defining authorization scopes.
   * This is typically 'scope'.
   */
  protected abstract scopeParamName: string

  /**
   * The separator character for joining multiple scopes. This is
   * typically a space ' ' or comma ','.
   */
  protected abstract scopesSeparator: string

  /**
   * Fetch the user details from the OAuth provider using the
   * authorization code from the current request.
   *
   * @param callback - Optional callback to customize the API request
   * @returns A promise resolving to the authenticated user profile.
   */
  abstract user(callback?: (request: ApiRequestContract) => void): Promise<AllyUserContract<Token>>

  /**
   * Fetch user details using an existing access token. Useful for
   * verifying tokens or fetching user info for already authenticated users.
   *
   * @param token - The access token
   * @param callback - Optional callback to customize the API request
   * @returns A promise resolving to the authenticated user profile.
   */
  abstract userFromToken(
    token: string,
    callback?: (request: ApiRequestContract) => void
  ): Promise<AllyUserContract<{ token: string; type: 'bearer' }>>

  /**
   * Check if the current error indicates that the user denied access.
   * Different providers use different error codes for access denial.
   *
   * @returns `true` when the provider reported an access-denied state.
   */
  abstract accessDenied(): boolean

  /**
   * OAuth protocol version identifier
   */
  version = 'oauth2' as const

  /**
   * Cached state value read from the cookie
   */
  protected stateCookieValue?: string

  /**
   * The origin URL set via `setOriginUrl` before redirect
   */
  protected originUrl?: string

  /**
   * Cached origin URL value read from the cookie via loadState
   */
  protected originUrlCookieValue?: string

  /**
   * Cached PKCE code verifier value read from the cookie via
   * loadState
   */
  protected codeVerifierCookieValue?: string

  /**
   * Create a new OAuth2 driver instance.
   *
   * @param ctx - The current HTTP context
   * @param config - OAuth2 driver configuration
   */
  constructor(
    protected ctx: HttpContext,
    public config: Oauth2DriverConfig
  ) {
    super(config)
  }

  /**
   * Creates a URL builder instance for constructing authorization URLs
   * with scope support.
   *
   * @param url - The base authorization URL
   * @returns A redirect request builder for the given URL.
   */
  protected urlBuilder(url: string) {
    return new RedirectRequest(url, this.scopeParamName, this.scopesSeparator)
  }

  /**
   * Find if the driver uses PKCE for the OAuth2 authorization code flow.
   *
   * @returns `true` when the driver has PKCE enabled.
   */
  #usesPkce(): boolean {
    return !!this.codeVerifierCookieName
  }

  /**
   * Loads the state value from the encrypted cookie and immediately clears
   * the cookie. When PKCE is enabled, it also loads the PKCE code verifier.
   * This must be called by child classes in their constructor.
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
    if (this.isStateless) {
      return
    }

    this.stateCookieValue = this.ctx.request.encryptedCookie(this.stateCookieName)
    this.ctx.response.clearCookie(this.stateCookieName)

    this.originUrlCookieValue = this.ctx.request.cookie(this.originUrlCookieName)
    this.ctx.response.clearCookie(this.originUrlCookieName)

    if (this.#usesPkce()) {
      this.codeVerifierCookieValue = this.ctx.request.encryptedCookie(this.codeVerifierCookieName!)
      this.ctx.response.clearCookie(this.codeVerifierCookieName!)
    }
  }

  /**
   * Returns the PKCE code verifier for building the authorization redirect.
   * This method is expected to create and persist the verifier for later use.
   *
   * @returns The generated PKCE code verifier or `null` when PKCE is disabled.
   */
  protected getPkceCodeVerifierForRedirect(): string | null {
    if (!this.#usesPkce()) {
      return null
    }

    const codeVerifier = this.makeCodeVerifier()
    this.ctx.response.encryptedCookie(this.codeVerifierCookieName!, codeVerifier, {
      sameSite: false,
      httpOnly: true,
    })

    this.codeVerifierCookieValue = codeVerifier
    return codeVerifier
  }

  /**
   * Returns the PKCE code verifier for the access token exchange.
   * This method only reads the verifier that was persisted during redirect.
   *
   * @returns The persisted PKCE code verifier or `null` when PKCE is disabled.
   */
  protected getPkceCodeVerifierForAccessToken(): string | null {
    if (!this.#usesPkce()) {
      return null
    }

    if (!this.codeVerifierCookieValue) {
      const error = new errors.E_OAUTH_MISSING_CODE(['code_verifier'])
      if (this.originUrlCookieValue) {
        error.setRedirectUrl(this.originUrlCookieValue)
      }
      throw error
    }

    return this.codeVerifierCookieValue
  }

  /**
   * Set the origin URL to redirect the user back to when an error
   * occurs during the OAuth callback. Without this, the error
   * handler redirects "back" which would be the OAuth provider's
   * page instead of your application.
   *
   * @param url - The URL to redirect to on error
   * @returns The current driver instance.
   *
   * @example
   * ```ts
   * await ally.use('github').setOriginUrl('/login').redirect()
   * ```
   */
  setOriginUrl(url: string): this {
    this.originUrl = url
    return this
  }

  /**
   * Get the origin URL that was set before the redirect and persisted
   * via a cookie. Available during the callback phase after `loadState`
   * has been called.
   *
   * @returns The origin URL, or `undefined` when none was set.
   *
   * @example
   * ```ts
   * const originUrl = ally.use('github').getOriginUrl()
   * ```
   */
  getOriginUrl(): string | undefined {
    return this.originUrlCookieValue
  }

  /**
   * Enable stateless authentication by disabling CSRF state verification.
   * Only use this in scenarios where state verification is not required.
   *
   * @returns The current driver instance.
   *
   * @example
   * ```ts
   * await ally.use('github').stateless().redirect()
   * ```
   */
  stateless(): this {
    this.isStateless = true
    return this
  }

  /**
   * Get the authorization redirect URL without performing the redirect.
   * Useful when you need to manually handle the redirect or use the URL
   * in a different context.
   *
   * @param callback - Optional callback to customize the redirect request
   * @returns A promise resolving to the authorization URL.
   *
   * @example
   * ```ts
   * const url = await ally.use('github').redirectUrl((request) => {
   *   request.scopes(['user:email'])
   * })
   * ```
   */
  async redirectUrl(
    callback?: (request: RedirectRequestContract<Scopes>) => void
  ): Promise<string> {
    const url = this.getRedirectUrl(callback as any)
    return url
  }

  /**
   * Redirect the user to the OAuth provider's authorization page.
   * The state parameter is automatically set for CSRF protection.
   *
   * @param callback - Optional callback to customize the redirect request
   * @returns A promise that resolves after the redirect response is prepared.
   *
   * @example
   * ```ts
   * await ally.use('github').redirect((request) => {
   *   request.scopes(['user:email', 'read:org'])
   *   request.param('allow_signup', 'false')
   * })
   * ```
   */
  async redirect(callback?: (request: RedirectRequestContract<Scopes>) => void): Promise<void> {
    const url = await this.redirectUrl((request) => {
      if (!this.isStateless) {
        const state = this.getState()
        this.ctx.response.encryptedCookie(this.stateCookieName, state, {
          sameSite: false,
          httpOnly: true,
        })
        request.param(this.stateParamName, state)

        if (this.originUrl) {
          this.ctx.response.cookie(this.originUrlCookieName, this.originUrl, {
            sameSite: false,
            httpOnly: true,
          })
        }
      }

      if (typeof callback === 'function') {
        callback(request)
      }
    })

    this.ctx.response.redirect(url)
  }

  /**
   * Check if the state parameter from the callback matches the state
   * stored in the cookie. Returns false in stateless mode.
   *
   * @returns `true` when the state validation fails.
   */
  stateMisMatch(): boolean {
    if (this.isStateless) {
      return false
    }

    if (this.stateCookieValue !== this.ctx.request.input(this.stateParamName)) {
      return true
    }

    if (this.#usesPkce() && !this.codeVerifierCookieValue) {
      return true
    }

    return false
  }

  /**
   * Check if an error was returned by the OAuth provider.
   *
   * @returns `true` when an error exists on the callback request.
   */
  hasError(): boolean {
    return !!this.getError()
  }

  /**
   * Get the error code or message returned by the OAuth provider.
   * Returns 'unknown_error' if no code is present and no error was specified.
   *
   * @returns The provider error value when present.
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
   * Get the authorization code from the callback request.
   *
   * @returns The authorization code when present.
   */
  getCode(): string | null {
    return this.ctx.request.input(this.codeParamName, null)
  }

  /**
   * Check if the authorization code is present in the callback request.
   *
   * @returns `true` when the callback request contains an authorization code.
   */
  hasCode(): boolean {
    return !!this.getCode()
  }

  /**
   * Exchange the authorization code for an access token. This method
   * validates the state and checks for errors before making the request.
   *
   * @param callback - Optional callback to customize the token request
   * @returns A promise resolving to the access token payload.
   *
   * @example
   * ```ts
   * const token = await ally.use('github').accessToken()
   * ```
   */
  async accessToken(callback?: (request: ApiRequestContract) => void): Promise<Token> {
    /**
     * We expect the user to handle errors before calling this method
     */
    if (this.hasError()) {
      const error = new errors.E_OAUTH_MISSING_CODE([this.codeParamName])
      if (this.originUrlCookieValue) {
        error.setRedirectUrl(this.originUrlCookieValue)
      }
      throw error
    }

    /**
     * We expect the user to properly handle the state mis-match use case before
     * calling this method
     */
    if (this.stateMisMatch()) {
      const error = new errors.E_OAUTH_STATE_MISMATCH()
      if (this.originUrlCookieValue) {
        error.setRedirectUrl(this.originUrlCookieValue)
      }
      throw error
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
   * Not applicable with OAuth2. Use `userFromToken` instead.
   *
   * @returns This method never returns.
   */
  async userFromTokenAndSecret(): Promise<never> {
    throw new Exception(
      '"userFromTokenAndSecret" is not applicable with Oauth2. Use "userFromToken" instead'
    )
  }
}

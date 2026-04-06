/*
 * @adonisjs/ally
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { HttpContext } from '@adonisjs/core/http'
import type { HttpClient } from '@poppinss/oauth-client'

import type {
  TwitterXToken,
  TwitterXScopes,
  AllyUserContract,
  ApiRequestContract,
  TwitterXDriverConfig,
  RedirectRequestContract,
  Oauth2AccessToken,
} from '../types.ts'
import { Oauth2Driver } from '../abstract_drivers/oauth2.ts'

/**
 * X OAuth2 driver for authenticating users via the OAuth 2.0 authorization
 * code flow with PKCE.
 */
export class TwitterXDriver extends Oauth2Driver<TwitterXToken, TwitterXScopes> {
  /**
   * X token endpoint URL.
   */
  protected accessTokenUrl = 'https://api.x.com/2/oauth2/token'
  /**
   * X authorization endpoint URL.
   */
  protected authorizeUrl = 'https://x.com/i/oauth2/authorize'
  /**
   * X user profile endpoint URL.
   */
  protected userInfoUrl = 'https://api.x.com/2/users/me'

  /**
   * The param name for the authorization code
   */
  protected codeParamName = 'code'

  /**
   * The param name for the error
   */
  protected errorParamName = 'error'

  /**
   * Cookie name for storing the "twitter_x_oauth_state"
   */
  protected stateCookieName = 'twitter_x_oauth_state'

  /**
   * Cookie name for storing the PKCE code verifier
   */
  protected codeVerifierCookieName = 'twitter_x_oauth_code_verifier'

  /**
   * Parameter name to be used for sending and receiving the state from X
   */
  protected stateParamName = 'state'

  /**
   * Parameter name for defining the scopes
   */
  protected scopeParamName = 'scope'

  /**
   * Scopes separator
   */
  protected scopesSeparator = ' '

  /**
   * Create a new X driver instance.
   *
   * @param ctx - The current HTTP context.
   * @param config - X driver configuration.
   */
  constructor(
    ctx: HttpContext,
    public config: TwitterXDriverConfig
  ) {
    super(ctx, config)
    this.loadState()
  }

  /**
   * Configures the redirect request with X-specific requirements.
   *
   * @param request - The redirect request to configure.
   */
  protected configureRedirectRequest(request: RedirectRequestContract<TwitterXScopes>) {
    request.scopes(this.config.scopes || ['tweet.read', 'users.read', 'users.email'])
    request.param('response_type', 'code')
  }

  /**
   * Configures the token request with the PKCE verifier and the Basic auth
   * header required for confidential X clients.
   *
   * @param request - The token request to configure.
   */
  protected configureAccessTokenRequest(request: ApiRequestContract) {
    const credentials = Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString(
      'base64'
    )

    request.header('Authorization', `Basic ${credentials}`)
    request.clearField('client_id')
    request.clearField('client_secret')
  }

  /**
   * Creates an authenticated request for X API calls.
   *
   * @param url - The API endpoint URL.
   * @param token - The access token to send.
   * @returns A configured HTTP client instance.
   */
  protected getAuthenticatedRequest(url: string, token: string): HttpClient {
    const request = this.httpClient(url)
    request.header('Authorization', `Bearer ${token}`)
    request.header('Accept', 'application/json')
    request.parseAs('json')
    return request
  }

  /**
   * Fetches the authenticated user's profile from /2/users/me.
   *
   * @param token - The access token to use.
   * @param includeConfirmedEmail - Whether to request the confirmed email field.
   * @param callback - Optional callback to customize the API request.
   */
  protected async getUserInfo(
    token: string,
    includeConfirmedEmail: boolean,
    callback?: (request: ApiRequestContract) => void
  ) {
    const request = this.getAuthenticatedRequest(this.config.userInfoUrl || this.userInfoUrl, token)
    request.param(
      'user.fields',
      includeConfirmedEmail ? 'profile_image_url,confirmed_email' : 'profile_image_url'
    )

    if (typeof callback === 'function') {
      callback(request)
    }

    const body = await request.get()
    const user = body.data

    return {
      id: user.id,
      nickName: user.username,
      name: user.name ?? user.username,
      email: user.confirmed_email ?? null,
      emailVerificationState: 'unsupported',
      avatarUrl: user.profile_image_url ?? null,
      original: body,
    } satisfies Omit<AllyUserContract<Oauth2AccessToken>, 'token'>
  }

  /**
   * Check if the error from the callback indicates that the user denied
   * authorization.
   *
   * @returns `true` when the provider reported an access-denied error.
   */
  accessDenied(): boolean {
    const error = this.getError()
    if (!error) {
      return false
    }

    return error === 'access_denied'
  }

  /**
   * Fetches the authenticated user using the authorization code from the
   * callback request.
   *
   * @param callback - Optional callback to customize the API request.
   */
  async user(callback?: (request: ApiRequestContract) => void) {
    const token = await this.accessToken(callback)
    const user = await this.getUserInfo(token.token, token.scope.includes('users.email'), callback)

    return {
      ...user,
      token,
    }
  }

  /**
   * Fetches the user profile using an existing access token.
   *
   * @param token - The access token to use.
   * @param callback - Optional callback to customize the API request.
   */
  async userFromToken(token: string, callback?: (request: ApiRequestContract) => void) {
    const user = await this.getUserInfo(token, false, callback)

    return {
      ...user,
      token: { token, type: 'bearer' as const },
    }
  }
}

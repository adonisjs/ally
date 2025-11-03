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

import { Oauth2Driver } from '../abstract_drivers/oauth2.ts'
import type {
  ApiRequestContract,
  LinkedInOpenidConnectAccessToken,
  LinkedInOpenidConnectDriverConfig,
  LinkedInOpenidConnectScopes,
  RedirectRequestContract,
} from '../types.ts'

/**
 * LinkedIn OpenID Connect OAuth2 driver for authenticating users via LinkedIn.
 * This driver uses the OpenID Connect protocol for authentication.
 * Supports fetching user profile information including name, email, and profile picture.
 *
 * @example
 * ```ts
 * router.get('/linkedin/redirect', ({ ally }) => {
 *   return ally.use('linkedinOpenidConnect').redirect((request) => {
 *     request.scopes(['openid', 'profile', 'email'])
 *   })
 * })
 *
 * router.get('/linkedin/callback', async ({ ally }) => {
 *   const linkedin = ally.use('linkedinOpenidConnect')
 *
 *   if (linkedin.accessDenied()) {
 *     return 'Access was denied'
 *   }
 *
 *   if (linkedin.stateMisMatch()) {
 *     return 'State mismatch error'
 *   }
 *
 *   if (linkedin.hasError()) {
 *     return linkedin.getError()
 *   }
 *
 *   const user = await linkedin.user()
 *   return user
 * })
 * ```
 */
export class LinkedInOpenidConnectDriver extends Oauth2Driver<
  LinkedInOpenidConnectAccessToken,
  LinkedInOpenidConnectScopes
> {
  protected authorizeUrl = 'https://www.linkedin.com/oauth/v2/authorization'
  protected accessTokenUrl = 'https://www.linkedin.com/oauth/v2/accessToken'
  protected userInfoUrl = 'https://api.linkedin.com/v2/userinfo'

  /**
   * The param name for the authorization code
   */
  protected codeParamName = 'code'

  /**
   * The param name for the error
   */
  protected errorParamName = 'error'

  /**
   * Cookie name for storing the "linkedin_openid_connect_oauth_state"
   */
  protected stateCookieName = 'linkedin_openid_connect_oauth_state'

  /**
   * Parameter name to be used for sending and receiving the state
   * from linkedin
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
   * @param ctx - The HTTP context
   * @param config - Configuration for the LinkedIn OpenID Connect driver
   */
  constructor(
    ctx: HttpContext,
    public config: LinkedInOpenidConnectDriverConfig
  ) {
    super(ctx, config)
    /**
     * Extremely important to call the following method to clear the
     * state set by the redirect request.
     *
     * DO NOT REMOVE THE FOLLOWING LINE
     */
    this.loadState()
  }

  /**
   * Configures the redirect request with default scopes for OpenID Connect.
   *
   * @param request - The redirect request to configure
   */
  protected configureRedirectRequest(
    request: RedirectRequestContract<LinkedInOpenidConnectScopes>
  ) {
    /**
     * Define user defined scopes or the default one's
     */
    request.scopes(this.config.scopes || ['openid', 'profile', 'email'])

    /**
     * Set "response_type" param
     */
    request.param('response_type', 'code')
  }

  /**
   * Creates an authenticated HTTP request with the proper authorization
   * header for LinkedIn API calls.
   *
   * @param url - The API endpoint URL
   * @param token - The access token
   */
  protected getAuthenticatedRequest(url: string, token: string): HttpClient {
    const request = this.httpClient(url)
    request.header('Authorization', `Bearer ${token}`)
    request.header('Accept', 'application/json')
    request.parseAs('json')
    return request
  }

  /**
   * Fetches the authenticated user's profile information from the LinkedIn API
   * using the OpenID Connect userinfo endpoint.
   *
   * @param token - The access token
   * @param callback - Optional callback to customize the API request
   */
  protected async getUserInfo(token: string, callback?: (request: ApiRequestContract) => void) {
    let url = this.config.userInfoUrl || this.userInfoUrl
    const request = this.getAuthenticatedRequest(url, token)

    if (typeof callback === 'function') {
      callback(request)
    }

    const body = await request.get()
    const emailVerificationState: 'verified' | 'unverified' = body.email_verified
      ? 'verified'
      : 'unverified'

    return {
      id: body.sub,
      nickName: body.given_name,
      name: body.family_name,
      avatarUrl: body.picture,
      email: body.email,
      emailVerificationState,
      original: body,
    }
  }

  /**
   * Check if the error from the callback indicates that the user
   * denied authorization or cancelled the login.
   */
  accessDenied(): boolean {
    const error = this.getError()
    if (!error) {
      return false
    }

    return error === 'user_cancelled_login' || error === 'user_cancelled_authorize'
  }

  /**
   * Get the authenticated user's profile information using
   * the authorization code from the callback request.
   *
   * @param callback - Optional callback to customize the API request
   *
   * @example
   * ```ts
   * const user = await ally.use('linkedinOpenidConnect').user()
   * console.log(user.name, user.email)
   * ```
   */
  async user(callback?: (request: ApiRequestContract) => void) {
    const accessToken = await this.accessToken(callback)
    const userInfo = await this.getUserInfo(accessToken.token, callback)

    return {
      ...userInfo,
      token: { ...accessToken },
    }
  }

  /**
   * Get the user's profile information using an existing
   * access token.
   *
   * @param token - The LinkedIn access token
   * @param callback - Optional callback to customize the API request
   *
   * @example
   * ```ts
   * const user = await ally.use('linkedinOpenidConnect').userFromToken(accessToken)
   * ```
   */
  async userFromToken(token: string, callback?: (request: ApiRequestContract) => void) {
    const user = await this.getUserInfo(token, callback)

    return {
      ...user,
      token: { token, type: 'bearer' as const },
    }
  }
}

/*
 * @adonisjs/ally
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { HttpClient } from '@poppinss/oauth-client'
import type { HttpContext } from '@adonisjs/core/http'
import type {
  FacebookToken,
  FacebookScopes,
  LiteralStringUnion,
  ApiRequestContract,
  FacebookDriverConfig,
  FacebookProfileFields,
  RedirectRequestContract,
} from '../types.ts'
import { Oauth2Driver } from '../abstract_drivers/oauth2.ts'

/**
 * Facebook OAuth2 driver for authenticating users via Facebook.
 * Supports fetching user profile information including name, email, and profile picture.
 *
 * @example
 * ```ts
 * router.get('/facebook/redirect', ({ ally }) => {
 *   return ally.use('facebook').redirect((request) => {
 *     request.scopes(['email', 'public_profile'])
 *   })
 * })
 *
 * router.get('/facebook/callback', async ({ ally }) => {
 *   const facebook = ally.use('facebook')
 *
 *   if (facebook.accessDenied()) {
 *     return 'Access was denied'
 *   }
 *
 *   if (facebook.stateMisMatch()) {
 *     return 'State mismatch error'
 *   }
 *
 *   if (facebook.hasError()) {
 *     return facebook.getError()
 *   }
 *
 *   const user = await facebook.user()
 *   return user
 * })
 * ```
 */
export class FacebookDriver extends Oauth2Driver<FacebookToken, FacebookScopes> {
  protected accessTokenUrl = 'https://graph.facebook.com/v10.0/oauth/access_token'
  protected authorizeUrl = 'https://www.facebook.com/v10.0/dialog/oauth'
  protected userInfoUrl = 'https://graph.facebook.com/v10.0/me'

  /**
   * The default set of fields to query for the user request
   */
  protected userFields: LiteralStringUnion<FacebookProfileFields>[] = [
    'name',
    'first_name',
    'last_name',
    'link',
    'email',
    'picture.width(400).height(400)',
    'verified',
  ]

  /**
   * The param name for the authorization code
   */
  protected codeParamName = 'code'

  /**
   * The param name for the error
   */
  protected errorParamName = 'error'

  /**
   * Cookie name for storing the "facebok_oauth_state"
   */
  protected stateCookieName = 'facebok_oauth_state'

  /**
   * Parameter name to be used for sending and receiving the state
   * from Facebok
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
   * @param config - Configuration for the Facebook driver
   */
  constructor(
    ctx: HttpContext,
    public config: FacebookDriverConfig
  ) {
    super(ctx, config)

    /**
     * Extremely important to call the following method to clear the
     * state set by the redirect request
     */
    this.loadState()
  }

  /**
   * Configures the redirect request with default scopes and Facebook-specific
   * parameters like display and auth_type.
   *
   * @param request - The redirect request to configure
   */
  protected configureRedirectRequest(request: RedirectRequestContract<FacebookScopes>) {
    /**
     * Define user defined scopes or the default one's
     */
    request.scopes(this.config.scopes || ['email'])

    request.param('response_type', 'code')
    request.param('grant_type', 'authorization_code')

    /**
     * Define params based upon user config
     */
    if (this.config.display) {
      request.param('display', this.config.display)
    }
    if (this.config.authType) {
      request.param('auth_type', this.config.authType)
    }
  }

  /**
   * Creates an authenticated HTTP request with the proper authorization
   * header for Facebook API calls.
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
   * Fetches the authenticated user's profile information from the Facebook API.
   *
   * @param token - The access token
   * @param callback - Optional callback to customize the API request
   *
   * @see https://developers.facebook.com/docs/graph-api/reference/user/
   */
  protected async getUserInfo(token: string, callback?: (request: ApiRequestContract) => void) {
    const request = this.getAuthenticatedRequest(this.config.userInfoUrl || this.userInfoUrl, token)
    request.param('fields', (this.config.userFields || this.userFields).join(','))

    const body = await request.get()

    /**
     * Invoke callback if defined
     */
    if (typeof callback === 'function') {
      callback(request)
    }

    return {
      id: body.id,
      name: body.name,
      nickName: body.name,
      // https://developers.facebook.com/docs/graph-api/reference/user/picture/
      avatarUrl: body.picture?.data?.url || null,
      email: body.email || null, // May not always be there (requires email scope)
      // Important note: https://developers.facebook.com/docs/facebook-login/multiple-providers#postfb1
      emailVerificationState:
        'verified' in body
          ? body.verified
            ? ('verified' as const)
            : ('unverified' as const)
          : ('unsupported' as const),
      original: body,
    }
  }

  /**
   * Check if the error from the callback indicates that the user
   * denied authorization.
   */
  accessDenied(): boolean {
    const error = this.getError()
    if (!error) {
      return false
    }

    return error === 'access_denied'
  }

  /**
   * Get the authenticated user's profile information using
   * the authorization code from the callback request.
   *
   * @param callback - Optional callback to customize the API request
   *
   * @example
   * ```ts
   * const user = await ally.use('facebook').user()
   * console.log(user.name, user.email)
   * ```
   */
  async user(callback?: (request: ApiRequestContract) => void) {
    const token = await this.accessToken(callback)
    const user = await this.getUserInfo(token.token, callback)

    return {
      ...user,
      token,
    }
  }

  /**
   * Get the user's profile information using an existing
   * access token.
   *
   * @param token - The Facebook access token
   * @param callback - Optional callback to customize the API request
   *
   * @example
   * ```ts
   * const user = await ally.use('facebook').userFromToken(accessToken)
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

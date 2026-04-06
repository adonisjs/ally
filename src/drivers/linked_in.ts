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
import type { HttpClient } from '@poppinss/oauth-client'
import type {
  LinkedInToken,
  LinkedInScopes,
  ApiRequestContract,
  LinkedInDriverConfig,
  RedirectRequestContract,
  AllyUserContract,
  Oauth2AccessToken,
} from '../types.ts'
import { Oauth2Driver } from '../abstract_drivers/oauth2.ts'

/**
 * LinkedIn OAuth2 driver for authenticating users via LinkedIn.
 * Supports fetching user profile information including name, email, and profile picture.
 * Note: This driver fetches email separately as it's not included in the basic profile.
 *
 * @example
 * ```ts
 * router.get('/linkedin/redirect', ({ ally }) => {
 *   return ally.use('linkedin').redirect((request) => {
 *     request.scopes(['r_emailaddress', 'r_liteprofile'])
 *   })
 * })
 *
 * router.get('/linkedin/callback', async ({ ally }) => {
 *   const linkedin = ally.use('linkedin')
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
export class LinkedInDriver extends Oauth2Driver<LinkedInToken, LinkedInScopes> {
  /**
   * LinkedIn token endpoint URL.
   */
  protected accessTokenUrl = 'https://www.linkedin.com/oauth/v2/accessToken'
  /**
   * LinkedIn authorization endpoint URL.
   */
  protected authorizeUrl = 'https://www.linkedin.com/oauth/v2/authorization'
  /**
   * LinkedIn profile endpoint URL.
   */
  protected userInfoUrl = 'https://api.linkedin.com/v2/me'
  /**
   * LinkedIn email endpoint URL.
   */
  protected userEmailUrl = 'https://api.linkedin.com/v2/clientAwareMemberHandles'

  /**
   * The param name for the authorization code
   */
  protected codeParamName = 'code'

  /**
   * The param name for the error
   */
  protected errorParamName = 'error'

  /**
   * Cookie name for storing the "linkedin_oauth_state"
   */
  protected stateCookieName = 'linkedin_oauth_state'

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
   * @param config - Configuration for the LinkedIn driver
   */
  constructor(
    ctx: HttpContext,
    public config: LinkedInDriverConfig
  ) {
    super(ctx, config)
    /**
     * Extremely important to call the following method to clear the
     * state set by the redirect request
     */
    this.loadState()
  }

  /**
   * Configures the redirect request with default scopes.
   *
   * @param request - The redirect request to configure
   */
  protected configureRedirectRequest(request: RedirectRequestContract<LinkedInScopes>) {
    /**
     * Define user defined scopes or the default one's
     */
    request.scopes(this.config.scopes || ['r_emailaddress', 'r_liteprofile'])

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
   * Fetches the authenticated user's profile information from the LinkedIn API.
   *
   * @param token - The access token
   * @param callback - Optional callback to customize the API request
   */
  protected async getUserInfo(token: string, callback?: (request: ApiRequestContract) => void) {
    let url = this.config.userInfoUrl || this.userInfoUrl
    const request = this.getAuthenticatedRequest(url, token)
    request.param(
      'projection',
      '(id,localizedLastName,localizedFirstName,vanityName,profilePicture(displayImage~digitalmediaAsset:playableStreams))'
    )

    if (typeof callback === 'function') {
      callback(request)
    }

    const body = await request.get()

    /**
     * Finding the user avatar
     */
    let avatar: string = ''
    if (body.profilePicture) {
      const avatars = body.profilePicture['displayImage~']['elements'] || []
      if (avatars.length && avatars[0].identifiers && avatars[0].identifiers.length) {
        avatar = avatars[0].identifiers[0].identifier
      }
    }

    return {
      id: body.id,
      nickName: body.vanityName || `${body.localizedFirstName} ${body.localizedLastName}`,
      name: `${body.localizedFirstName} ${body.localizedLastName}`,
      avatarUrl: avatar,
      original: body,
    } satisfies Omit<
      AllyUserContract<Oauth2AccessToken>,
      'token' | 'email' | 'emailVerificationState'
    >
  }

  /**
   * Fetches the user's email address from the LinkedIn API.
   * Requires the 'r_emailaddress' scope.
   *
   * @param token - The access token
   * @param callback - Optional callback to customize the API request
   */
  protected async getUserEmail(token: string, callback?: (request: ApiRequestContract) => void) {
    let url = this.config.userEmailUrl || this.userEmailUrl
    const request = this.getAuthenticatedRequest(url, token)
    request.param('q', 'members')
    request.param('projection', '(elements*(primary,type,handle~))')

    if (typeof callback === 'function') {
      callback(request)
    }

    const body = await request.get()
    let mainEmail = body.elements.find((resource: any) => {
      return resource.type === 'EMAIL' && resource['handle~']
    })

    /**
     * We except email to always exist
     */
    if (!mainEmail) {
      throw new Exception(
        'Cannot request user email. Make sure you are using the "r_emailaddress" scope'
      )
    }

    return mainEmail['handle~']['emailAddress']
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
   * Get the authenticated user's profile and email information using
   * the authorization code from the callback request.
   *
   * @param callback - Optional callback to customize the API request
   *
   * @example
   * ```ts
   * const user = await ally.use('linkedin').user()
   * console.log(user.name, user.email)
   * ```
   */
  async user(callback?: (request: ApiRequestContract) => void) {
    const token = await this.accessToken(callback)
    const user = await this.getUserInfo(token.token, callback)
    const email = await this.getUserEmail(token.token, callback)

    return {
      ...user,
      email: email,
      emailVerificationState: 'unsupported' as const,
      token: token,
    }
  }

  /**
   * Get the user's profile and email information using an existing
   * access token.
   *
   * @param token - The LinkedIn access token
   * @param callback - Optional callback to customize the API request
   *
   * @example
   * ```ts
   * const user = await ally.use('linkedin').userFromToken(accessToken)
   * ```
   */
  async userFromToken(token: string, callback?: (request: ApiRequestContract) => void) {
    const user = await this.getUserInfo(token, callback)
    const email = await this.getUserEmail(token, callback)

    return {
      ...user,
      email: email,
      emailVerificationState: 'unsupported' as const,
      token: { token, type: 'bearer' as const },
    }
  }
}

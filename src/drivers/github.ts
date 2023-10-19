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
  GithubToken,
  GithubScopes,
  AllyUserContract,
  GithubDriverConfig,
  ApiRequestContract,
  RedirectRequestContract,
} from '../types.js'
import { Oauth2Driver } from '../abstract_drivers/oauth2.js'

/**
 * Github driver to login user via Github
 */
export class GithubDriver extends Oauth2Driver<GithubToken, GithubScopes> {
  protected accessTokenUrl = 'https://github.com/login/oauth/access_token'
  protected authorizeUrl = 'https://github.com/login/oauth/authorize'
  protected userInfoUrl = 'https://api.github.com/user'
  protected userEmailUrl = 'https://api.github.com/user/emails'

  /**
   * The param name for the authorization code
   */
  protected codeParamName = 'code'

  /**
   * The param name for the error
   */
  protected errorParamName = 'error'

  /**
   * Cookie name for storing the "gh_oauth_state"
   */
  protected stateCookieName = 'gh_oauth_state'

  /**
   * Parameter name to be used for sending and receiving the state
   * from Github
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

  constructor(
    ctx: HttpContext,
    public config: GithubDriverConfig
  ) {
    super(ctx, config)
    /**
     * Extremely important to call the following method to clear the
     * state set by the redirect request
     */
    this.loadState()
  }

  /**
   * Configuring the redirect request with defaults
   */
  protected configureRedirectRequest(request: RedirectRequestContract<GithubScopes>) {
    /**
     * Define user defined scopes or the default one's
     */
    request.scopes(this.config.scopes || ['user'])

    /**
     * Set "allow_signup" option when defined
     */
    if (this.config.allowSignup !== undefined) {
      request.param('allow_signup', this.config.allowSignup)
    }

    /**
     * Set "login" option when defined
     */
    if (this.config.login) {
      request.param('login', this.config.login)
    }
  }

  /**
   * Configuring the access token API request to send extra fields
   */
  protected configureAccessTokenRequest(request: ApiRequestContract) {
    /**
     * Send state to github when request is not stateles
     */
    if (!this.isStateless) {
      request.field('state', this.stateCookieValue)
    }

    /**
     * Clearing the default defined "grant_type". Github doesn't accept this.
     * https://github.com/poppinss/oauth-client#following-is-the-list-of-fieldsparams-set-by-the-clients-implicitly
     */
    request.clearField('grant_type')
  }

  /**
   * Returns the HTTP request with the authorization header set
   */
  protected getAuthenticatedRequest(url: string, token: string): HttpClient {
    const request = this.httpClient(url)
    request.header('Authorization', `token ${token}`)
    request.header('Accept', 'application/json')
    request.parseAs('json')
    return request
  }

  /**
   * Fetches the user info from the Github API
   * https://docs.github.com/en/rest/reference/users#get-the-authenticated-user
   */
  protected async getUserInfo(token: string, callback?: (request: ApiRequestContract) => void) {
    const request = this.getAuthenticatedRequest(this.config.userInfoUrl || this.userInfoUrl, token)
    if (typeof callback === 'function') {
      callback(request)
    }

    const body = await request.get()
    return {
      id: body.id,
      nickName: body.name,
      email: body.email, // May not always be there
      emailVerificationState: (body.email
        ? 'verified'
        : 'unsupported') as AllyUserContract<any>['emailVerificationState'],
      name: body.name,
      avatarUrl: body.avatar_url,
      original: body,
    }
  }

  /**
   * Fetches the user email from the Github API.
   * https://docs.github.com/en/rest/reference/users#list-email-addresses-for-the-authenticated-user
   */
  protected async getUserEmail(token: string, callback?: (request: ApiRequestContract) => void) {
    const request = this.getAuthenticatedRequest(
      this.config.userEmailUrl || this.userEmailUrl,
      token
    )

    if (typeof callback === 'function') {
      callback(request)
    }

    try {
      let emails = await request.get()

      /**
       * Sort emails to keep the primary ones on the top
       */
      emails = emails.sort((email: any) => (email.primary ? -1 : 1))

      /**
       * Get the first verified email of the user
       */
      let mainEmail = emails.find((email: any) => email.verified)

      /**
       * If there are no verified emails, then get any first one
       */
      if (!mainEmail) {
        mainEmail = emails[0]
      }

      return mainEmail
    } catch (error) {
      if (error && error.response && error.response.statusCode === 404) {
        return
      }
      throw error
    }
  }

  /**
   * Find if the current error code is for access denied
   */
  accessDenied(): boolean {
    const error = this.getError()
    if (!error) {
      return false
    }

    return error === 'access_denied'
  }

  /**
   * Returns details for the authorized user
   */
  async user(callback?: (request: ApiRequestContract) => void) {
    const token = await this.accessToken(callback)
    const user = await this.getUserInfo(token.token, callback)

    /**
     * Fetch email separately
     */
    if (!user.email) {
      this.ctx.logger.trace('Fetching github user email separately')

      const emailResponse = await this.getUserEmail(token.token, callback)
      if (emailResponse) {
        user.email = emailResponse.email
        user.emailVerificationState = emailResponse.verified
          ? ('verified' as const)
          : ('unverified' as const)
      }
    }

    return {
      ...user,
      token: token,
    }
  }

  /**
   * Finds the user by the access token
   */
  async userFromToken(token: string, callback?: (request: ApiRequestContract) => void) {
    const user = await this.getUserInfo(token, callback)

    /**
     * Fetch email separately
     */
    if (!user.email) {
      this.ctx.logger.trace('Fetching github user email separately')

      const emailResponse = await this.getUserEmail(token, callback)
      if (emailResponse) {
        user.email = emailResponse.email
        user.emailVerificationState = emailResponse.verified
          ? ('verified' as const)
          : ('unverified' as const)
      }
    }

    return {
      ...user,
      token: { token, type: 'bearer' as const },
    }
  }
}

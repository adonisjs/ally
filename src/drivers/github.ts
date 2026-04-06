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
  Oauth2AccessToken,
} from '../types.ts'
import { Oauth2Driver } from '../abstract_drivers/oauth2.ts'

/**
 * GitHub OAuth2 driver for authenticating users via GitHub.
 * Supports fetching user profile information and email addresses.
 *
 * @example
 * ```ts
 * router.get('/github/redirect', ({ ally }) => {
 *   return ally.use('github').redirect((request) => {
 *     request.scopes(['user:email', 'read:org'])
 *   })
 * })
 *
 * router.get('/github/callback', async ({ ally }) => {
 *   const github = ally.use('github')
 *
 *   if (github.accessDenied()) {
 *     return 'Access was denied'
 *   }
 *
 *   if (github.stateMisMatch()) {
 *     return 'State mismatch error'
 *   }
 *
 *   if (github.hasError()) {
 *     return github.getError()
 *   }
 *
 *   const user = await github.user()
 *   return user
 * })
 * ```
 */
export class GithubDriver extends Oauth2Driver<GithubToken, GithubScopes> {
  /**
   * GitHub token endpoint URL.
   */
  protected accessTokenUrl = 'https://github.com/login/oauth/access_token'
  /**
   * GitHub authorization endpoint URL.
   */
  protected authorizeUrl = 'https://github.com/login/oauth/authorize'
  /**
   * GitHub profile endpoint URL.
   */
  protected userInfoUrl = 'https://api.github.com/user'
  /**
   * GitHub email endpoint URL.
   */
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

  /**
   * @param ctx - The HTTP context
   * @param config - Configuration for the GitHub driver
   */
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
   * Configures the redirect request with default scopes and GitHub-specific
   * parameters like allow_signup and login.
   *
   * @param request - The redirect request to configure
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
   * Configures the access token request with GitHub-specific requirements.
   * GitHub doesn't accept the grant_type field that is set by default.
   *
   * @param request - The API request to configure
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
   * Creates an authenticated HTTP request with the proper authorization
   * header for GitHub API calls.
   *
   * @param url - The API endpoint URL
   * @param token - The access token
   */
  protected getAuthenticatedRequest(url: string, token: string): HttpClient {
    const request = this.httpClient(url)
    request.header('Authorization', `token ${token}`)
    request.header('Accept', 'application/json')
    request.parseAs('json')
    return request
  }

  /**
   * Fetches the authenticated user's profile information from the GitHub API.
   *
   * @param token - The access token
   * @param callback - Optional callback to customize the API request
   *
   * @see https://docs.github.com/en/rest/reference/users#get-the-authenticated-user
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
      name: body.name ?? body.login,
      avatarUrl: body.avatar_url,
      original: body,
    } satisfies Omit<AllyUserContract<Oauth2AccessToken>, 'token'>
  }

  /**
   * Fetches the user's email addresses from the GitHub API. This is needed
   * when the user's email is not included in the basic profile response.
   * Returns the primary verified email, or the first available email.
   *
   * @param token - The access token
   * @param callback - Optional callback to customize the API request
   *
   * @see https://docs.github.com/en/rest/reference/users#list-email-addresses-for-the-authenticated-user
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
      if (
        error &&
        typeof error === 'object' &&
        'response' in error &&
        error.response &&
        typeof error.response === 'object' &&
        'statusCode' in error.response &&
        error.response.statusCode === 404
      ) {
        return
      }
      throw error
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
   * Get the authenticated user's profile and email information using
   * the authorization code from the callback request.
   *
   * @param callback - Optional callback to customize the API request
   *
   * @example
   * ```ts
   * const user = await ally.use('github').user()
   * console.log(user.name, user.email)
   * ```
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
   * Get the user's profile and email information using an existing
   * access token.
   *
   * @param token - The GitHub access token
   * @param callback - Optional callback to customize the API request
   *
   * @example
   * ```ts
   * const user = await ally.use('github').userFromToken(accessToken)
   * ```
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

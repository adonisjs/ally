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
  GoogleToken,
  GoogleScopes,
  GoogleDriverConfig,
  ApiRequestContract,
  RedirectRequestContract,
  AllyUserContract,
  Oauth2AccessToken,
} from '../types.ts'
import { Oauth2Driver } from '../abstract_drivers/oauth2.ts'

const SCOPE_PREFIXES = {
  'https://www.googleapis.com/auth': [
    'userinfo.email',
    'userinfo.profile',
    'contacts',
    'contacts.other.readonly',
    'contacts.readonly',
    'directory.readonly',
    'user.addresses.read',
    'user.birthday.read',
    'user.emails.read',
    'user.gender.read',
    'user.organization.read',
    'user.phonenumbers.read',
    'analytics',
    'analytics.readonly',
    'documents',
    'documents.readonly',
    'forms',
    'forms.currentonly',
    'groups',
    'spreadsheets',
    'calendar',
    'calendar.events',
    'calendar.events.readonly',
    'calendar.readonly',
    'calendar.settings.readonly',
    'drive',
    'drive.appdata',
    'drive.file',
    'drive.metadata',
    'drive.metadata.readonly',
    'drive.photos.readonly',
    'drive.readonly',
    'drive.scripts',
  ],
}

/**
 * Google OAuth2 driver for authenticating users via Google.
 * Supports fetching user profile information including name, email, and profile picture.
 * Automatically prefixes scopes with the appropriate Google API URL.
 *
 * @example
 * ```ts
 * router.get('/google/redirect', ({ ally }) => {
 *   return ally.use('google').redirect((request) => {
 *     request.scopes(['userinfo.email', 'userinfo.profile', 'calendar.readonly'])
 *   })
 * })
 *
 * router.get('/google/callback', async ({ ally }) => {
 *   const google = ally.use('google')
 *
 *   if (google.accessDenied()) {
 *     return 'Access was denied'
 *   }
 *
 *   if (google.stateMisMatch()) {
 *     return 'State mismatch error'
 *   }
 *
 *   if (google.hasError()) {
 *     return google.getError()
 *   }
 *
 *   const user = await google.user()
 *   return user
 * })
 * ```
 */
export class GoogleDriver extends Oauth2Driver<GoogleToken, GoogleScopes> {
  protected accessTokenUrl = 'https://oauth2.googleapis.com/token'
  protected authorizeUrl = 'https://accounts.google.com/o/oauth2/v2/auth'
  protected userInfoUrl = 'https://www.googleapis.com/oauth2/v3/userinfo'

  /**
   * The param name for the authorization code
   */
  protected codeParamName = 'code'

  /**
   * The param name for the error
   */
  protected errorParamName = 'error'

  /**
   * Cookie name for storing the "google_oauth_state"
   */
  protected stateCookieName = 'google_oauth_state'

  /**
   * Parameter name to be used for sending and receiving the state
   * from google
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
   * @param config - Configuration for the Google driver
   */
  constructor(
    ctx: HttpContext,
    public config: GoogleDriverConfig
  ) {
    super(ctx, config)
    /**
     * Extremely important to call the following method to clear the
     * state set by the redirect request
     */
    this.loadState()
  }

  /**
   * Configures the redirect request with default scopes and Google-specific
   * parameters like access_type, prompt, display, and hosted domain.
   *
   * @param request - The redirect request to configure
   */
  protected configureRedirectRequest(request: RedirectRequestContract<GoogleScopes>) {
    request.transformScopes((scopes) => this.buildScopes(scopes))

    /**
     * Define user defined scopes or the default one's
     */
    request.scopes(this.config.scopes || ['openid', 'userinfo.email', 'userinfo.profile'])

    /**
     * Set "response_type" param
     */
    request.param('response_type', 'code')

    /**
     * Define params based upon user config
     */
    if (this.config.accessType) {
      request.param('access_type', this.config.accessType)
    }
    if (this.config.prompt) {
      request.param('prompt', this.config.prompt)
    }
    if (this.config.display) {
      request.param('display', this.config.display)
    }
    if (this.config.hostedDomain) {
      request.param('hd', this.config.hostedDomain)
    }
  }

  /**
   * Creates an authenticated HTTP request with the proper authorization
   * header for Google API calls.
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
   * Fetches the authenticated user's profile information from the Google API.
   *
   * @param token - The access token
   * @param callback - Optional callback to customize the API request
   */
  protected async getUserInfo(token: string, callback?: (request: ApiRequestContract) => void) {
    const request = this.getAuthenticatedRequest(this.config.userInfoUrl || this.userInfoUrl, token)
    if (typeof callback === 'function') {
      callback(request)
    }

    const body = await request.get()

    return {
      id: body.sub,
      nickName: body.name,
      name: body.name,
      email: body.email,
      avatarUrl: body.picture,
      emailVerificationState: body.email_verified ? ('verified' as const) : ('unverified' as const),
      original: body,
    } satisfies Omit<AllyUserContract<Oauth2AccessToken>, 'token'>
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
   * Get the access token using the authorization code from the callback request.
   * Returns a GoogleToken that includes the ID token.
   *
   * @param callback - Optional callback to customize the API request
   */
  async accessToken(callback?: (request: ApiRequestContract) => void): Promise<GoogleToken> {
    const token = await super.accessToken(callback)

    return {
      ...token,
      idToken: token.id_token,
    }
  }

  /**
   * Get the authenticated user's profile information using
   * the authorization code from the callback request.
   *
   * @param callback - Optional callback to customize the API request
   *
   * @example
   * ```ts
   * const user = await ally.use('google').user()
   * console.log(user.name, user.email)
   * ```
   */
  async user(callback?: (request: ApiRequestContract) => void) {
    const token = await this.accessToken(callback)
    const user = await this.getUserInfo(token.token, callback)

    return {
      ...user,
      token: token,
    }
  }

  /**
   * Get the user's profile information using an existing
   * access token.
   *
   * @param token - The Google access token
   * @param callback - Optional callback to customize the API request
   *
   * @example
   * ```ts
   * const user = await ally.use('google').userFromToken(accessToken)
   * ```
   */
  async userFromToken(token: string, callback?: (request: ApiRequestContract) => void) {
    const user = await this.getUserInfo(token, callback)

    return {
      ...user,
      token: { token, type: 'bearer' as const },
    }
  }

  /**
   * Prefixes Google scopes with the appropriate API URL.
   * Converts short scope names like 'userinfo.email' to full URLs.
   *
   * @param scopes - Array of scope names to prefix
   */
  buildScopes(scopes: string[]) {
    return scopes.map((name) => {
      const prefix = Object.keys(SCOPE_PREFIXES).find((one) =>
        SCOPE_PREFIXES[one as keyof typeof SCOPE_PREFIXES].includes(name)
      )
      return prefix ? `${prefix}/${name}` : name
    })
  }
}

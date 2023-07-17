/*
 * @adonisjs/ally
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { HttpContext } from '@adonisjs/core/http'
import {
  GoogleToken,
  GoogleScopes,
  GoogleDriverConfig,
  ApiRequestContract,
  GoogleDriverContract,
  RedirectRequestContract,
} from '../types.js'
import { Oauth2Driver } from '../abstract_drivers/oauth2.js'

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
 * Google driver to login user via Google
 */
export class GoogleDriver
  extends Oauth2Driver<GoogleToken, GoogleScopes>
  implements GoogleDriverContract
{
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
   * Configuring the redirect request with defaults
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
   * Returns the HTTP request with the authorization header set
   */
  protected getAuthenticatedRequest(url: string, token: string) {
    const request = this.httpClient(url)
    request.header('Authorization', `Bearer ${token}`)
    request.header('Accept', 'application/json')
    request.parseAs('json')
    return request
  }

  /**
   * Fetches the user info from the Google API
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
   * Get access token
   */
  async accessToken(callback?: (request: ApiRequestContract) => void): Promise<GoogleToken> {
    const token = await super.accessToken(callback)

    return {
      ...token,
      idToken: token.id_token,
    }
  }

  /**
   * Returns details for the authorized user
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
   * Finds the user by the access token
   */
  async userFromToken(token: string, callback?: (request: ApiRequestContract) => void) {
    const user = await this.getUserInfo(token, callback)

    return {
      ...user,
      token: { token, type: 'bearer' as const },
    }
  }

  /**
   * Prefixes google scopes with the url
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

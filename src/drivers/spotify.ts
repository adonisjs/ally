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
  SpotifyScopes,
  SpotifyToken,
  ApiRequestContract,
  SpotifyDriverConfig,
  RedirectRequestContract,
  AllyUserContract,
  Oauth2AccessToken,
} from '../types.ts'
import { Oauth2Driver } from '../abstract_drivers/oauth2.ts'

/**
 * Spotify OAuth2 driver for authenticating users via Spotify.
 * Supports fetching user profile information including display name, email, and profile images.
 *
 * @example
 * ```ts
 * router.get('/spotify/redirect', ({ ally }) => {
 *   return ally.use('spotify').redirect((request) => {
 *     request.scopes(['user-read-email', 'user-read-private'])
 *   })
 * })
 *
 * router.get('/spotify/callback', async ({ ally }) => {
 *   const spotify = ally.use('spotify')
 *
 *   if (spotify.accessDenied()) {
 *     return 'Access was denied'
 *   }
 *
 *   if (spotify.stateMisMatch()) {
 *     return 'State mismatch error'
 *   }
 *
 *   if (spotify.hasError()) {
 *     return spotify.getError()
 *   }
 *
 *   const user = await spotify.user()
 *   return user
 * })
 * ```
 */
export class SpotifyDriver extends Oauth2Driver<SpotifyToken, SpotifyScopes> {
  /**
   * Spotify token endpoint URL.
   */
  protected accessTokenUrl = 'https://accounts.spotify.com/api/token'
  /**
   * Spotify authorization endpoint URL.
   */
  protected authorizeUrl = 'https://accounts.spotify.com/authorize'
  /**
   * Spotify profile endpoint URL.
   */
  protected userInfoUrl = 'https://api.spotify.com/v1/me'

  /**
   * The param name for the authorization code
   */
  protected codeParamName = 'code'

  /**
   * The param name for the error
   */
  protected errorParamName = 'error'

  /**
   * Cookie name for storing the "spotify_oauth_state"
   */
  protected stateCookieName = 'spotify_oauth_state'

  /**
   * Parameter name to be used for sending and receiving the state
   * from Spotify
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
   * @param config - Configuration for the Spotify driver
   */
  constructor(
    ctx: HttpContext,
    public config: SpotifyDriverConfig
  ) {
    super(ctx, config)

    /**
     * Extremely important to call the following method to clear the
     * state set by the redirect request
     */
    this.loadState()
  }

  /**
   * Configures the redirect request with default scopes and Spotify-specific
   * parameters like show_dialog.
   *
   * @param request - The redirect request to configure
   */
  protected configureRedirectRequest(request: RedirectRequestContract<SpotifyScopes>) {
    /**
     * Define user defined scopes or the default one's
     */
    request.scopes(this.config.scopes || ['user-read-email'])

    request.param('response_type', 'code')
    request.param('grant_type', 'authorization_code')

    /**
     * Define params based upon user config
     */
    if (this.config.showDialog) {
      request.param('show_dialog', this.config.showDialog)
    }
  }

  /**
   * Creates an authenticated HTTP request with the proper authorization
   * header for Spotify API calls.
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
   * Fetches the authenticated user's profile information from the Spotify API.
   *
   * @param token - The access token
   * @param callback - Optional callback to customize the API request
   *
   * @see https://developer.spotify.com/documentation/web-api/reference/get-current-users-profile
   */
  protected async getUserInfo(token: string, callback?: (request: ApiRequestContract) => void) {
    const request = this.getAuthenticatedRequest(this.userInfoUrl, token)
    if (typeof callback === 'function') {
      callback(request)
    }

    const body = await request.get()

    return {
      id: body.id,
      nickName: body.display_name,
      name: body.display_name,
      email: body.email,
      avatarUrl: body.images[0]?.url || null,
      emailVerificationState: 'unsupported' as const,
      original: body,
    } satisfies Omit<AllyUserContract<Oauth2AccessToken>, 'token'>
  }

  /**
   * Check if the error from the callback indicates that the user
   * denied authorization.
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
   * Get the authenticated user's profile information using
   * the authorization code from the callback request.
   *
   * @param callback - Optional callback to customize the API request
   *
   * @example
   * ```ts
   * const user = await ally.use('spotify').user()
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
   * @param token - The Spotify access token
   * @param callback - Optional callback to customize the API request
   *
   * @example
   * ```ts
   * const user = await ally.use('spotify').userFromToken(accessToken)
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

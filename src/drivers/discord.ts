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
  DiscordScopes,
  DiscordToken,
  ApiRequestContract,
  DiscordDriverConfig,
  RedirectRequestContract,
  AllyUserContract,
  Oauth2AccessToken,
} from '../types.ts'
import { Oauth2Driver } from '../abstract_drivers/oauth2.ts'

/**
 * Discord OAuth2 driver for authenticating users via Discord.
 * Supports fetching user profile information including username and email.
 *
 * @example
 * ```ts
 * router.get('/discord/redirect', ({ ally }) => {
 *   return ally.use('discord').redirect((request) => {
 *     request.scopes(['identify', 'email', 'guilds'])
 *   })
 * })
 *
 * router.get('/discord/callback', async ({ ally }) => {
 *   const discord = ally.use('discord')
 *
 *   if (discord.accessDenied()) {
 *     return 'Access was denied'
 *   }
 *
 *   if (discord.stateMisMatch()) {
 *     return 'State mismatch error'
 *   }
 *
 *   if (discord.hasError()) {
 *     return discord.getError()
 *   }
 *
 *   const user = await discord.user()
 *   return user
 * })
 * ```
 */
export class DiscordDriver extends Oauth2Driver<DiscordToken, DiscordScopes> {
  /**
   * Discord token endpoint URL.
   */
  protected accessTokenUrl = 'https://discord.com/api/oauth2/token'
  /**
   * Discord authorization endpoint URL.
   */
  protected authorizeUrl = 'https://discord.com/oauth2/authorize'
  /**
   * Discord user profile endpoint URL.
   */
  protected userInfoUrl = 'https://discord.com/api/users/@me'

  /**
   * The param name for the authorization code
   */
  protected codeParamName = 'code'

  /**
   * The param name for the error
   */
  protected errorParamName = 'error'

  /**
   * Cookie name for storing the "discord_oauth_state"
   */
  protected stateCookieName = 'discord_oauth_state'

  /**
   * Parameter name to be used for sending and receiving the state
   * from Discord
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
   * @param config - Configuration for the Discord driver
   */
  constructor(
    ctx: HttpContext,
    public config: DiscordDriverConfig
  ) {
    super(ctx, config)

    /**
     * Extremely important to call the following method to clear the
     * state set by the redirect request
     */
    this.loadState()
  }

  /**
   * Configures the redirect request with default scopes and Discord-specific
   * parameters like prompt, guild_id, and permissions.
   *
   * @param request - The redirect request to configure
   */
  protected configureRedirectRequest(request: RedirectRequestContract<DiscordScopes>) {
    /**
     * Define user defined scopes or the default one's
     */
    request.scopes(this.config.scopes || ['identify', 'email'])

    request.param('response_type', 'code')
    request.param('grant_type', 'authorization_code')
    request.param('integration_type', 1)

    /**
     * Define params based upon user config
     */
    if (this.config.prompt) {
      request.param('prompt', this.config.prompt)
    }
    if (this.config.guildId) {
      request.param('guild_id', this.config.guildId)
    }
    if (this.config.disableGuildSelect !== undefined) {
      request.param('disable_guild_select', this.config.disableGuildSelect)
    }
    if (this.config.permissions !== undefined) {
      request.param('permissions', this.config.permissions)
    }
  }

  /**
   * Configures the access token request with Discord-specific requirements.
   *
   * @param request - The API request to configure
   */
  protected configureAccessTokenRequest(request: ApiRequestContract) {
    /**
     * Send state to Discord when request is not stateles
     */
    if (!this.isStateless) {
      request.field('state', this.stateCookieValue)
    }
  }

  /**
   * Creates an authenticated HTTP request with the proper authorization
   * header for Discord API calls.
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
   * Fetches the authenticated user's profile information from the Discord API.
   *
   * @param token - The access token
   * @param callback - Optional callback to customize the API request
   *
   * @see https://discord.com/developers/docs/resources/user#get-current-user
   */
  protected async getUserInfo(token: string, callback?: (request: ApiRequestContract) => void) {
    const request = this.getAuthenticatedRequest(this.config.userInfoUrl || this.userInfoUrl, token)
    if (typeof callback === 'function') {
      callback(request)
    }

    const body = await request.get()
    return {
      id: body.id,
      name: `${body.username}#${body.discriminator}`,
      nickName: body.username,
      avatarUrl: body.avatar
        ? `https://cdn.discordapp.com/avatars/${body.id}/${body.avatar}.${
            body.avatar.startsWith('a_') ? 'gif' : 'png'
          }`
        : `https://cdn.discordapp.com/embed/avatars/${body.discriminator % 5}.png`,
      email: body.email, // May not always be there (requires email scope)
      emailVerificationState:
        'verified' in body
          ? body.verified
            ? ('verified' as const)
            : ('unverified' as const)
          : ('unsupported' as const),
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
   * Get the authenticated user's profile information using
   * the authorization code from the callback request.
   *
   * @param callback - Optional callback to customize the API request
   *
   * @example
   * ```ts
   * const user = await ally.use('discord').user()
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
   * @param token - The Discord access token
   * @param callback - Optional callback to customize the API request
   *
   * @example
   * ```ts
   * const user = await ally.use('discord').userFromToken(accessToken)
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

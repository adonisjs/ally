import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import {
  TwitchToken,
  TwitchScopes,
  TwitchDriverConfig,
  ApiRequestContract,
  TwitchDriverContract,
  RedirectRequestContract,
} from '@ioc:Adonis/Addons/Ally'
import { Oauth2Driver } from '../../AbstractDrivers/Oauth2'

/**
 * Twitch driver to login user via Twitch
 */
export class TwitchDriver
  extends Oauth2Driver<TwitchToken, TwitchScopes>
  implements TwitchDriverContract
{
  protected accessTokenUrl = 'https://id.twitch.tv/oauth2/token'
  protected authorizeUrl = 'https://id.twitch.tv/oauth2/authorize'
  protected userInfoUrl = 'https://api.twitch.tv/helix/users'

  /**
   * The param name for the authorization code
   */
  protected codeParamName = 'code'

  /**
   * The param name for the error
   */
  protected errorParamName = 'error'

  /**
   * Cookie name for storing the "twitch_oauth_state"
   */
  protected stateCookieName = 'twitch_oauth_state'

  /**
   * Parameter name to be used for sending and receiving the state
   * from Twitch
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

  constructor(ctx: HttpContextContract, public config: TwitchDriverConfig) {
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
  protected configureRedirectRequest(request: RedirectRequestContract<TwitchScopes>) {
    /**
     * Define user defined scopes or the default one's
     */
    request.scopes(this.config.scopes || ['user:read:email'])

    request.param('response_type', 'code')
    request.param('grant_type', 'authorization_code')
  }

  /**
   * Update the implementation to tell if the error received during redirect
   * means "ACCESS DENIED".
   */
  public accessDenied() {
    return this.ctx.request.input('error') === 'user_denied'
  }

  /**
   * Returns the HTTP request with the authorization header set
   */
  private getAuthenticatedRequest(url: string, token: string) {
    const request = this.httpClient(url)
    request.header('Authorization', `Bearer ${token}`)
    request.header('Client-id', this.config.clientId)
    request.header('Accept', 'application/json')
    request.parseAs('json')
    return request
  }

  public async getUserInfo(token: string, callback?: (request: ApiRequestContract) => void) {
    const request = this.getAuthenticatedRequest(this.userInfoUrl, token)
    if (typeof callback === 'function') {
      callback(request)
    }

    const body = await request.get()
    const [{ id, login, display_name: displayName, email, profile_image_url: profileImageUrl }] =
      body.data
    return {
      id: id,
      name: login,
      nickName: displayName,
      email: email,
      avatarUrl: profileImageUrl || null,
      emailVerificationState: 'unsupported' as const,
      original: body.data[0],
    }
  }

  /**
   * Returns details for the authorized user
   */
  public async user(callback?: (request: ApiRequestContract) => void) {
    const token = await this.accessToken(callback)
    const user = await this.getUserInfo(token.token, callback)

    return {
      ...user,
      token,
    }
  }

  /**
   * Finds the user by the access token
   */
  public async userFromToken(token: string, callback?: (request: ApiRequestContract) => void) {
    const user = await this.getUserInfo(token, callback)
    return {
      ...user,
      token: {
        token,
        type: 'bearer' as const,
      },
    }
  }
}

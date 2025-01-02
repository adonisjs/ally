import { Oauth2Driver } from '@adonisjs/ally'
import type { HttpContext } from '@adonisjs/core/http'
import type {
  ApiRequestContract,
  LinkedInOpenidConnectAccessToken,
  LinkedInOpenidConnectDriverConfig,
  LinkedInOpenidConnectScopes,
  RedirectRequestContract,
} from '@adonisjs/ally/types'
import type { HttpClient } from '@poppinss/oauth-client'

/**
 * LinkedIn openid connect driver to login user via LinkedIn using openid connect requirements
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
   * Configuring the redirect request with defaults
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
   * Returns the HTTP request with the authorization header set
   */
  protected getAuthenticatedRequest(url: string, token: string): HttpClient {
    const request = this.httpClient(url)
    request.header('Authorization', `Bearer ${token}`)
    request.header('Accept', 'application/json')
    request.parseAs('json')
    return request
  }

  /**
   * Fetches the user info from the LinkedIn API
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
   * Find if the current error code is for access denied
   */
  accessDenied(): boolean {
    const error = this.getError()
    if (!error) {
      return false
    }

    return error === 'user_cancelled_login' || error === 'user_cancelled_authorize'
  }

  /**
   * Returns details for the authorized user
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
   * Finds the user by the access token
   */
  async userFromToken(token: string, callback?: (request: ApiRequestContract) => void) {
    const user = await this.getUserInfo(token, callback)

    return {
      ...user,
      token: { token, type: 'bearer' as const },
    }
  }
}

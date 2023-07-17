/*
 * @adonisjs/ally
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { HttpContext } from '@adonisjs/core/http'
import {
  TwitterToken,
  AllyUserContract,
  ApiRequestContract,
  TwitterDriverConfig,
  TwitterDriverContract,
} from '../types.js'
import { Oauth1Driver } from '../abstract_drivers/oauth1.js'

/**
 * Twitter driver to login user via twitter
 */
export class TwitterDriver
  extends Oauth1Driver<TwitterToken, string>
  implements TwitterDriverContract
{
  protected requestTokenUrl = 'https://api.twitter.com/oauth/request_token'
  protected authorizeUrl = 'https://api.twitter.com/oauth/authenticate'
  protected accessTokenUrl = 'https://api.twitter.com/oauth/access_token'
  protected userInfoUrl = 'https://api.twitter.com/1.1/account/verify_credentials.json'

  /**
   * The query string param name for the error.
   */
  protected errorParamName = 'error'

  /**
   * The query string param name for the "oauth_verifier". Used
   * for both the post redirect value access and during the
   * time of generating the access token
   */
  protected oauthTokenVerifierName = 'oauth_verifier'

  /**
   * Cookie name for storing the oauth_token. The cookie
   * name for storing oauth_token_secret is derived
   * from this property
   */
  protected oauthTokenCookieName = 'twitter_oauth_token'

  /**
   * Param name for defined the "oauth_token" pre redirect
   * and also used post redirect for reading the "oauth_token"
   * value
   */
  protected oauthTokenParamName = 'oauth_token'

  /**
   * Twitter doesn't support scopes
   */
  protected scopeParamName = ''
  protected scopesSeparator = ' '

  constructor(
    protected ctx: HttpContext,
    public config: TwitterDriverConfig
  ) {
    super(ctx, config)

    /**
     * Extremely important to call the following method to clear the
     * state set by the redirect request
     */
    this.loadState()
  }

  /**
   * Returns user info
   */
  protected async getUserInfo(
    token: string,
    secret: string,
    callback?: (request: ApiRequestContract) => void
  ) {
    const requestToken = { token, secret }
    const userInfoUrl = this.config.userInfoUrl || this.userInfoUrl

    const user = await this.makeSignedRequest(userInfoUrl, 'get', requestToken, (request) => {
      /**
       * Include email
       */
      request.param('include_email', true)

      /**
       * Parse response as JSON
       */
      request['parseAs']('json')

      /**
       * Invoke user callback
       */
      if (typeof callback === 'function') {
        callback(request)
      }
    })

    return {
      id: user.id_str,
      nickName: user.screen_name,
      name: user.name || user.screen_name,
      email: user.email,
      emailVerificationState: 'unsupported' as const,
      avatarUrl: user.profile_image_url_https.replace('_normal.jpg', '_400x400.jpg'),
      original: user,
    }
  }

  /**
   * Returns details for the authorized user
   */
  async user(callback?: (request: ApiRequestContract) => void) {
    const token = await this.accessToken()
    const userInfo = await this.getUserInfo(token.token, token.secret, callback)

    return {
      ...userInfo,
      token,
    }
  }

  /**
   * Finds the user info from the "oauth_token" and "oauth_token_secret"
   * access from the access token.
   */
  async userFromTokenAndSecret(
    token: string,
    secret: string,
    callback?: (request: ApiRequestContract) => void
  ): Promise<AllyUserContract<{ token: string; secret: string }>> {
    const userInfo = await this.getUserInfo(token, secret, callback)

    return {
      ...userInfo,
      token: { token, secret },
    }
  }

  /**
   * Find if the current error code is for access denied
   */
  accessDenied(): boolean {
    return this.ctx.request.input('denied')
  }
}

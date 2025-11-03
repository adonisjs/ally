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
  type TwitterToken,
  type AllyUserContract,
  type ApiRequestContract,
  type TwitterDriverConfig,
} from '../types.js'
import { Oauth1Driver } from '../abstract_drivers/oauth1.js'

/**
 * Twitter OAuth1 driver for authenticating users via Twitter.
 * Supports fetching user profile information including username, name, and email.
 * Uses OAuth 1.0a protocol.
 *
 * @example
 * ```ts
 * router.get('/twitter/redirect', ({ ally }) => {
 *   return ally.use('twitter').redirect()
 * })
 *
 * router.get('/twitter/callback', async ({ ally }) => {
 *   const twitter = ally.use('twitter')
 *
 *   if (twitter.accessDenied()) {
 *     return 'Access was denied'
 *   }
 *
 *   if (twitter.stateMisMatch()) {
 *     return 'State mismatch error'
 *   }
 *
 *   if (twitter.hasError()) {
 *     return twitter.getError()
 *   }
 *
 *   const user = await twitter.user()
 *   return user
 * })
 * ```
 */
export class TwitterDriver extends Oauth1Driver<TwitterToken, string> {
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

  /**
   * @param ctx - The HTTP context
   * @param config - Configuration for the Twitter driver
   */
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
   * Fetches the authenticated user's profile information from the Twitter API.
   *
   * @param token - The OAuth token
   * @param secret - The OAuth token secret
   * @param callback - Optional callback to customize the API request
   *
   * @see https://developer.twitter.com/en/docs/twitter-api/v1/accounts-and-users/manage-account-settings/api-reference/get-account-verify_credentials
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
   * Get the authenticated user's profile information using
   * the OAuth verifier from the callback request.
   *
   * @param callback - Optional callback to customize the API request
   *
   * @example
   * ```ts
   * const user = await ally.use('twitter').user()
   * console.log(user.name, user.email)
   * ```
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
   * Get the user's profile information using an existing OAuth token
   * and token secret.
   *
   * @param token - The OAuth token
   * @param secret - The OAuth token secret
   * @param callback - Optional callback to customize the API request
   *
   * @example
   * ```ts
   * const user = await ally.use('twitter').userFromTokenAndSecret(token, secret)
   * ```
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
   * Check if the error from the callback indicates that the user
   * denied authorization.
   */
  accessDenied(): boolean {
    return this.ctx.request.input('denied')
  }
}

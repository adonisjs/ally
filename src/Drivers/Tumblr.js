'use strict'

/*
 * adonis-ally
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const OAuthScheme = require('../Schemes/OAuth')
const CE = require('../Exceptions')
const AllyUser = require('../AllyUser')
const utils = require('../../lib/utils')

/**
 * Tumblr driver to authenticating users via OAuth1 scheme.
 *
 * @class Tumblr
 * @constructor
 */
class Tumblr extends OAuthScheme {
  constructor (Config) {
    const config = Config.get('services.ally.tumblr')

    utils.validateDriverConfig('tumblr', config)
    utils.debug('tumblr', config)

    super(config.clientId, config.clientSecret, config.redirectUri)
  }

  /**
   * Injections to be made by the IoC container
   *
   * @attribute inject
   *
   * @return {Array}
   */
  static get inject () {
    return ['Adonis/Src/Config']
  }

  /**
   * Url to be used for fetching user profile.
   *
   * @attribute profileUrl
   *
   * @return {String}
   */
  get profileUrl () {
    return 'https://api.tumblr.com/v2/user/info'
  }

  /**
   * Url to be used for generating the request token
   *
   * @attribute requestTokenUrl
   *
   * @return {String} [description]
   */
  get requestTokenUrl () {
    return 'https://www.tumblr.com/oauth/request_token'
  }

  /**
   * Url to be used for redirecting
   * user.
   *
   * @attribute authorizeUrl
   *
   * @return {String} [description]
   */
  get authorizeUrl () {
    return 'https://www.tumblr.com/oauth/authorize'
  }

  /**
   * Url to be used for exchanging
   * access token.
   *
   * @attribute accessTokenUrl
   *
   * @return {String}
   */
  get accessTokenUrl () {
    return 'https://www.tumblr.com/oauth/access_token'
  }

  /**
   * Returns the redirect url for a given provider
   *
   * @method getRedirectUrl
   * @async
   *
   * @return {String}
   */
  async getRedirectUrl () {
    return this.getUrl()
  }

  /**
   * Parses the redirect errors returned by github
   * and returns the error message.
   *
   * @method parseRedirectError
   *
   * @return {String}
   */
  parseRedirectError () {
    return 'Oauth failed during redirect'
  }

  /**
   * Returns the user profile with it's access token, refresh token
   * and token expiry.
   *
   * @method getUser
   *
   * @param {Object} queryParams
   *
   * @return {Object}
   */
  async getUser (queryParams) {
    const oauthToken = queryParams.oauth_token
    const oauthVerifier = queryParams.oauth_verifier

    /**
     * Throw an exception when query string does not have
     * oauth_token or oauth_verifier
     */
    if (!oauthToken || !oauthVerifier) {
      const errorMessage = this.parseRedirectError(queryParams)
      throw CE.OAuthException.tokenExchangeException(errorMessage, null, errorMessage)
    }

    const accessTokenResponse = await this.getAccessToken(queryParams.oauth_token, queryParams.oauth_verifier)
    const userProfile = await this.getUserProfile(accessTokenResponse.accessToken, accessTokenResponse.tokenSecret)

    const user = new AllyUser()

    user
      .setOriginal(userProfile)
      .setFields(
        userProfile.id,
        userProfile.name,
        userProfile.email,
        userProfile.screen_name,
        userProfile.profile_image_url.replace('_normal.jpg', '.jpg')
      )
      .setToken(accessTokenResponse.accessToken, null, accessTokenResponse.tokenSecret, null)

    return user
  }
}

module.exports = Tumblr

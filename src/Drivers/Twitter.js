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

class Twitter extends OAuthScheme {

  constructor (Config) {
    const config = Config.get('auth.social.twitter')
    super(config.clientId, config.clientSecret, config.redirectUri)
  }

  /**
   * Injections to be made by the IoC container
   *
   * @return {Array}
   */
  static get inject () {
    return ['Adonis/Src/Config']
  }

  /**
   * Url to be used for fetching user profile
   *
   * @return {String}
   */
  get profileUrl () {
    return 'https://api.twitter.com/1.1/account/verify_credentials.json?include_email=true'
  }

  /**
   * Url to be used for generating the request token
   *
   * @return {String} [description]
   */
  get requestTokenUrl () {
    return 'https://api.twitter.com/oauth/request_token'
  }

  /**
   * Url to be used for redirecting
   * user.
   *
   * @return {String} [description]
   */
  get authorizeUrl () {
    return 'https://api.twitter.com/oauth/authenticate'
  }

  /**
   * Url to be used for exchanging
   * access token.
   *
   * @return {String}
   */
  get accessTokenUrl () {
    return 'https://api.twitter.com/oauth/access_token'
  }

  /**
   * Returns the redirect url for a given provider
   *
   * @return {String}
   */
  * getRedirectUrl () {
    return yield this.getUrl()
  }

  /**
   * Parses the redirect errors returned by github
   * and returns the error message.
   *
   * @return {String}
   */
  parseRedirectError () {
    return 'Oauth failed during redirect'
  }

  /**
   * Returns the user profile with it's access token, refresh token
   * and token expiry
   *
   * @param {Object} queryParams
   *
   * @return {Object}
   */
  * getUser (queryParams) {
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

    const accessTokenResponse = yield this.getAccessToken(queryParams.oauth_token, queryParams.oauth_verifier)
    const userProfile = yield this.getUserProfile(accessTokenResponse.accessToken, accessTokenResponse.tokenSecret)

    const user = new AllyUser()
    user
      .setOriginal(userProfile)
      .setFields(
        userProfile.id,
        userProfile.screen_name,
        userProfile.email,
        userProfile.name,
        userProfile.profile_image_url.replace('_normal.jpg', '.jpg')
      )
      .setToken(accessTokenResponse.accessToken, null, accessTokenResponse.tokenSecret, null)

    return user
  }
}

module.exports = Twitter

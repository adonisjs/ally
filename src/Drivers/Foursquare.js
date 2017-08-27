'use strict'

/*
 * adonis-ally
 *
 * (c) Ayeni Olusegun <nsegun5@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

const CE = require('../Exceptions')
const OAuth2Scheme = require('../Schemes/OAuth2')
const AllyUser = require('../AllyUser')
const got = require('got')
const utils = require('../../lib/utils')
const _ = utils.mixLodash(require('lodash'))

class Foursquare extends OAuth2Scheme {

  constructor (Config) {
    const config = Config.get('services.ally.foursquare')

    if (!_.hasAll(config, ['clientId', 'clientSecret', 'redirectUri'])) {
      throw CE.OAuthException.missingConfig('foursquare')
    }

    super(config.clientId, config.clientSecret, config.headers)

    /**
     * Oauth specific values to be used when creating the redirect
     * url or fetching user profile.
     */
    this._redirectUri = config.redirectUri
    this._redirectUriOptions = _.merge({response_type: 'code'}, config.options)
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
   * Base url to be used for constructing
   * facebook oauth urls.
   *
   * @return {String}
   */
  get baseUrl () {
    return 'https://foursquare.com/'
  }

  /**
   * Relative url to be used for redirecting
   * user.
   *
   * @return {String} [description]
   */
  get authorizeUrl () {
    return 'oauth2/authenticate'
  }

  /**
   * Relative url to be used for exchanging
   * access token.
   *
   * @return {String}
   */
  get accessTokenUrl () {
    return 'oauth2/access_token'
  }

  /**
   * Pads the date with a leading zero when date
   * is less than 10
   *
   * @param  {Number} currentDate
   * @return {String}
   */
  _padDate (currentDate) {
    return currentDate < 10 ? `0${currentDate}` : currentDate
  }

  /**
   * Returns the user profile as an object using the
   * access token
   *
   * @param   {String} accessToken
   *
   * @return  {Object}
   *
   * @private
   */
  async _getUserProfile (accessToken) {
    const date = new Date()
    const formattedDate = `${date.getFullYear()}${this._padDate(date.getMonth() + 1)}${this._padDate(date.getDate())}`

    const profileUrl = `https://api.foursquare.com/v2/users/self?oauth_token=${accessToken}&m=foursquare&v=${formattedDate}`

    const response = await got(profileUrl, {
      headers: {
        'Accept': 'application/json'
      },
      json: true
    })

    return response.body
  }

  /**
   * Returns the redirect url for a given provider.
   *
   *
   * @return {String}
   */
  async getRedirectUrl () {
    return this.getUrl(this._redirectUri, null, this._redirectUriOptions)
  }

  /**
   * Parses the redirect errors returned by facebook
   * and returns the error message.
   *
   * @param  {Object} queryParams
   *
   * @return {String}
   */
  parseRedirectError (queryParams) {
    return queryParams.error || 'Oauth failed during redirect'
  }

  /**
   * Returns the user profile with it's access token, refresh token
   * and token expiry
   *
   * @param {Object} queryParams
   *
   * @return {Object}
   */
  async getUser (queryParams) {
    const code = queryParams.code

    /**
     * Throw an exception when query string does not have
     * code.
     */
    if (!code) {
      const errorMessage = this.parseRedirectError(queryParams)
      throw CE.OAuthException.tokenExchangeException(errorMessage, null, errorMessage)
    }

    const accessTokenResponse = await this.getAccessToken(code, this._redirectUri, {
      grant_type: 'authorization_code'
    })
    const userProfile = await this._getUserProfile(accessTokenResponse.accessToken)
    const avatarUrl = `${userProfile.response.user.photo.prefix}original${userProfile.response.user.photo.suffix}`

    const user = new AllyUser()

    user
      .setOriginal(userProfile)
      .setFields(
        userProfile.response.user.id,
        `${userProfile.response.user.firstName} ${userProfile.response.user.lastName}`,
        userProfile.response.user.contact.email || null,
        '',
        avatarUrl
      )
      .setToken(
        accessTokenResponse.accessToken,
        accessTokenResponse.refreshToken,
        null,
        Number(_.get(accessTokenResponse, 'result.expires'))
      )

    return user
  }
}

module.exports = Foursquare

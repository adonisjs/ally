'use strict'

/*
 * adonis-ally
 *
 * (c) Ayeni Olusegun <nsegun5@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

const got = require('got')

const CE = require('../Exceptions')
const OAuth2Scheme = require('../Schemes/OAuth2')
const AllyUser = require('../AllyUser')
const utils = require('../../lib/utils')
const _ = require('lodash')

/**
 * Foursquare driver to authenticate users using Oauth2
 * scheme.
 *
 * @class Foursquare
 * @constructor
 */
class Foursquare extends OAuth2Scheme {
  constructor (Config) {
    const config = Config.get('services.ally.foursquare')

    utils.validateDriverConfig('foursquare', config)
    utils.debug('foursquare', config)

    super(config.clientId, config.clientSecret, config.headers)

    /**
     * Oauth specific values to be used when creating the redirect
     * url or fetching user profile.
     */
    this._redirectUri = config.redirectUri
    this._version = config.version || 20140806
    this._redirectUriOptions = Object.assign({ response_type: 'code' }, config.options)
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
   * Base url to be used for constructing
   * facebook oauth urls.
   *
   * @attribute baseUrl
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
   * @attribute authorizeUrl
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
   * @attribute accessTokenUrl
   *
   * @return {String}
   */
  get accessTokenUrl () {
    return 'oauth2/access_token'
  }

  /**
   * Returns the user profile as an object using the
   * access token
   *
   * @method _getUserProfile
   *
   * @param   {String} accessToken
   *
   * @return  {Object}
   *
   * @private
   */
  async _getUserProfile (accessToken) {
    const profileUrl = `https://api.foursquare.com/v2/users/self?oauth_token=${accessToken}&m=foursquare&v=${this._version}`

    const response = await got(profileUrl, {
      headers: {
        'Accept': 'application/json'
      },
      json: true
    })

    return response.body
  }

  /**
   * Normalize the user profile response and build an Ally user.
   *
   * @param {object} userProfile
   * @param {object} accessTokenResponse
   *
   * @return {object}
   *
   * @private
   */
  _buildAllyUser (userProfile, accessTokenResponse) {
    const avatarUrl = `${userProfile.response.user.photo.prefix}original${userProfile.response.user.photo.suffix}`
    const expires = _.get(accessTokenResponse, 'result.expires_in')

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
        expires ? Number(expires) : null
      )

    return user
  }

  /**
   * Returns the redirect url for a given provider.
   *
   * @method getRedirectUrl
   * @async
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
   * @method parseRedirectError
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
   * @method getUser
   * @async
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
    return this._buildAllyUser(userProfile, accessTokenResponse)
  }

  /**
   *
   * @param {string} accessToken
   */
  async getUserByToken (accessToken) {
    const userProfile = await this._getUserProfile(accessToken)
    return this._buildAllyUser(userProfile, { accessToken, refreshToken: null })
  }
}

module.exports = Foursquare

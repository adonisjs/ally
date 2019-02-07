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
 * Instagram driver to authenticating users via OAuth2Scheme.
 *
 * @class Instagram
 * @constructor
 */
class Instagram extends OAuth2Scheme {
  constructor (Config) {
    const config = Config.get('services.ally.instagram')

    utils.validateDriverConfig('instagram', config)
    utils.debug('instagram', config)

    super(config.clientId, config.clientSecret, config.headers)

    /**
     * Oauth specific values to be used when creating the redirect
     * url or fetching user profile.
     */
    this._redirectUri = config.redirectUri
    this._redirectUriOptions = _.merge({ response_type: 'code' }, config.options)

    this.scope = _.size(config.scope) ? config.scope : ['basic']
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
   * Scope seperator for seperating multiple
   * scopes.
   *
   * @attribute scopeSeperator
   *
   * @return {String}
   */
  get scopeSeperator () {
    return ' '
  }

  /**
   * Returns a boolean telling if driver supports
   * state
   *
   * @method supportStates
   *
   * @return {Boolean}
   */
  get supportStates () {
    return true
  }

  /**
   * Base url to be used for constructing
   * Instagram oauth urls.
   *
   * @attribute baseUrl
   *
   * @return {String}
   */
  get baseUrl () {
    return 'https://api.instagram.com/'
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
    return 'oauth/authorize'
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
    return 'oauth/access_token'
  }

  /**
   * Returns the user profile as an object using the
   * access token.
   *
   * @method _getUserProfile
   * @async
   *
   * @param   {String} accessToken
   *
   * @return  {Object}
   *
   * @private
   */
  async _getUserProfile (accessToken) {
    const profileUrl = `${this.baseUrl}v1/users/self?access_token=${accessToken}`

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
    const user = new AllyUser()
    user.setOriginal(userProfile)
      .setFields(
        userProfile.data.id,
        userProfile.data.full_name,
        null,
        userProfile.data.username,
        userProfile.data.profile_picture
      )
      .setToken(
        accessTokenResponse.accessToken,
        accessTokenResponse.refreshToken,
        null,
        null
      )

    return user
  }

  /**
   * Returns the redirect url for a given provider.
   *
   * @method getRedirectUrl
   *
   * @param {String} [state]
   *
   * @return {String}
   */
  async getRedirectUrl (state) {
    const options = state ? Object.assign(this._redirectUriOptions, { state }) : this._redirectUriOptions
    return this.getUrl(this._redirectUri, this.scope, options)
  }

  /**
   * Parses the redirect errors returned by Instagram
   * and returns the error message.
   *
   * @method parseRedirectError
   *
   * @param  {Object} queryParams
   *
   * @return {String}
   */
  parseRedirectError (queryParams) {
    return queryParams.error_description || queryParams.error || 'Oauth failed during redirect'
  }

  /**
   * Returns the user profile with it's access token, refresh token
   * and token expiry.
   *
   * @method getUser
   *
   * @param {Object} queryParams
   * @param {String} [originalState]
   *
   * @return {Object}
   */
  async getUser (queryParams, originalState) {
    const code = queryParams.code
    const state = queryParams.state

    /**
     * Throw an exception when query string does not have
     * code.
     */
    if (!code) {
      const errorMessage = this.parseRedirectError(queryParams)
      throw CE.OAuthException.tokenExchangeException(errorMessage, null, errorMessage)
    }

    /**
     * Valid state with original state
     */
    if (state && originalState !== state) {
      throw CE.OAuthException.invalidState()
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

module.exports = Instagram

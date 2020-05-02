'use strict'

/*
 * adonis-ally
 *
 * (c) Harminder Virk <virk@adonisjs.com>
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
 * LinkedIn driver to authenticating users via OAuth2Scheme.
 *
 * @class LinkedIn
 * @constructor
 */
class LinkedIn extends OAuth2Scheme {
  constructor(Config) {
    const config = Config.get('services.ally.linkedin')

    utils.validateDriverConfig('linkedin', config)
    utils.debug('linkedin', config)

    super(config.clientId, config.clientSecret, config.headers)

    this._redirectUri = config.redirectUri
    this._redirectUriOptions = _.merge({ response_type: 'code' }, config.options)

    this.scope = _.size(config.scope) ? config.scope : ['r_basicprofile', 'r_emailaddress']
    this.fields = _.size(config.fields) ? config.fields : [
      'id',
      'first-name',
      'last-name',
      'formatted-name',
      'email-address',
      'location',
      'industry',
      'public-profile-url',
      'picture-url',
      'picture-urls::(original)'
    ]
  }

  /**
   * Injections to be made by the IoC container.
   *
   * @attribute inject
   *
   * @return {Array}
   */
  static get inject() {
    return ['Adonis/Src/Config']
  }

  /**
   * Returns a boolean telling if driver supports
   * state
   *
   * @method supportStates
   *
   * @return {Boolean}
   */
  get supportStates() {
    return true
  }

  /**
   * Scope seperator for seperating multiple
   * scopes.
   *
   * @attribute scopeSeperator
   *
   * @return {String}
   */
  get scopeSeperator() {
    return ' '
  }

  /**
   * Base url to be used for constructing
   * linkedin oauth urls.
   *
   * @attribute baseUrl
   *
   * @return {String}
   */
  get baseUrl() {
    return 'https://www.linkedin.com/oauth/v2'
  }

  /**
   * Relative url to be used for redirecting
   * user.
   *
   * @attribute authorizeUrl
   *
   * @return {String}
   */
  get authorizeUrl() {
    return 'authorization'
  }

  /**
   * Relative url to be used for exchanging
   * access token.
   *
   * @attribute accessTokenUrl
   *
   * @return {String}
   */
  get accessTokenUrl() {
    return 'accessToken'
  }

  /**
   * Returns the user profile as an object using the
   * access token.
   *
   * @attribute _getUserProfile
   *
   * @param   {String} accessToken
   *
   * @return  {Object}
   *
   * @private
   */
  async _getUserProfile(accessToken) {
    const profileUrl = `https://api.linkedin.com/v1/people/~:(${this.fields.join(',')})`

    const response = await got(profileUrl, {
      headers: {
        'x-li-format': 'json',
        'Authorization': `Bearer ${accessToken}`
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
  _buildAllyUser(userProfile, accessTokenResponse) {
    const user = new AllyUser()
    const expires = _.get(accessTokenResponse, 'result.expires_in')

    user.setOriginal(userProfile)
      .setFields(
        userProfile.id,
        userProfile.formattedName,
        userProfile.emailAddress,
        userProfile.formattedName,
        userProfile.pictureUrl
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
   *
   * @param {String} [state]
   *
   * @return {String}
   */
  async getRedirectUrl(state) {
    const options = state ? Object.assign(this._redirectUriOptions, { state }) : this._redirectUriOptions
    return this.getUrl(this._redirectUri, this.scope, options)
  }

  /**
   * Parses the redirect errors returned by linkedin
   * and returns the error message.
   *
   * @method parseRedirectError
   *
   * @param  {Object} queryParams
   *
   * @return {String}
   */
  parseRedirectError(queryParams) {
    return queryParams.error_description || 'Oauth failed during redirect'
  }

  /**
   * Returns the user profile with it's access token, refresh token
   * and token expiry.
   *
   * @method getUser
   * @async
   *
   * @param {Object} queryParams
   * @param {String} [originalState]
   *
   * @return {Object}
   */
  async getUser(queryParams, originalState) {
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
    if (state && originalState && originalState !== state) {
      throw CE.OAuthException.invalidState()
    }

    const accessTokenResponse = await this.getAccessToken(code, this._redirectUri, {
      grant_type: 'authorization_code'
    })

    const userProfile = await this._getUserProfile(accessTokenResponse.accessToken)
    return this._buildAllyUser(userProfile, accessTokenResponse)
  }

  /**
   * Get user by access token
   *
   * @method getUserByToken
   *
   * @param  {String}       accessToken
   *
   * @return {void}
   */
  async getUserByToken(accessToken) {
    const userProfile = await this._getUserProfile(accessToken)

    return this._buildAllyUser(userProfile, { accessToken, refreshToken: null })
  }
}

module.exports = LinkedIn

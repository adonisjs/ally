'use strict'

/*
 * adonis-ally
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 * (+) EunKwang Shin <eks012@gmail.com>
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
 * Naver driver to authenticate a user using
 * OAuth2 scheme.
 *
 * @class Naver
 * @constructor
 */
class Naver extends OAuth2Scheme {
  constructor (Config) {
    const config = Config.get('services.ally.naver')

    utils.validateDriverConfig('naver', config)
    utils.debug('naver', config)

    super(config.clientId, config.clientSecret, config.headers)

    /**
     * Oauth specific values to be used when creating the redirect
     * url or fetching user profile.
     */
    this._scope = this._getInitialScopes(config.scope)
    this._fields = this._getInitialFields(config.fields)
    this._redirectUri = config.redirectUri
    this._redirectUriOptions = Object.assign({response_type: 'code'}, config.options)
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
    return ','
  }

  /**
   * Base url to be used for constructing
   * naver oauth urls.
   *
   * @attribute baseUrl
   *
   * @return {String}
   */
  get baseUrl () {
    return 'https://nid.naver.com/oauth2.0'
  }

  /**
   * Api url to be used for User information
   * naver api urls.
   *
   * @attribute apiUrl
   *
   * @return {String}
   */
  get apiUrl () {
    return 'https://openapi.naver.com/v1/nid'
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
    return 'authorize'
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
    return 'token'
  }

  /**
   * Returns initial scopes to be used right from the
   * config file. Otherwise it will fallback to the
   * commonly used scopes.
   *
   * @method _getInitialScopes
   *
   * @param   {Array} scopes
   *
   * @return  {Array}
   *
   * @private
   */
  _getInitialScopes (scopes) {
    return _.size(scopes) ? scopes : []
  }

  /**
   * Returns the initial fields to be used right from the
   * config file. Otherwise it will fallback to the
   * commonly used fields.
   *
   * @method _getInitialFields
   *
   * @param   {Array} fields
   *
   * @return  {Array}
   *
   * @private
   */
  _getInitialFields (fields) {
    return _.size(fields) ? fields : []
  }

  /**
   * Returns the user profile as an object using the
   * access token.
   *
   * @method _getInitialFields
   *
   * @param   {String} accessToken
   * @param   {Array?} [fields]
   *
   * @return  {Object}
   *
   * @private
   */
  async _getUserProfile (accessToken, fields) {
    fields = _.size(fields) ? fields : this._fields
    const profileUrl = `${this.apiUrl}/me`

    const response = await got(profileUrl, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      json: true
    })

    return response.body
  }

  /**
   * Returns the redirect url for a given provider.
   *
   * @method getRedirectUrl
   *
   * @param  {Array} scope
   *
   * @return {String}
   */
  async getRedirectUrl (scope) {
    scope = _.size(scope) ? scope : this._scope
    return this.getUrl(this._redirectUri, scope, this._redirectUriOptions)
  }

  /**
   * Parses provider error by fetching error message
   * from nested data property.
   *
   * @method parseProviderError
   *
   * @param  {Object} error
   *
   * @return {Error}
   */
  parseProviderError (error) {
    const parsedError = _.isString(error.data) ? JSON.parse(error.data) : null
    const message = _.get(parsedError, 'error.message', error)
    return CE.OAuthException.tokenExchangeException(message, error.statusCode, parsedError)
  }

  /**
   * Parses the redirect errors returned by naver
   * and returns the error message.
   *
   * @method parseRedirectError
   *
   * @param  {Object} queryParams
   *
   * @return {String}
   */
  parseRedirectError (queryParams) {
    return queryParams.error_description || 'Oauth failed during redirect'
  }

  /**
   * Returns the user profile with it's access token, refresh token
   * and token expiry.
   *
   * @method getUser
   *
   * @param {Object} queryParams
   * @param {Array} [fields]
   *
   * @return {Object}
   */
  async getUser (queryParams, fields) {
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

    const userProfile = await this._getUserProfile(accessTokenResponse.accessToken, fields)
    const user = new AllyUser()

    /**
     * Build user
     */
    user
      .setOriginal(userProfile)
      .setFields(
        userProfile.response.id,
        userProfile.response.name,
        userProfile.response.email,
        userProfile.response.name,
        userProfile.response.profile_image
      )
      .setToken(
        accessTokenResponse.accessToken,
        accessTokenResponse.refreshToken,
        null,
        Number(_.get(accessTokenResponse, 'result.expires_in'))
      )

    return user
  }
}

module.exports = Naver

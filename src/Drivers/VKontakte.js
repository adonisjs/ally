'use strict'

/*
 * adonis-ally vkontakte driver
 *
 * (c) Oleg Kovalev <oleg.kovalev@webartisan.ru>
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

class VKontakte extends OAuth2Scheme {

  constructor(Config) {
    const config = Config.get('services.ally.vkontakte')

    if (!_.hasAll(config, ['clientId', 'clientSecret', 'redirectUri'])) {
      throw CE.OAuthException.missingConfig('vkontakte')
    }

    super(config.clientId, config.clientSecret, config.headers)

    /**
     * Oauth specific values to be used when creating the redirect
     * url or fetching user profile.
     */
    this._scope = this._getInitialScopes(config.scope)
    this._fields = this._getInitialFields(config.fields)
    this._api_version = this._getInitialFields(config.api_version) || '5.65'
    this._redirectUri = config.redirectUri
    this._redirectUriOptions = _.merge({
      response_type: 'code'
    }, config.options)
  }

  /**
   * Injections to be made by the IoC container
   *
   * @return {Array}
   */
  static get inject() {
    return ['Adonis/Src/Config']
  }

  /**
   * Scope seperator for seperating multiple
   * scopes.
   *
   * @return {String}
   */
  get scopeSeperator() {
    return ','
  }

  /**
   * Base url to be used for constructing
   * facebook oauth urls.
   *
   * @return {String}
   */
  get baseUrl() {
    return 'https://oauth.vk.com'
  }

  /**
   * Relative url to be used for redirecting
   * user.
   *
   * @return {String} [description]
   */
  get authorizeUrl() {
    return 'authorize'
  }

  /**
   * Relative url to be used for exchanging
   * access token.
   *
   * @return {String}
   */
  get accessTokenUrl() {
    return 'access_token'
  }

  /**
   * API url to be used for getting VKontakte user's profile
   *
   * @return {String}
   */
  get apiUrl() {
    return 'https://api.vk.com/method'
  }

  /**
   * Returns initial scopes to be used right from the
   * config file. Otherwise it will fallback to the
   * commonly used scopes
   *
   * @param   {Array} scopes
   *
   * @return  {Array}
   *
   * @private
   */
  _getInitialScopes(scopes) {
    return _.size(scopes) ? scopes : ['email']
  }

  /**
   * Returns the initial fields to be used right from the
   * config file. Otherwise it will fallback to the
   * commonly used fields.
   *
   * @param   {Array} fields
   *
   * @return  {Array}
   *
   * @private
   */
  _getInitialFields(fields) {
    return _.size(fields) ? fields : ['uid', 'first_name', 'screen_name', 'last_name', 'has_photo', 'photo', 'city']
  }

  /**
   * Returns the user profile as an object using the
   * access token
   *
   * @param   {String} accessToken
   * @param   {Array} [fields]
   *
   * @return  {Object}
   *
   * @private
   */
  * _getUserProfile(accessToken, fields) {
    fields = _.size(fields) ? fields : this._fields
    const profileUrl = `${this.apiUrl}/users.get?access_token=${accessToken}&fields=${fields.join(',')}&https=1&v=${this._api_version}`
    const response = yield got(profileUrl, {
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
   * @param  {Array} scope
   *
   * @return {String}
   */
  * getRedirectUrl(scope) {
    scope = _.size(scope) ? scope : this._scope
    return this.getUrl(this._redirectUri, scope, this._redirectUriOptions)
  }

  /**
   * Parses provider error by fetching error message
   * from nested data property.
   *
   * @param  {Object} error
   *
   * @return {Error}
   */
  parseProviderError(error) {
    const parsedError = _.isString(error.data) ? JSON.parse(error.data) : null
    const message = _.get(parsedError, 'error.message', error)
    return CE.OAuthException.tokenExchangeException(message, error.statusCode, parsedError)
  }

  /**
   * Parses the redirect errors returned by facebook
   * and returns the error message.
   *
   * @param  {Object} queryParams
   *
   * @return {String}
   */
  parseRedirectError(queryParams) {
    return queryParams.error_message || 'Oauth failed during redirect'
  }

  /**
   * Returns the user profile with it's access token, refresh token
   * and token expiry
   *
   * @param {Object} queryParams
   * @param {Array} [fields]
   *
   * @return {Object}
   */
  * getUser(queryParams, fields) {
    const code = queryParams.code

    /**
     * Throw an exception when query string does not have
     * code.
     */
    if (!code) {
      const errorMessage = this.parseRedirectError(queryParams)
      throw CE.OAuthException.tokenExchangeException(errorMessage, null, errorMessage)
    }

    const accessTokenResponse = yield this.getAccessToken(code, this._redirectUri, {
      grant_type: 'authorization_code'
    })
    const userProfile = yield this._getUserProfile(accessTokenResponse.accessToken, fields)
    const user = new AllyUser()
    const avatarUrl = userProfile.response[0].photo
    user
      .setOriginal(userProfile)
      .setFields(
        userProfile.response[0].id,
        `${userProfile.response[0].first_name} ${userProfile.response[0].last_name}`,
        accessTokenResponse.result.email,
        userProfile.response[0].screen_name,
        avatarUrl
      )
      .setToken(
        accessTokenResponse.accessToken,
        accessTokenResponse.refreshToken,
        null,
        Number(accessTokenResponse.result.expires_in)
      )

    return user
  }
}

module.exports = VKontakte

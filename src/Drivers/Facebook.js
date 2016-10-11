'use strict'

/*
 * adonis-ally
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const CE = require('../Exceptions')
const OAuth2Scheme = require('../Schemes/OAuth2')
const AllyUser = require('../AllyUser')
const got = require('got')
const _ = require('lodash')

class Facebook extends OAuth2Scheme {

  constructor (Config) {
    const config = Config.get('auth.social.facebook')
    super(config.clientId, config.clientSecret, config.headers)

    /**
     * Oauth specific values to be used when creating the redirect
     * url or fetching user profile.
     */
    this._scope = this._getInitialScopes(config.scope)
    this._fields = this._getInitialFields(config.fields)
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
   * Scope seperator for seperating multiple
   * scopes.
   *
   * @return {String}
   */
  get scopeSeperator () {
    return ','
  }

  /**
   * Base url to be used for constructing
   * facebook oauth urls.
   *
   * @return {String}
   */
  get baseUrl () {
    return 'https://graph.facebook.com/v2.1'
  }

  /**
   * Relative url to be used for redirecting
   * user.
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
   * @return {String}
   */
  get accessTokenUrl () {
    return 'oauth/access_token'
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
  _getInitialScopes (scopes) {
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
  _getInitialFields (fields) {
    return _.size(fields) ? fields : ['name', 'email', 'gender', 'verified', 'link']
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
  * _getUserProfile (accessToken, fields) {
    fields = _.size(fields) ? fields : this._fields
    const profileUrl = `${this.baseUrl}/me?access_token=${accessToken}&fields=${fields.join(',')}`
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
  getRedirectUrl (scope) {
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
  parseProviderError (error) {
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
  parseRedirectError (queryParams) {
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
  * getUser (queryParams, fields) {
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
    const avatarUrl = `${this.baseUrl}/${userProfile.id}/picture?type=normal`
    user
      .setOriginal(userProfile)
      .setFields(
        userProfile.id,
        userProfile.name,
        userProfile.email,
        userProfile.name,
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

module.exports = Facebook

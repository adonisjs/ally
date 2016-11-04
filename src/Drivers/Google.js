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

class Google extends OAuth2Scheme {

  constructor (Config) {
    const config = Config.get('services.ally.google')
    super(config.clientId, config.clientSecret, config.headers)

    /**
     * Oauth specific values to be used when creating the redirect
     * url or fetching user profile.
     */
    this._scope = this._getInitialScopes(config.scope)
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
    return ' '
  }

  /**
   * Base url to be used for constructing
   * google oauth urls.
   *
   * @return {String}
   */
  get baseUrl () {
    return 'https://accounts.google.com/o/oauth2'
  }

  /**
   * Relative url to be used for redirecting
   * user.
   *
   * @return {String} [description]
   */
  get authorizeUrl () {
    return 'auth'
  }

  /**
   * Relative url to be used for exchanging
   * access token.
   *
   * @return {String}
   */
  get accessTokenUrl () {
    return 'token'
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
    return _.size(scopes) ? scopes : ['openid', 'profile', 'email']
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
  * _getUserProfile (accessToken) {
    const profileUrl = 'https://www.googleapis.com/plus/v1/people/me'
    const response = yield got(profileUrl, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      json: true
    })
    return response.body
  }

  /**
   * Returns the redirect url for a given provider
   *
   * @param  {Array} scope
   *
   * @return {String}
   */
  * getRedirectUrl (scope) {
    scope = _.size(scope) ? scope : this._scope
    return this.getUrl(this._redirectUri, scope, this._redirectUriOptions)
  }

  /**
   * Parses the redirect errors returned by google
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
  * getUser (queryParams) {
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
    const userProfile = yield this._getUserProfile(accessTokenResponse.accessToken)
    const user = new AllyUser()
    user
      .setOriginal(userProfile)
      .setFields(
        userProfile.id,
        userProfile.displayName,
        _.get(userProfile, 'emails.0.value'),
        userProfile.displayName,
        _.get(userProfile, 'image.url')
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

module.exports = Google

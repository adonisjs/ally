'use strict'

/*
 * adonis-ally
 *
 * (c) Maxime Cattet <maximecattet@gmail.com>
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

class Spotify extends OAuth2Scheme {

  constructor (Config) {
    const config = Config.get('services.ally.spotify')

    if (!_.hasAll(config, ['clientId', 'clientSecret', 'redirectUri'])) {
      throw CE.OAuthException.missingConfig('spotify')
    }

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
   * spotify oauth urls.
   *
   * @return {String}
   */
  get baseUrl () {
    return 'https://accounts.spotify.com'
  }

  /**
   * Relative url to be used for redirecting
   * user.
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
   * @return {String}
   */
  get accessTokenUrl () {
    return 'api/token'
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
    return _.size(scopes) ? scopes : ['user-read-private', 'user-read-email']
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
    const profileUrl = 'https://api.spotify.com/v1/me'
    const response = yield got(profileUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
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
  * getRedirectUrl (scope) {
    scope = _.size(scope) ? scope : this._scope
    return this.getUrl(this._redirectUri, scope, this._redirectUriOptions)
  }

  /**
   * Parses the redirect errors returned by spotify
   * and returns the error message.
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
   * and token expiry
   *
   * @param {Object} queryParams
   * @param {Array} [fields]
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
        userProfile.display_name,
        userProfile.email,
        userProfile.id,
        _.get(userProfile, 'images.0.url')
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

module.exports = Spotify

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
 * Medium driver to authenticating users via OAuth2Scheme.
 *
 * @class Medium
 * @constructor
 */
class Medium extends OAuth2Scheme {
  constructor (Config) {
    const config = Config.get('services.ally.medium')

    utils.validateDriverConfig('medium', config)
    utils.debug('medium', config)

    super(config.clientId, config.clientSecret, config.headers)

    /**
     * Oauth specific values to be used when creating the redirect
     * url or fetching user profile.
     */
    this._scope = this._getInitialScopes(config.scope)
    this._redirectUri = config.redirectUri
    this._redirectUriOptions = _.merge({
      response_type: 'code',
      state: 1
    }, config.options)
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
   * Base url to be used for constructing
   * google oauth urls.
   *
   * @attribute baseUrl
   *
   * @return {String}
   */
  get baseUrl () {
    return 'https://medium.com/m'
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
    return 'https://api.medium.com/v1/tokens'
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
    return _.size(scopes) ? scopes : ['basicProfile']
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
    const profileUrl = 'https://api.medium.com/v1/me'

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
   * @async
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
   * Parses the redirect errors returned by google
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
   * and token expiry.
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

    this.client._baseSite = ''

    const accessTokenResponse = await this.getAccessToken(code, this._redirectUri, {
      grant_type: 'authorization_code'
    })

    this.client._baseSite = this.baseUrl

    const userProfile = await this._getUserProfile(accessTokenResponse.accessToken)

    const user = new AllyUser()

    const accessTokenExpiration = _.get(accessTokenResponse, 'result.expire_at', null)

    user
      .setOriginal(userProfile)
      .setFields(
        userProfile.data.id,
        userProfile.data.name,
        null,
        userProfile.data.username,
        userProfile.data.imageUrl
      )
      .setToken(
        accessTokenResponse.accessToken,
        accessTokenResponse.refreshToken,
        null,
        accessTokenExpiration && Number(accessTokenExpiration)
      )
    return user
  }
}

module.exports = Medium

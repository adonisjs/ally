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
const utils = require('../../lib/utils')
const _ = utils.mixLodash(require('lodash'))

class Github extends OAuth2Scheme {

  constructor (Config) {
    const config = Config.get('services.ally.github')

    if (!_.hasAll(config, ['clientId', 'clientSecret', 'redirectUri'])) {
      throw CE.OAuthException.missingConfig('github')
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
   * facebook oauth urls.
   *
   * @return {String}
   */
  get baseUrl () {
    return 'https://github.com/login/oauth'
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
    return 'access_token'
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
    return _.size(scopes) ? scopes : ['user']
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
    const profileUrl = 'https://api.github.com/user'
    const response = yield got(profileUrl, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `token ${accessToken}`
      },
      json: true
    })

    /**
     * Get user email address by making another HTTP request
     * only when the scopes includes user or user:email
     */
    if (_.size(_.intersection(this._scope, ['user', 'user:email']))) {
      response.body.email = yield this._getUserEmail(accessToken)
    }

    return response.body
  }

  /**
   * Returns user primary and verified email address.
   *
   * @param   {String} accessToken
   *
   * @return  {String}
   *
   * @private
   */
  * _getUserEmail (accessToken) {
    const response = yield got('https://api.github.com/user/emails', {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `token ${accessToken}`
      },
      json: true
    })
    return _.find(response.body, (email) => {
      return (email.primary && email.verified)
    }).email
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
   * Parser error mentioned inside the result property
   * of the oauth response.
   *
   * @param  {Object} response
   *
   * @throws {OAuthException} If response has error property
   */
  parseProviderResultError (response) {
    const message = response.error_description || response.error
    return CE.OAuthException.tokenExchangeException(message, null, response)
  }

  /**
   * Parses the redirect errors returned by github
   * and returns the error message.
   *
   * @param  {Object} queryParams
   *
   * @return {String}
   */
  parseRedirectError (queryParams) {
    return queryParams.error_description
    ? `${queryParams.error_description}. Learn more: ${queryParams.error_uri}`
    : 'Oauth failed during redirect'
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
        userProfile.name,
        userProfile.email,
        userProfile.login,
        userProfile.avatar_url
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

module.exports = Github

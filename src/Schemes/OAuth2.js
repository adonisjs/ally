'use strict'

/*
 * adonis-ally
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const NodeOAuth2 = require('oauth').OAuth2
const GE = require('@adonisjs/generic-exceptions')
const debug = require('debug')('adonis:ally')
const _ = require('lodash')
const CE = require('../Exceptions')

/**
 * Base OAuth2 scheme to be used for implementing
 * drivers based upon OAuth2 protocol.
 *
 * @class OAuth2
 * @constructor
 */
class OAuth2 {
  /**
   * The seperator to be used for joining the
   * scope values.
   *
   * @attribute scopeSeperator
   *
   * @return {String}
   */
  get scopeSeperator () {
    return ','
  }

  /**
   * OAuth2 base url to be used for making all
   * API/Redirect request
   *
   * @attribute baseUrl
   *
   * @return {String}
   */
  get baseUrl () {
    return ''
  }

  /**
   * Authorize url to be used for redirecting the
   * user.
   *
   * @attribute authorizeUrl
   *
   * @return {String} [description]
   */
  get authorizeUrl () {
    return ''
  }

  /**
   * AccessToken url to be used for generating
   * the access token. It is used when the
   * oauth server redirects the user back
   * to the consumer website
   *
   * @attribute accessTokenUrl
   *
   * @return {String}
   */
  get accessTokenUrl () {
    return ''
  }

  /**
   * Class constructor
   *
   * @throws {InvalidArgumentException} If clientId is not defined
   * @throws {InvalidArgumentException} If clientSecret is not defined
   */
  constructor (clientId, clientSecret, headers = null) {
    /**
     * Class must be extended and should not be
     * used directly
     */
    if (new.target === OAuth2) {
      throw CE.RuntimeException.cannotInstantiate('OAuth2')
    }

    if (!clientId) {
      throw GE.InvalidArgumentException.missingParameter('oauth2', 'clientId', '1st')
    }

    if (!clientSecret) {
      throw GE.InvalidArgumentException.missingParameter('oauth2', 'clientSecret', '2nd')
    }

    const baseUrl = `${this.baseUrl.replace(/\/$/, '')}/`
    this.client = new NodeOAuth2(clientId, clientSecret, baseUrl, this.authorizeUrl, this.accessTokenUrl, headers)
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
    const message = parsedError ? (parsedError.error_description || parsedError.error) : parsedError
    return CE.OAuthException.tokenExchangeException(message, error.statusCode, parsedError)
  }

  /**
   * Parser error mentioned inside the result property
   * of the oauth response.
   *
   * @method parseProviderResultError
   *
   * @param  {Object} response
   *
   * @return {String}
   */
  parseProviderResultError (response) {
    return response.error
  }

  /**
   * Returns a formatted url to be used for redirecting
   * users.
   *
   * @method getUrl
   *
   * @param  {String} redirectUri
   * @param  {Array}  scope
   * @param  {Object} [extras] - Extras to be sent along the redirect uri
   *
   * @return {String}
   *
   * @throws {InvalidArgumentException} If redirectUri is not defined
   */
  getUrl (redirectUri, scope, extras) {
    if (!redirectUri) {
      throw GE.InvalidArgumentException.missingParameter('getUrl', 'redirectUri', '1st')
    }
    const scopeHash = _.size(scope) ? { scope: scope.join(this.scopeSeperator) } : null
    const options = _.merge({ redirect_uri: redirectUri }, scopeHash, extras)
    debug('generating redirect uri using %j options', options)
    return this.client.getAuthorizeUrl(options)
  }

  /**
   * Returns access token for a given oauth code
   *
   * @method getAccessToken
   * @async
   *
   * @param  {String} code
   * @param  {String} redirectUri
   * @param {Object} [extras]
   *
   * @return {Object}
   *
   * @throws {Error} If Error is received from the oauth provider
   */
  getAccessToken (code, redirectUri, extras) {
    return new Promise((resolve, reject) => {
      const options = _.merge({redirect_uri: redirectUri}, extras)
      this.client.getOAuthAccessToken(code, options, (error, accessToken, refreshToken, result) => {
        debug('oauth error %j', error)
        debug('oauth response %j', result)

        /**
         * parse and return the error if there
         * is an error.
         */
        if (error) {
          return reject(this.parseProviderError(error))
        }

        /**
         * parse and return the error when result has
         * an error property
         */
        if (result.error) {
          return reject(this.parseProviderResultError(result))
        }

        resolve({accessToken, refreshToken, result})
      })
    })
  }
}

module.exports = OAuth2

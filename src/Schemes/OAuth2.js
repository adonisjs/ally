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
const CE = require('../Exceptions')
const CatLog = require('cat-log')
const logger = new CatLog('adonis:ally')
const _ = require('lodash')

class OAuth2 {

  /**
   * The seperator to be used for joining the
   * scope values.
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
   * @return {String}
   */
  get baseUrl () {
    return ''
  }

  /**
   * Authorize url to be used for redirecting the
   * user.
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
  constructor (clientId, clientSecret, headers) {
    if (new.target === OAuth2) {
      throw CE.RuntimeException.cannotInstantiate('OAuth2')
    }

    if (!clientId) {
      throw CE.InvalidArgumentException.missingParameter('Cannot initiate oauth2 instance without client id')
    }

    if (!clientSecret) {
      throw CE.InvalidArgumentException.missingParameter('Cannot initiate oauth2 instance without client secret')
    }

    const baseUrl = this.baseUrl.endsWith('/') ? `${this.baseUrl}` : `${this.baseUrl}/`
    this.client = new NodeOAuth2(clientId, clientSecret, baseUrl, this.authorizeUrl, this.accessTokenUrl, headers || null)
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
    const message = parsedError ? (parsedError.error_description || parsedError.error) : parsedError
    return CE.OAuthException.tokenExchangeException(message, error.statusCode, parsedError)
  }

  /**
   * Parser error mentioned inside the result property
   * of the oauth response.
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
   * @param  {String} redirectUri
   * @param  {Array} scope
   * @param  {Object} [extras] - Extras to be sent along the redirect uri
   *
   * @return {String}
   *
   * @throws {InvalidArgumentException} If redirectUri is not defined
   */
  getUrl (redirectUri, scope, extras) {
    if (!redirectUri) {
      throw CE.InvalidArgumentException.missingParameter('Redirect uri is required to initiate oauth2 request')
    }
    const scopeHash = _.size(scope) ? { scope: scope.join(this.scopeSeperator) } : null
    const options = _.merge({ redirect_uri: redirectUri }, scopeHash, extras)
    logger.verbose('generating redirect uri using %j options', options)
    return this.client.getAuthorizeUrl(options)
  }

  /**
   * Returns access token for a given oauth code
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
        logger.verbose('oauth error %j', error)
        logger.verbose('oauth response %j', result)

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

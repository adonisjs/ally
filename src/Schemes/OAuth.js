'use strict'

/*
 * adonis-ally
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const GE = require('@adonisjs/generic-exceptions')
const NodeOAuth = require('oauth').OAuth
const debug = require('debug')('adonis:ally')
const CE = require('../Exceptions')

/**
 * OAuth scheme to be extended to build drivers based
 * on OAuth1 protocol.
 *
 * @class OAuth
 * @constructor
 */
class OAuth {
  /**
   * Url to be used for fetching user profile.
   *
   * @attribute profileUrl
   *
   * @return {String} [description]
   */
  get profileUrl () {
    return ''
  }

  /**
   * Url to be used for generating the request access
   * token.
   *
   * @attribute requestTokenUrl
   *
   * @return {String} [description]
   */
  get requestTokenUrl () {
    return ''
  }

  /**
   * Url to be used for redirecting the user
   * with generated access token.
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
   * to the consumer website.
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
  constructor (clientId, clientSecret, callbackUrl) {
    if (new.target === OAuth) {
      throw CE.RuntimeException.cannotInstantiate('OAuth')
    }

    if (!clientId) {
      throw GE.InvalidArgumentException.missingParameter('oauth', 'clientId', '1st')
    }

    if (!clientSecret) {
      throw GE.InvalidArgumentException.missingParameter('oauth', 'clientSecret', '2nd')
    }

    if (!callbackUrl) {
      throw GE.InvalidArgumentException.missingParameter('oauth', 'callbackUrl', '3rd')
    }

    this.client = new NodeOAuth(
      this.requestTokenUrl,
      this.accessTokenUrl,
      clientId,
      clientSecret,
      '1.0',
      callbackUrl,
      'HMAC-SHA1'
    )
  }

  /**
   * Generates the request token to be used for generating
   * the redirect uri and getting the access token.
   *
   * @method _getRequestToken
   *
   * @return  {Object}
   *
   * @private
   */
  _getRequestToken () {
    return new Promise((resolve, reject) => {
      this.client.getOAuthRequestToken((error, oAuthToken, oAuthTokenSecret, result) => {
        if (error) {
          return reject(error)
        }
        resolve({ oAuthToken, oAuthTokenSecret, result })
      })
    })
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
    const message = error.data || error
    const status = error.statusCode || 500
    return CE.OAuthException.tokenExchangeException(message, status, error)
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
   * @async
   *
   * @return {String}
   */
  async getUrl () {
    const requestToken = await this._getRequestToken()
    debug('generated request token %s', requestToken.oAuthToken)

    return `${this.authorizeUrl}?oauth_token=${requestToken.oAuthToken}`
  }

  /**
   * Returns accessToken and tokenSecret using the oauth token
   * and verifier.
   *
   * @method getAccessToken
   * @async
   *
   * @param  {String} oAuthToken
   * @param  {String} oAuthVerifier
   *
   * @return {Object}
   */
  getAccessToken (oAuthToken, oAuthVerifier) {
    return new Promise((resolve, reject) => {
      this._getRequestToken()
        .then((requestToken) => {
          this.client.getOAuthAccessToken(oAuthToken, requestToken.oAuthTokenSecret, oAuthVerifier, (error, accessToken, tokenSecret, result) => {
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

            resolve({ accessToken, tokenSecret, result })
          })
        })
        .catch(reject)
    })
  }

  /**
   * Returns the user profile for an access token and
   * token secret.
   *
   * @method getUserProfile
   * @async
   *
   * @param  {String} accessToken
   * @param  {String} tokenSecret
   *
   * @return {Object}
   */
  getUserProfile (accessToken, tokenSecret) {
    return new Promise((resolve, reject) => {
      this.client.get(this.profileUrl, accessToken, tokenSecret, (error, response, result) => {
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

        resolve(JSON.parse(response))
      })
    })
  }
}

module.exports = OAuth

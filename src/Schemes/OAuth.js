'use strict'

/*
 * adonis-ally
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const NodeOAuth = require('oauth').OAuth
const CE = require('../Exceptions')
const CatLog = require('cat-log')
const logger = new CatLog('adonis:ally')

class OAuth {

  /**
   * Url to be used for fetching user profile.
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
   * @return {String} [description]
   */
  get requestTokenUrl () {
    return ''
  }

  /**
   * Url to be used for redirecting the user
   * with generated access token.
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
  constructor (clientId, clientSecret, callbackUrl) {
    if (new.target === OAuth) {
      throw CE.RuntimeException.cannotInstantiate('OAuth')
    }

    if (!clientId) {
      throw CE.InvalidArgumentException.missingParameter('Cannot initiate oauth instance without client id')
    }

    if (!clientSecret) {
      throw CE.InvalidArgumentException.missingParameter('Cannot initiate oauth instance without client secret')
    }

    if (!callbackUrl) {
      throw CE.InvalidArgumentException.missingParameter('Cannot initiate oauth instance without redirect url')
    }

    this.client = new NodeOAuth(this.requestTokenUrl, this.accessTokenUrl, clientId, clientSecret, '1.0', callbackUrl, 'HMAC-SHA1')
  }

  /**
   * Generates the request token to be used for generating
   * the redirect uri and getting the access token.
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
        resolve({oAuthToken, oAuthTokenSecret, result})
      })
    })
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
    const message = error.data || error
    const status = error.statusCode || 500
    return CE.OAuthException.tokenExchangeException(message, status, error)
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
   * @return {String}
   */
  getUrl () {
    return new Promise((resolve, reject) => {
      this._getRequestToken()
      .then((requestToken) => {
        logger.verbose('generated request token %s', requestToken.oAuthToken)
        resolve(`${this.authorizeUrl}?oauth_token=${requestToken.oAuthToken}`)
      })
      .catch(reject)
    })
  }

  /**
   * Returns accessToken and tokenSecret using the oauth token
   * and verifier.
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
   * token secret
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

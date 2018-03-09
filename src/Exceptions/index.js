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

class OAuthException extends GE.LogicalException {
  /**
   * Default error code to be used when user does not
   * specify error code for an error.
   *
   * @return {Number}
   */
  static get defaultErrorCode () {
    return 500
  }

  /**
   * Raised when is called an invalid method for the configured driver
   *
   * @param {Strins} method
   *
   * @return {Object}
   */
  static invalidMethodException (method, code, original) {
    const message = `${method} cann't be called for this driver`
    const error = new this(message, code || this.defaultErrorCode, 'E_INVALID_METHOD')
    error.original = original

    return error
  }

  /**
   * This exception is raised when there is an error
   * exchanging token for code.
   *
   * @param  {String} message
   * @param  {Number} [code=500]
   * @param  {Object} [original]
   *
   * @return {Object}
   */
  static tokenExchangeException (message, code, original) {
    const error = new this(message, code || this.defaultErrorCode, 'E_OAUTH_TOKEN_EXCHANGE')
    error.original = original
    return error
  }
}

class RuntimeException extends GE.RuntimeException {
  /**
   * Default error code to be used when user does not
   * specify error code for an error.
   *
   * @return {Number}
   */
  static get defaultErrorCode () {
    return 500
  }

  /**
   * This exception is raised when trying to instantiate an
   * abstract class.
   *
   * @param  {String} className
   * @param  {Number} [code=500]
   *
   * @return {Object}
   */
  static cannotInstantiate (className, code) {
    return new this(`${className} class cannot be instantiated directly and must be extended`, code || this.defaultErrorCode, 'E_CANNOT_INSTANTIATE')
  }
}

module.exports = { OAuthException, RuntimeException }

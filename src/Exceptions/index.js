'use strict'

/*
 * adonis-ally
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const NE = require('@adonisjs/generic-exceptions')

class OAuthException extends NE.LogicalException {
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

  /**
   * This exception is raised when the configuration for
   * the provider has not been defined.
   *
   * @param  {String} provider
   * @param  {Number} [code=500]
   *
   * @return {Object}
   */
  static missingConfig (provider, code) {
    return new this(`Make sure to define ${provider} configuration inside config/services.js file`, code || this.defaultErrorCode, 'E_MISSING_OAUTH_CONFIG')
  }
}

class RuntimeException extends NE.RuntimeException {
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

  /**
   * This exception is raised when unable to find the
   * mentioned driver
   *
   * @param  {String} driver
   * @param  {Number} [code=500]
   *
   * @return {Object}
   */
  static invalidDriver (driver, code) {
    return new this(`Cannot find ally driver ${driver}`, code || this.defaultErrorCode, 'E_INVALID_ALLY_DRIVER')
  }
}

module.exports = { OAuthException, RuntimeException }

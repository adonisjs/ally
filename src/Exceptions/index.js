'use strict'

/*
 * adonis-ally
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const NE = require('node-exceptions')

class InvalidArgumentException extends NE.InvalidArgumentException {

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
   * This exception is raised when a parameter is missing
   *
   * @param  {String} message
   * @param  {Number} [code]
   *
   * @return {Object}
   */
  static missingParameter (message, code) {
    return new this(message, code || this.defaultErrorCode, 'E_MISSING_PARAMETER')
  }

  /**
   * This exception is raised when a parameter valid is incorrect
   *
   * @param  {String} message
   * @param  {Number} [code]
   *
   * @return {Object}
   */
  static invalidParameter (message, code) {
    return new this(message, code || this.defaultErrorCode, 'E_INVALID_PARAMETER')
  }

}

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

module.exports = { InvalidArgumentException, OAuthException, RuntimeException }

'use strict'

/*
 * adonis-ally
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const AllyManager = require('./AllyManager')
const Authenticator = require('./Authenticator')

/**
 * The authenticator instance for
 * each request.
 *
 * @class Ally
 * @constructor
 */
class Ally {
  constructor (request, response) {
    this._request = request
    this._response = response
  }

  /**
   * Pull authenticator instance for a given request
   * for the defined driver.
   *
   * @method driver
   *
   * @param  {String} name
   *
   * @return {Object}
   */
  driver (name) {
    const driverInstance = AllyManager.driver(name)
    return new Authenticator(this._request, this._response, driverInstance)
  }
}

module.exports = Ally

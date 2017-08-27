'use strict'

/*
 * adonis-ally
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const { ioc } = require('@adonisjs/fold')
const Drivers = require('./Drivers')
const CE = require('./Exceptions')
const Ally = require('./Ally')
const extendedDrivers = {}

/**
 * Makes a driver instance using the driver name. It will start by making one of the
 * native drivers and will fallback to the extended drivers (if any). Otherwise
 * the given callback will be executed indicating that driver is not found.
 *
 * @param   {String}   name
 * @param   {Object}   drivers
 * @param   {Object}   extendedDrivers
 * @param   {Function} callback - Executed when unable to find the driver implementation
 *
 * @return  {Object}
 *
 * @private
 */
const _makeDriverInstance = function (name, drivers, extendedDrivers, callback) {
  const driver = drivers[name] ? ioc.make(drivers[name]) : extendedDrivers[name]
  if (!driver) {
    return callback()
  }
  return driver
}

/**
 * Ally Request Manager is instantiated on each request
 * to have access to the request and response object.
 * Which is required to get the input code or
 * redirect the user.
 */
class AllyManager {
  constructor (request, response) {
    this._request = request
    this._response = response
  }

  /**
   * Ioc container specific method to add new drivers
   * to ally.
   *
   * @param  {String} key
   * @param  {Object} value
   */
  static extend (key, value) {
    extendedDrivers[key] = value
  }

  /**
   * Returns an instance of Ally with a preloaded driver
   * instance.
   *
   * @param  {String} driver
   *
   * @return {Object}
   */
  driver (driver) {
    const driverInstance = _makeDriverInstance(driver, Drivers, extendedDrivers, () => {
      throw CE.RuntimeException.invalidDriver(driver)
    })
    return new Ally(driverInstance, this._request, this._response)
  }
}

module.exports = AllyManager

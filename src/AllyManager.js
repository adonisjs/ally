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
const { ioc } = require('@adonisjs/fold')
const Drivers = require('./Drivers')

/**
 * Ally manager class is used to manage
 * drivers and build their instances
 * on the fly.
 *
 * @class AllyManager
 * @constructor
 */
class AllyManager {
  constructor () {
    this._drivers = {}
  }

  /**
   * Add a new driver to the drivers list
   *
   * @method extend
   *
   * @param  {String} name
   * @param  {Object} implementation
   *
   * @return {void}
   */
  extend (name, implementation) {
    this._drivers[name] = implementation
  }

  /**
   * Makes and returns the driver instance
   *
   * @method driver
   *
   * @param  {String} name
   *
   * @return {Object}
   */
  driver (name) {
    if (!name) {
      throw GE.InvalidArgumentException.invalidParameter('Cannot get driver instance without a name')
    }

    const Driver = this._drivers[name.toLowerCase()] || Drivers[name.toLowerCase()]
    if (!Driver) {
      throw GE.InvalidArgumentException.invalidParameter(`${name} is not a valid ally driver`)
    }

    return ioc.make(Driver)
  }
}

module.exports = new AllyManager()

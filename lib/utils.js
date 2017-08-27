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
const _ = require('lodash')
const debug = require('debug')('adonis:ally')

const utils = exports = module.exports = {}

/**
 * Validate configuration keys for a driver
 *
 * @method validateDriverConfig
 *
 * @param  {String}             driver
 * @param  {Object}             config
 * @param  {Array}              [keys = ['clientId', 'clientSecret', 'redirectUri']]
 *
 * @return {void}
 */
utils.validateDriverConfig = function (driver, config, keys) {
  keys = keys || ['clientId', 'clientSecret', 'redirectUri']
  if (!_.every(keys, (key) => _.has(config, key))) {
    throw GE.RuntimeException.missingConfig(driver, 'config/services.js')
  }
}

/**
 * Logs the configuration for a given driver
 *
 * @method debug
 *
 * @param  {String}             driver
 * @param  {Object}             config
 *
 * @return {void}
 */
utils.debug = function (driver, config) {
  debug('instantiating %s driver %j', driver, config)
}

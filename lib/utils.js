'use strict'

/*
 * adonis-ally
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const utils = exports = module.exports = {}

/**
 * Check whether source has all the keys or not
 *
 * @param  {Object}  source
 * @param  {Array}  against
 *
 * @return {Boolean}         [description]
 */
function hasAll (source, against) {
  return this.every(against, (key) => this.has(source, key))
}

/**
 * Adds mixins to lodash
 *
 * @param  {Object} lodash
 */
utils.mixLodash = function (lodash) {
  return lodash.mixin({ hasAll })
}

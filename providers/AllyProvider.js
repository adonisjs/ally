'use strict'

/*
 * adonis-ally
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const ServiceProvider = require('adonis-fold').ServiceProvider

class AllyProvider extends ServiceProvider {

  * register () {
    this.app.bind('Adonis/Addons/Ally', function () {
      return require('../src/AllyManager')
    })

    this.app.bind('Adonis/Middleware/Ally', function () {
      const AllyMiddleware = require('../middleware/Ally')
      return new AllyMiddleware()
    })
  }

}

module.exports = AllyProvider

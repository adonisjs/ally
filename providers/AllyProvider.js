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
const AllyManager = require('../src/AllyManager')

class AllyProvider extends ServiceProvider {

  * register () {
    this.app.bind('Adonis/Addons/Ally', function () {
      return AllyManager
    })

    this.app.bind('Adonis/Middleware/Ally', function () {
      const AllyMiddleware = require('../middleware/Ally')
      return new AllyMiddleware()
    })

    this.app.manager('Adonis/Middleware/Ally', AllyManager)
  }

}

module.exports = AllyProvider

'use strict'

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

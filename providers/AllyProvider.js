'use strict'

/*
 * adonis-ally
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const { ServiceProvider } = require('@adonisjs/fold')

class AllyProvider extends ServiceProvider {
  /**
   * Register provider under `Adonis/Addons/Ally`
   * namespace
   *
   * @method _registerProvider
   *
   * @return {void}
   */
  _registerProvider () {
    this.app.bind('Adonis/Addons/Ally', () => require('../src/Ally'))
  }

  /**
   * Registers ally manager under `Adonis/Addons/Ally`
   * namespace
   *
   * @method _registerManager
   *
   * @return {void}
   */
  _registerManager () {
    this.app.manager('Adonis/Addons/Ally', require('../src/AllyManager'))
  }

  /**
   * Register the provider and the manager
   *
   * @method register
   *
   * @return {void}
   */
  register () {
    this._registerProvider()
    this._registerManager()
  }

  /**
   * Bind ally to the http context
   *
   * @method boot
   *
   * @return {void}
   */
  boot () {
    const Context = this.app.use('Adonis/Src/HttpContext')
    const Ally = this.app.use('Adonis/Addons/Ally')
    const Config = this.app.use('Adonis/Src/Config')

    Context.getter('ally', function () {
      return new Ally(Config, this.request, this.response)
    }, true)
  }
}

module.exports = AllyProvider

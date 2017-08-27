'use strict'

/*
 * adonis-ally
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

class Ally {
  * handle (request, response, next) {
    const Ally = use('Adonis/Addons/Ally')
    request.ally = new Ally(request, response)
    yield next
  }
}

module.exports = Ally

'use strict'

/*
 * adonis-ally
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

module.exports = {
  get: function () {
    return {
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      redirectUri: process.env.REDIRECT_URI
    }
  }
}

// '927888111695-8jbae7a8amlirithps0vifndn1qgnk1h.apps.googleusercontent.com'
// 'fyNAREIyDPc_dmDnLkikLRn9'
// 'http://localhost:8000/authenticated'

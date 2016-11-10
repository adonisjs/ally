'use strict'

/*
 * adonis-ally
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const CE = require('./Exceptions')
const Csrf = require('csrf')

class Ally {

  constructor (driverInstance, request, response) {
    this._csrf = new Csrf()
    this._driverInstance = driverInstance
    this._request = request
    this._response = response
    this._scope = [] // runtime scopes for a single request
    this._fields = [] // runtime fields for a single request
  }

  /**
   * Add runtime scope to be used for redirecting the user.
   *
   * @param  {Array} scope
   *
   * @return {Object}
   */
  scope (scope) {
    if (scope instanceof Array === false) {
      throw CE.InvalidArgumentException.invalidParameter('Value for scope must be an array')
    }

    this._scope = scope
    return this
  }

  /**
   * Add runtime fields to be used for fetching the user profile
   *
   * @param  {Array} fields
   *
   * @return {Object}
   */
  fields (fields) {
    if (fields instanceof Array === false) {
      throw CE.InvalidArgumentException.invalidParameter('Value for fields must be an array')
    }

    this._fields = fields
    return this
  }

  /**
   * Returns the redirect uri using the driverInstance
   *
   * @return {String}
   */
  * getRedirectUrl () {
    let url = yield this._driverInstance.getRedirectUrl(this._scope)
    const token = this._request.csrfToken()
    url += `&state=${token}`
    this._scope = []
    return url
  }

  /**
   * Redirects request to the provider website url
   */
  * redirect () {
    const url = yield this.getRedirectUrl()
    this._response.status(302).redirect(url)
  }

  /**
   * Verifies that the URI has not been tampered with
   *
   * @return {Boolean}
   */
  * verifyUri () {
    const secret = yield this._request.session.get('csrf-secret')
    const token = this._request.input('state', null)
    return this._csrf.verify(secret, token)
  }

  /**
   * Returns an instance AllyUser containing the user profile.
   * A driver is responsible for normalizing the user fields.
   *
   * @return {Object}
   */
  * getUser () {
    const UriValid = yield this.verify()
    if (!UriValid) throw CE.CsrfException.badToken()
    const user = yield this._driverInstance.getUser(this._request.get(), this._fields)
    this._fields = []
    return user
  }

}

module.exports = Ally

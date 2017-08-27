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

/**
 * The public interface to authenticate and get user
 * info using one of the available drivers.
 *
 * @class Ally
 * @constructor
 */
class Ally {
  constructor (driverInstance, request, response) {
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
      throw GE
        .InvalidArgumentException
        .invalidParameter('Value for scope must be an array', scope)
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
      throw GE
        .InvalidArgumentException
        .invalidParameter('Value for fields must be an array', fields)
    }

    this._fields = fields
    return this
  }

  /**
   * Returns the redirect uri using the driverInstance
   *
   * @method getRedirectUrl
   * @async
   *
   * @return {String}
   */
  async getRedirectUrl () {
    const url = await this._driverInstance.getRedirectUrl(this._scope)
    this._scope = []
    return url
  }

  /**
   * Redirects request to the provider website url.
   *
   * @method redirect
   * @async
   *
   * @return {void}
   */
  async redirect () {
    const url = await this.getRedirectUrl()
    this._response.status(302).redirect(url)
  }

  /**
   * Returns an instance AllyUser containing the user profile.
   * A driver is responsible for normalizing the user fields.
   *
   * @method getUser
   * @async
   *
   * @return {Object}
   */
  async getUser () {
    const user = await this._driverInstance.getUser(this._request.get(), this._fields)
    this._fields = []
    return user
  }
}

module.exports = Ally

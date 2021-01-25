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
const One = require('./Schemes/OAuth')
const uuid = require('uuid/v4')

/**
 * The public interface to authenticate and get user
 * info using one of the available drivers.
 *
 * @class Authenticator
 * @constructor
 */
class Authenticator {
  constructor (Config, driverInstance, request, response) {
    this._driverInstance = driverInstance
    this._request = request
    this._response = response
    this._isStateless = false
    this._cookieOptions = Config.merge('app.cookie', {
      path: '/',
      sameSite: false,
      httpOnly: true
    })
  }

  /**
   * Add runtime scope to be used for redirecting the user.
   *
   * @param  {Array} scope
   *
   * @return {Object}
   */
  scope (scope) {
    if (!Array.isArray(scope)) {
      throw GE
        .InvalidArgumentException
        .invalidParameter('Value for scope must be an array', scope)
    }

    this._driverInstance.scope = scope
    return this
  }

  /**
   * Make the authenticator stateless
   *
   * @method stateless
   *
   * @return {Object}
   */
  stateless () {
    this._isStateless = true
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
    if (!Array.isArray(fields)) {
      throw GE
        .InvalidArgumentException
        .invalidParameter('Value for fields must be an array', fields)
    }

    this._driverInstance.fields = fields
    return this
  }

  /**
   * Returns the redirect uri using the driverInstance
   *
   * @method getRedirectUrl
   *
   * @param {String} state
   *
   * @return {String}
   */
  async getRedirectUrl (state) {
    return this._driverInstance.getRedirectUrl(state)
  }

  /**
   * Allow to dynamically append parameters to the URI of the driver.
   * This function needs to be called every time the driver is instantiated.
   *
   * Example:
   * ally.driver("facebook").withAdditionalParams(params).redirect()
   * ally.driver("facebook").withAdditionalParams(params).getUser()
   *
   * @method withAdditionalParams
   * @param additionalParams
   * @returns {Authenticator}
   */
  withAdditionalParams(additionalParams) {
    this._driverInstance.withAdditionalParams(additionalParams);
    return this;
  }

  /**
   * Redirects request to the provider website url.
   *
   * @method redirect
   *
   * @return {void}
   */
  async redirect () {
    let state = null

    if (!this._isStateless && this._driverInstance.supportStates) {
      state = uuid()
      this._response.cookie('oauth_state', state, this._cookieOptions)
    }

    const url = await this.getRedirectUrl(state)
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
    let originalState = null

    if (!this._isStateless && this._driverInstance.supportStates) {
      originalState = this._request.cookie('oauth_state')
      this._response.clearCookie('oauth_state')
    }

    return this._driverInstance.getUser(this._request.get(), originalState)
  }

  /**
   * Returns an instance AllyUser containing the user profile obtained from the given token.
   * A driver is responsible for normalizing the user fields.
   *
   * @method getUserByToken
   * @param string accessToken
   * @async
   *
   * @return {Object}
   */
  async getUserByToken (accessToken, accessSecret) {
    const isOAuthOne = this._driverInstance instanceof One

    if (isOAuthOne && !accessSecret) {
      throw GE
        .InvalidArgumentException
        .invalidParameter('Missing accessSecret as 2nd params, required by OAuth1 protocol')
    }

    if (isOAuthOne) {
      return this._driverInstance.getUserByToken(accessToken, accessSecret)
    }

    return this._driverInstance.getUserByToken(accessToken)
  }
}

module.exports = Authenticator

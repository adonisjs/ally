'use strict'

/*
 * adonis-ally
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

/**
 * This class represents a single user entity fetch from one of
 * the social websites. The class provides a unified API to
 * pull user details, regardless of the response received
 * from different providers.
 *
 * @class AllyUser
 * @constructor
 */
class AllyUser {
  constructor () {
    /**
     * The user fields to be mapped
     *
     * @type {Object}
     */
    this._userFields = {
      id: '',
      name: '',
      email: '',
      avatar: '',
      nickname: ''
    }

    /**
     * The token fields to be mapped
     *
     * @type {Object}
     */
    this._tokenFields = {
      accessToken: '',
      refreshToken: '',
      tokenSecret: '',
      expires: null
    }

    /**
     * Reference to the original object
     * received from the provider
     *
     * @type {Object}
     */
    this._original = {}
  }

  /**
   * Set user attributes
   *
   * @method setFields
   *
   * @param  {Number|String}  id
   * @param  {String}         name
   * @param  {String}         email
   * @param  {String}         nickname
   * @param  {String}         avatar
   *
   * @chainable
   */
  setFields (id, name, email, nickname, avatar) {
    this._userFields = { id, name, email, nickname, avatar }
    return this
  }

  /**
   * Set token details returned from the provider for a
   * given user.
   *
   * @method setToken
   *
   * @param  {String} accessToken
   * @param  {String} refreshToken
   * @param  {String} tokenSecret
   * @param  {Number} expires
   *
   * @chainable
   */
  setToken (accessToken, refreshToken, tokenSecret, expires = null) {
    this._tokenFields = { accessToken, refreshToken, tokenSecret, expires }
    return this
  }

  /**
   * Sets the original payload received from the
   * provider, helpful for debugging.
   *
   * @method setOriginal
   */
  setOriginal (response) {
    this._original = response
    return this
  }

  /**
   * Returns original payload received from the
   * provider.
   *
   * @main getOriginal
   *
   * @return {Object}
   */
  getOriginal () {
    return this._original
  }

  /**
   * Returns the user id
   *
   * @method getId
   *
   * @return {String|Number}
   */
  getId () {
    return this._userFields.id
  }

  /**
   * Returns the user name
   *
   * @main getName
   *
   * @return {String}
   */
  getName () {
    return this._userFields.name
  }

  /**
   * Returns the user email
   *
   * @method getEmail
   *
   * @return {String}
   */
  getEmail () {
    return this._userFields.email
  }

  /**
   * Returns the user nickname
   *
   * @method getNickname
   *
   * @return {String}
   */
  getNickname () {
    return this._userFields.nickname
  }

  /**
   * Returns the user avatar
   *
   * @method getAvatar
   *
   * @return {String}
   */
  getAvatar () {
    return this._userFields.avatar
  }

  /**
   * Returns the user access token
   *
   * @method getAccessToken
   *
   * @return {String}
   */
  getAccessToken () {
    return this._tokenFields.accessToken
  }

  /**
   * Returns the user refresh token
   *
   * @method getRefreshToken
   *
   * @return {String}
   */
  getRefreshToken () {
    return this._tokenFields.refreshToken
  }

  /**
   * Returns the users token expiry
   *
   * @method getExpires
   *
   * @return {String}
   */
  getExpires () {
    return this._tokenFields.expires
  }

  /**
   * Returns the users token secret
   *
   * @method getTokenSecret
   *
   * @return {String}
   */
  getTokenSecret () {
    return this._tokenFields.tokenSecret
  }

  /**
   * Returns a json representation of the user fields
   * and the token fields merged into a single
   * object.
   *
   * @method toJSON
   *
   * @return {Object}
   */
  toJSON () {
    return Object.assign({}, this._userFields, this._tokenFields)
  }
}

module.exports = AllyUser

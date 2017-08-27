'use strict'

/*
 * adonis-ally
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const _ = require('lodash')

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

    this._original = {}
  }

  /**
   * Set the user attributes
   *
   * @param {String} id
   * @param {String} name
   * @param {String} email
   * @param {String} nickname
   * @param {String} avatar
   */
  setFields (id, name, email, nickname, avatar) {
    this._userFields.id = id
    this._userFields.name = name
    this._userFields.email = email
    this._userFields.nickname = nickname
    this._userFields.avatar = avatar
    return this
  }

  /**
   * Set provider token fields
   *
   * @param {String} accessToken
   * @param {String} refreshToken
   * @param {String} tokenSecret
   * @param {Number} expires
   */
  setToken (accessToken, refreshToken, tokenSecret, expires) {
    this._tokenFields.accessToken = accessToken
    this._tokenFields.refreshToken = refreshToken
    this._tokenFields.tokenSecret = tokenSecret
    this._tokenFields.expires = expires
    return this
  }

  /**
   * Set the original payload, maybe some needs it.
   */
  setOriginal (response) {
    this._original = response
    return this
  }

  /**
   * Return original payload
   *
   * @return {Object}
   */
  getOriginal () {
    return this._original
  }

  /**
   * Returns the user id
   *
   * @return {String}
   */
  getId () {
    return this._userFields.id
  }

  /**
   * Returns the user name
   *
   * @return {String}
   */
  getName () {
    return this._userFields.name
  }

  /**
   * Returns the user email
   *
   * @return {String}
   */
  getEmail () {
    return this._userFields.email
  }

  /**
   * Returns the user nickname
   *
   * @return {String}
   */
  getNickname () {
    return this._userFields.nickname
  }

  /**
   * Returns the user avatar
   *
   * @return {String}
   */
  getAvatar () {
    return this._userFields.avatar
  }

  /**
   * Returns the user access token
   *
   * @return {String}
   */
  getAccessToken () {
    return this._tokenFields.accessToken
  }

  /**
   * Returns the user refresh token
   *
   * @return {String}
   */
  getRefreshToken () {
    return this._tokenFields.refreshToken
  }

  /**
   * Returns the users token expiry
   *
   * @return {String}
   */
  getExpires () {
    return this._tokenFields.expires
  }

  /**
   * Returns the users token secret
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
   * @return {Object}
   */
  toJSON () {
    return _.merge(this._userFields, this._tokenFields)
  }
}

module.exports = AllyUser

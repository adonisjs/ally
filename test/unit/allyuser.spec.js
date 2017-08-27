'use strict'

/*
 * adonis-ally
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const test = require('japa')
const AllyUser = require('../../src/AllyUser')

test.group('AllyUser', function () {
  test('should be able to set partial user fields', function (assert) {
    const user = new AllyUser()
    user.setFields(10, 'name')
    assert.equal(user.getName(), 'name')
    assert.equal(user.getId(), 10)
  })

  test('should be able to set all user fields', function (assert) {
    const user = new AllyUser()
    user.setFields(10, 'name', 'email', 'nickname', 'avatar')
    assert.equal(user.getName(), 'name')
    assert.equal(user.getId(), 10)
    assert.equal(user.getNickname(), 'nickname')
    assert.equal(user.getEmail(), 'email')
    assert.equal(user.getAvatar(), 'avatar')
  })

  test('should be able to set original user response object', function (assert) {
    const user = new AllyUser()
    user.setOriginal({name: 'name'})
    assert.deepEqual(user.getOriginal(), {name: 'name'})
  })

  test('should be able to set partial user token details', function (assert) {
    const user = new AllyUser()
    user.setToken('1000')
    assert.equal(user.getAccessToken(), '1000')
  })

  test('should be able to set user token details', function (assert) {
    const user = new AllyUser()
    user.setToken('1000', '2000', '3000', 3500)
    assert.equal(user.getAccessToken(), '1000')
    assert.equal(user.getRefreshToken(), '2000')
    assert.equal(user.getTokenSecret(), '3000')
    assert.equal(user.getExpires(), 3500)
  })

  test('should return a merged user object using toJSON', function (assert) {
    const user = new AllyUser()
    user.setFields(10, 'name', 'email', 'nickname', 'avatar')
    user.setToken('1000', '2000', '3000', 3500)
    assert.deepEqual(user.toJSON(), {
      id: 10,
      name: 'name',
      email: 'email',
      nickname: 'nickname',
      avatar: 'avatar',
      accessToken: '1000',
      refreshToken: '2000',
      tokenSecret: '3000',
      expires: 3500
    })
  })
})


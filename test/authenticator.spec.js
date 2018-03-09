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
const Authenticator = require('../src/Authenticator')
const One = require('../src/Schemes/OAuth')
const Two = require('../src/Schemes/OAuth2')
const OAuthException = require('../src/Exceptions').OAuthException

test.group('Authenticator', function () {
  test('should be able to add runtime scope', function (assert) {
    const ally = new Authenticator({}, {}, {})
    ally.scope(['user', 'friends'])
    assert.deepEqual(ally._scope, ['user', 'friends'])
  })

  test('should be able to add runtime fields', function (assert) {
    const ally = new Authenticator({}, {}, {})
    ally.fields(['name', 'email'])
    assert.deepEqual(ally._fields, ['name', 'email'])
  })

  test('should be throw an exception when scope values are not an array', function (assert) {
    const ally = new Authenticator({}, {}, {})
    const fn = () => ally.scope('user')
    assert.throw(fn, 'E_INVALID_PARAMETER: Value for scope must be an array')
  })

  test('should be throw an exception when fields values are not an array', function (assert) {
    const ally = new Authenticator({}, {}, {})
    const fn = () => ally.fields('name')
    assert.throw(fn, 'E_INVALID_PARAMETER: Value for fields must be an array')
  })

  test('should return the redirect uri by calling the getRedirectUrl on the driver instance', async function (assert) {
    class DummyDriver {
      constructor () {
        this.scope = []
      }

      async getRedirectUrl (scope) {
        this.scope = scope
      }
    }
    const dummyDriver = new DummyDriver()
    const ally = new Authenticator(dummyDriver, {}, {})
    await ally.scope(['user']).getRedirectUrl()
    assert.deepEqual(dummyDriver.scope, ['user'])
  })

  test('should pass the request code to the driver instance getUser method when invoked', async function (assert) {
    class DummyDriver {
      constructor () {
        this.queryParams = []
      }

      async getUser (queryParams) {
        this.queryParams = queryParams
      }
    }
    const dummyDriver = new DummyDriver()
    const ally = new Authenticator(dummyDriver, {get: function () {
      return {code: 'foo'}
    }}, {})
    await ally.getUser()
    assert.deepEqual(dummyDriver.queryParams.code, 'foo')
  })

  test('should clear the _scope property after calling the getRedirectUrl method', async function (assert) {
    class DummyDriver {
      constructor () {
        this.scope = []
      }

      async getRedirectUrl (scope) {
        this.scope = scope
      }
    }
    const dummyDriver = new DummyDriver()
    const ally = new Authenticator(dummyDriver, {}, {})
    await ally.scope(['user']).getRedirectUrl()
    assert.deepEqual(ally._scope, [])
  })

  test('should throw an invalid method exception for call getUserByToken method on invalid driver', async function (assert) {
    assert.plan(1)
    class DummyDriver extends One {
      constructor () {
        super('clientId', 'clientSecret', 'url')
      }
    }
    const dummyDriver = new DummyDriver()
    const ally = new Authenticator(dummyDriver, {}, {})
    try {
      await ally.getUserByToken('randomToken')
    } catch (error) {
      console.log()
      assert.instanceOf(error, OAuthException)
    }
  })

  test('should throw an invalid method exception for call getUserByTokenAndSecret method on invalid driver', async function (assert) {
    assert.plan(1)
    class DummyDriver extends Two {
      constructor () {
        super('clientId', 'clientSecret', 'url')
      }
    }
    const dummyDriver = new DummyDriver()
    const ally = new Authenticator(dummyDriver, {}, {})
    try {
      await ally.getUserByTokenAndSecret('randomToken', 'randomSecret')
    } catch (error) {
      console.log()
      assert.instanceOf(error, OAuthException)
    }
  })
})

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
const GE = require('@adonisjs/generic-exceptions')
const { Config } = require('@adonisjs/sink')
const config = new Config()

test.group('Authenticator', () => {
  test('should be able to add runtime scope', (assert) => {
    const ally = new Authenticator(config, {}, {}, {})
    ally.scope(['user', 'friends'])
    assert.deepEqual(ally._driverInstance.scope, ['user', 'friends'])
  })

  test('should be able to add runtime fields', (assert) => {
    const ally = new Authenticator(config, {}, {}, {})
    ally.fields(['name', 'email'])
    assert.deepEqual(ally._driverInstance.fields, ['name', 'email'])
  })

  test('should be throw an exception when scope values are not an array', (assert) => {
    const ally = new Authenticator(config, {}, {}, {})
    const fn = () => ally.scope('user')
    assert.throw(fn, 'E_INVALID_PARAMETER: Value for scope must be an array')
  })

  test('should be throw an exception when fields values are not an array', (assert) => {
    const ally = new Authenticator(config, {}, {}, {})
    const fn = () => ally.fields('name')
    assert.throw(fn, 'E_INVALID_PARAMETER: Value for fields must be an array')
  })

  test('should return the redirect uri by calling the getRedirectUrl on the driver instance', async (assert) => {
    class DummyDriver {
      constructor () {
        this.scope = []
      }

      async getRedirectUrl () {
      }
    }
    const dummyDriver = new DummyDriver()
    const ally = new Authenticator(config, dummyDriver, {}, {})
    await ally.scope(['user']).getRedirectUrl()
    assert.deepEqual(dummyDriver.scope, ['user'])
  })

  test('should set cookie with correct cookie options', async (assert) => {
    let cookie = null

    class DummyDriver {
      constructor () {
        this.scope = []
      }

      get supportStates () {
        return true
      }

      async getRedirectUrl () {
      }
    }

    const dummyDriver = new DummyDriver()
    const ally = new Authenticator(config, dummyDriver, {}, {
      status () {
        return this
      },
      cookie (key, value, options) {
        cookie = { key, value, options }
      },
      redirect () {
      }
    })

    await ally.redirect()
    assert.deepEqual(cookie.key, 'oauth_state')
    assert.deepEqual(cookie.options, {
      httpOnly: true,
      path: '/',
      sameSite: false
    })
  })

  test('should set cookie with config options', async (assert) => {
    let cookie = null

    class DummyDriver {
      constructor () {
        this.scope = []
      }

      get supportStates () {
        return true
      }

      async getRedirectUrl () {
      }
    }

    const dummyDriver = new DummyDriver()
    const config = new Config()
    config.set('app.cookie', {
      path: '/login'
    })

    const ally = new Authenticator(config, dummyDriver, {}, {
      status () {
        return this
      },
      cookie (key, value, options) {
        cookie = { key, value, options }
      },
      redirect () {
      }
    })

    await ally.redirect()
    assert.deepEqual(cookie.key, 'oauth_state')
    assert.deepEqual(cookie.options, {
      httpOnly: true,
      path: '/login',
      sameSite: false
    })
  })

  test('should pass the request code to the driver instance getUser method when invoked', async (assert) => {
    class DummyDriver {
      constructor () {
        this.queryParams = []
      }

      async getUser (queryParams) {
        this.queryParams = queryParams
      }
    }
    const dummyDriver = new DummyDriver()
    const ally = new Authenticator(config, dummyDriver, {
      get: function () {
        return { code: 'foo' }
      },
      cookie () {
      }
    }, {
      clearCookie () {
      }
    })
    await ally.getUser()
    assert.deepEqual(dummyDriver.queryParams.code, 'foo')
  })

  test('should throw an invalid parameter exception when OAuth One is called without access secret key', async (assert) => {
    assert.plan(1)

    class DummyDriver extends One {
      constructor () {
        super('clientId', 'clientSecret', 'url')
      }
    }
    const dummyDriver = new DummyDriver()
    const ally = new Authenticator(config, dummyDriver, {}, {})
    try {
      await ally.getUserByToken('randomToken')
    } catch (error) {
      assert.instanceOf(error, GE.InvalidArgumentException)
    }
  })
})

'use strict'

/*
 * adonis-ally
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const chai = require('chai')
const Ally = require('../../src/Ally')
const assert = chai.assert
require('co-mocha')

describe('Ally', function () {
  it('should be able to add runtime scope', function () {
    const ally = new Ally({}, {}, {})
    ally.scope(['user', 'friends'])
    assert.deepEqual(ally._scope, ['user', 'friends'])
  })

  it('should be able to add runtime fields', function () {
    const ally = new Ally({}, {}, {})
    ally.fields(['name', 'email'])
    assert.deepEqual(ally._fields, ['name', 'email'])
  })

  it('should be throw an exception when scope values are not an array', function () {
    const ally = new Ally({}, {}, {})
    const fn = () => ally.scope('user')
    assert.throw(fn, 'E_INVALID_PARAMETER: Value for scope must be an array')
  })

  it('should be throw an exception when fields values are not an array', function () {
    const ally = new Ally({}, {}, {})
    const fn = () => ally.fields('name')
    assert.throw(fn, 'E_INVALID_PARAMETER: Value for fields must be an array')
  })

  it('should return the redirect uri by calling the getRedirectUrl on the driver instance', function * () {
    class DummyDriver {
      constructor () {
        this.scope = []
      }

      * getRedirectUrl (scope) {
        this.scope = scope
      }
    }
    const dummyDriver = new DummyDriver()
    const ally = new Ally(dummyDriver, {}, {})
    yield ally.scope(['user']).getRedirectUrl()
    assert.deepEqual(dummyDriver.scope, ['user'])
  })

  it('should pass the request code to the driver instance getUser method when invoked', function * () {
    class DummyDriver {
      constructor () {
        this.queryParams = []
      }

      * getUser (queryParams) {
        this.queryParams = queryParams
      }
    }
    const dummyDriver = new DummyDriver()
    const ally = new Ally(dummyDriver, {get: function () {
      return {code: 'foo'}
    }}, {})
    yield ally.getUser()
    assert.deepEqual(dummyDriver.queryParams.code, 'foo')
  })

  it('should clear the _scope property after calling the getRedirectUrl method', function * () {
    class DummyDriver {
      constructor () {
        this.scope = []
      }

      * getRedirectUrl (scope) {
        this.scope = scope
      }
    }
    const dummyDriver = new DummyDriver()
    const ally = new Ally(dummyDriver, {}, {})
    yield ally.scope(['user']).getRedirectUrl()
    assert.deepEqual(ally._scope, [])
  })
})

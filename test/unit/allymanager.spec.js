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
const Ioc = require('adonis-fold').Ioc
const AllyManager = require('../../src/AllyManager')
const config = require('./setup/config')
const assert = chai.assert

describe('AllyManager', function () {
  before(function () {
    Ioc.bind('Adonis/Src/Config', function () {
      return config
    })
  })

  it('should return an instance of ally using the driver method', function () {
    const ally = new AllyManager({}, {})
    const fb = ally.driver('facebook')
    assert.equal(fb.constructor.name, 'Ally')
    assert.equal(fb._driverInstance.constructor.name, 'Facebook')
  })

  it('should throw an exception when unable to find the requested driver', function () {
    const ally = new AllyManager({}, {})
    const foo = () => ally.driver('foo')
    assert.throw(foo, 'E_INVALID_ALLY_DRIVER: Cannot find ally driver foo')
  })

  it('should be able to extend ally to add new drivers', function () {
    class FooDriver {}
    AllyManager.extend('foo', new FooDriver())
    const ally = new AllyManager({}, {})
    const foo = ally.driver('foo')
    assert.instanceOf(foo._driverInstance, FooDriver)
  })
})

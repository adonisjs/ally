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
const { ioc } = require('@adonisjs/fold')
const AllyManager = require('../../src/AllyManager')
const config = require('./setup/config')

test.group('AllyManager', function (group) {
  group.before(function () {
    ioc.bind('Adonis/Src/Config', function () {
      return config
    })
  })

  test('should return an instance of ally using the driver method', function (assert) {
    const ally = new AllyManager({}, {})
    const fb = ally.driver('facebook')
    assert.equal(fb.constructor.name, 'Ally')
    assert.equal(fb._driverInstance.constructor.name, 'Facebook')
  })

  test('should throw an exception when unable to find the requested driver', function (assert) {
    const ally = new AllyManager({}, {})
    const foo = () => ally.driver('foo')
    assert.throw(foo, 'E_INVALID_ALLY_DRIVER: Cannot find ally driver foo')
  })

  test('should be able to extend ally to add new drivers', function (assert) {
    class FooDriver {}
    AllyManager.extend('foo', new FooDriver())
    const ally = new AllyManager({}, {})
    const foo = ally.driver('foo')
    assert.instanceOf(foo._driverInstance, FooDriver)
  })
})

/*
 * @adonisjs/ally
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { Ally } from '../src/Ally'
import { AllyManager } from '../src/AllyManager'
import { GithubDriver } from '../src/Drivers/Github'

import { setup, fs } from '../test-helpers'

test.group('AllyManager', (group) => {
  group.teardown(async () => {
    await fs.cleanup()
  })

  test('make instance of a mapping', async ({ assert }) => {
    const app = await setup(true)
    const manager = new AllyManager(app, {
      github: {
        driver: 'github',
      },
    })

    const HttpContext = app.container.resolveBinding('Adonis/Core/HttpContext')
    assert.instanceOf(manager.makeMapping(HttpContext.create('/', {}), 'github'), GithubDriver)
  })

  test('register provider as singleton', async ({ assert }) => {
    const app = await setup(true)
    assert.strictEqual(
      app.container.resolveBinding('Adonis/Addons/Ally'),
      app.container.resolveBinding('Adonis/Addons/Ally')
    )
  })

  test('add ally getter to http context', async ({ assert }) => {
    const app = await setup(true)
    const HttpContext = app.container.resolveBinding('Adonis/Core/HttpContext')

    assert.instanceOf(HttpContext.create('/', {}).ally, Ally)
  })

  test('extend ally manager to add custom drivers', async ({ assert }) => {
    const app = await setup(true)
    class MyCustomDriver {}

    const manager = new AllyManager(app, {
      foo: {
        driver: 'foo',
      },
    })
    manager.extend('foo', () => {
      return new MyCustomDriver() as any
    })

    const HttpContext = app.container.resolveBinding('Adonis/Core/HttpContext')
    assert.instanceOf(
      manager.makeMapping(HttpContext.create('/', {}), 'foo' as any),
      MyCustomDriver
    )
  })
})

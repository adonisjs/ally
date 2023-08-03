/*
 * @adonisjs/ally
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { HttpContextFactory } from '@adonisjs/core/factories/http'

import { AllyManager } from '../src/ally_manager.js'
import { GithubDriver } from '../src/drivers/github.js'
import allyDriversCollection from '../src/drivers_collection.js'

test.group('Ally manager', (group) => {
  group.each.setup(() => {
    return () => {
      allyDriversCollection.list = {}
    }
  })

  test('create an instance of a driver', ({ assert, expectTypeOf }) => {
    const ctx = new HttpContextFactory().create()

    const ally = new AllyManager(
      {
        github: ($ctx) => {
          return new GithubDriver($ctx, {
            clientId: '',
            clientSecret: '',
            callbackUrl: '',
          })
        },
      },
      ctx
    )

    assert.instanceOf(ally.use('github'), GithubDriver)
    assert.strictEqual(ally.use('github'), ally.use('github'))
    expectTypeOf(ally.use).parameters.toEqualTypeOf<['github']>()
    expectTypeOf(ally.use('github')).toMatchTypeOf<GithubDriver>()
  })

  test('throw error when making an unknown driver', () => {
    const ctx = new HttpContextFactory().create()

    const ally = new AllyManager({}, ctx)
    ;(ally.use as any)('github')
  }).throws(
    'Unknown ally provider "github". Make sure it is registered inside the config/ally.ts file'
  )
})

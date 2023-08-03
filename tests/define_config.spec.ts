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

import { AllyManager, defineConfig } from '../index.js'
import { GithubDriver } from '../src/drivers/github.js'
import type { GithubDriverContract } from '../src/types.js'
import allyDriversCollection from '../src/drivers_collection.js'

test.group('Define config', (group) => {
  group.each.setup(() => {
    return () => {
      allyDriversCollection.list = {}
    }
  })

  test('define manager config from user defined config', async ({ assert, expectTypeOf }) => {
    const managerConfig = defineConfig({
      github: {
        driver: 'github',
        clientId: '',
        clientSecret: '',
        callbackUrl: '',
        scopes: ['admin:org'],
      },
    })

    const ctx = new HttpContextFactory().create()
    const ally = new AllyManager(managerConfig.services, ctx)

    await allyDriversCollection.registerBundledDrivers(managerConfig.driversInUse)

    assert.instanceOf(ally.use('github'), GithubDriver)
    assert.strictEqual(ally.use('github'), ally.use('github'))
    expectTypeOf(ally.use).parameters.toEqualTypeOf<['github']>()
    expectTypeOf(ally.use('github')).toMatchTypeOf<GithubDriverContract>()
  })
})

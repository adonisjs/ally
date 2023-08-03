/*
 * @adonisjs/ally
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { IgnitorFactory } from '@adonisjs/core/factories'
import { HttpContextFactory } from '@adonisjs/core/factories/http'

import { AllyManager } from '../src/ally_manager.js'
import { defineConfig } from '../src/define_config.js'
import allyDriversCollection from '../src/drivers_collection.js'

const BASE_URL = new URL('./tmp/', import.meta.url)
const IMPORTER = (filePath: string) => {
  if (filePath.startsWith('./') || filePath.startsWith('../')) {
    return import(new URL(filePath, BASE_URL).href)
  }
  return import(filePath)
}

test.group('Ally provider', (group) => {
  group.each.setup(() => {
    return () => {
      allyDriversCollection.list = {}
    }
  })

  test('register drivers in use', async ({ assert }) => {
    const ignitor = new IgnitorFactory()
      .merge({
        rcFileContents: {
          providers: ['../../providers/ally_provider.js'],
        },
      })
      .withCoreConfig()
      .withCoreProviders()
      .merge({
        config: {
          ally: defineConfig({
            github: {
              driver: 'github',
              clientId: '',
              clientSecret: '',
              callbackUrl: '',
            },
          }),
        },
      })
      .create(BASE_URL, {
        importer: IMPORTER,
      })

    const app = ignitor.createApp('web')
    await app.init()
    await app.boot()

    assert.property(allyDriversCollection.list, 'github')
    assert.notAllProperties(allyDriversCollection.list, [
      'facebook',
      'linkedin',
      'google',
      'spotify',
      'twitter',
      'discord',
    ])
  })

  test('add ally to HttpContext', async ({ assert }) => {
    const ignitor = new IgnitorFactory()
      .merge({
        rcFileContents: {
          providers: ['../../providers/ally_provider.js'],
        },
      })
      .withCoreConfig()
      .withCoreProviders()
      .merge({
        config: {
          ally: defineConfig({
            github: {
              driver: 'github',
              clientId: '',
              clientSecret: '',
              callbackUrl: '',
            },
          }),
        },
      })
      .create(BASE_URL, {
        importer: IMPORTER,
      })

    const app = ignitor.createApp('web')
    await app.init()
    await app.boot()

    const ctx = new HttpContextFactory().create()
    assert.instanceOf(ctx.ally, AllyManager)

    // Should be singleton
    assert.strictEqual(ctx.ally, ctx.ally)
  })
})

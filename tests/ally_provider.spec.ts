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
import { defineConfig, services } from '../src/define_config.js'

const BASE_URL = new URL('./tmp/', import.meta.url)

test.group('Ally provider', () => {
  test('define HttpContext.ally property', async ({ assert }) => {
    const ignitor = new IgnitorFactory()
      .merge({
        rcFileContents: {
          providers: [() => import('../providers/ally_provider.js')],
        },
      })
      .withCoreConfig()
      .withCoreProviders()
      .merge({
        config: {
          ally: defineConfig({
            github: services.github({
              clientId: '',
              clientSecret: '',
              callbackUrl: '',
            }),
          }),
        },
      })
      .create(BASE_URL)

    const app = ignitor.createApp('web')
    await app.init()
    await app.boot()

    const ctx = new HttpContextFactory().create()
    assert.instanceOf(ctx.ally, AllyManager)

    // Should be singleton
    assert.strictEqual(ctx.ally, ctx.ally)
  })
})

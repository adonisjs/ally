/*
 * @adonisjs/ally
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { AppFactory } from '@adonisjs/core/factories/app'
import { ApplicationService } from '@adonisjs/core/types'
import { HttpContextFactory } from '@adonisjs/core/factories/http'

import { AllyManager } from '../src/ally_manager.js'
import { GoogleDriver } from '../src/drivers/google.js'
import { GithubDriver } from '../src/drivers/github.js'
import { services, defineConfig } from '../src/define_config.js'
import { DiscordDriver } from '../src/drivers/discord.js'
import { FacebookDriver } from '../src/drivers/facebook.js'
import { LinkedInDriver } from '../src/drivers/linked_in.js'
import { SpotifyDriver } from '../src/drivers/spotify.js'
import { TwitterDriver } from '../src/drivers/twitter.js'

const BASE_URL = new URL('./', import.meta.url)
const app = new AppFactory().create(BASE_URL, () => {}) as ApplicationService

test.group('Define config', () => {
  test('transform user defined config', async ({ assert, expectTypeOf }) => {
    const managerConfig = await defineConfig({
      github: services.github({
        clientId: '',
        clientSecret: '',
        callbackUrl: '',
        scopes: ['admin:org'],
      }),
    }).resolver(app)

    const ctx = new HttpContextFactory().create()
    const ally = new AllyManager(managerConfig, ctx)

    assert.instanceOf(ally.use('github'), GithubDriver)
    assert.strictEqual(ally.use('github'), ally.use('github'))
    expectTypeOf(ally.use).parameters.toEqualTypeOf<['github']>()
    expectTypeOf(ally.use('github')).toMatchTypeOf<GithubDriver>()
  })
})

test.group('Config services', () => {
  test('configure github driver', async ({ assert, expectTypeOf }) => {
    const managerConfig = await defineConfig({
      github: services.github({
        clientId: '',
        clientSecret: '',
        callbackUrl: '',
        scopes: ['admin:org'],
      }),
    }).resolver(app)

    const ctx = new HttpContextFactory().create()
    const ally = new AllyManager(managerConfig, ctx)

    assert.instanceOf(ally.use('github'), GithubDriver)
    assert.strictEqual(ally.use('github'), ally.use('github'))
    expectTypeOf(ally.use).parameters.toEqualTypeOf<['github']>()
    expectTypeOf(ally.use('github')).toMatchTypeOf<GithubDriver>()
  })

  test('configure google driver', async ({ assert, expectTypeOf }) => {
    const managerConfig = await defineConfig({
      google: services.google({
        clientId: '',
        clientSecret: '',
        callbackUrl: '',
        scopes: ['admin:org'],
      }),
    }).resolver(app)

    const ctx = new HttpContextFactory().create()
    const ally = new AllyManager(managerConfig, ctx)

    assert.instanceOf(ally.use('google'), GoogleDriver)
    assert.strictEqual(ally.use('google'), ally.use('google'))
    expectTypeOf(ally.use).parameters.toEqualTypeOf<['google']>()
    expectTypeOf(ally.use('google')).toMatchTypeOf<GoogleDriver>()
  })

  test('configure discord driver', async ({ assert, expectTypeOf }) => {
    const managerConfig = await defineConfig({
      discord: services.discord({
        clientId: '',
        clientSecret: '',
        callbackUrl: '',
        scopes: ['admin:org'],
      }),
    }).resolver(app)

    const ctx = new HttpContextFactory().create()
    const ally = new AllyManager(managerConfig, ctx)

    assert.instanceOf(ally.use('discord'), DiscordDriver)
    assert.strictEqual(ally.use('discord'), ally.use('discord'))
    expectTypeOf(ally.use).parameters.toEqualTypeOf<['discord']>()
    expectTypeOf(ally.use('discord')).toMatchTypeOf<DiscordDriver>()
  })

  test('configure facebook driver', async ({ assert, expectTypeOf }) => {
    const managerConfig = await defineConfig({
      facebook: services.facebook({
        clientId: '',
        clientSecret: '',
        callbackUrl: '',
        scopes: ['admin:org'],
      }),
    }).resolver(app)

    const ctx = new HttpContextFactory().create()
    const ally = new AllyManager(managerConfig, ctx)

    assert.instanceOf(ally.use('facebook'), FacebookDriver)
    assert.strictEqual(ally.use('facebook'), ally.use('facebook'))
    expectTypeOf(ally.use).parameters.toEqualTypeOf<['facebook']>()
    expectTypeOf(ally.use('facebook')).toMatchTypeOf<FacebookDriver>()
  })

  test('configure linkedin driver', async ({ assert, expectTypeOf }) => {
    const managerConfig = await defineConfig({
      linkedin: services.linkedin({
        clientId: '',
        clientSecret: '',
        callbackUrl: '',
        scopes: ['admin:org'],
      }),
    }).resolver(app)

    const ctx = new HttpContextFactory().create()
    const ally = new AllyManager(managerConfig, ctx)

    assert.instanceOf(ally.use('linkedin'), LinkedInDriver)
    assert.strictEqual(ally.use('linkedin'), ally.use('linkedin'))
    expectTypeOf(ally.use).parameters.toEqualTypeOf<['linkedin']>()
    expectTypeOf(ally.use('linkedin')).toMatchTypeOf<LinkedInDriver>()
  })

  test('configure spotify driver', async ({ assert, expectTypeOf }) => {
    const managerConfig = await defineConfig({
      spotify: services.spotify({
        clientId: '',
        clientSecret: '',
        callbackUrl: '',
        scopes: ['admin:org'],
      }),
    }).resolver(app)

    const ctx = new HttpContextFactory().create()
    const ally = new AllyManager(managerConfig, ctx)

    assert.instanceOf(ally.use('spotify'), SpotifyDriver)
    assert.strictEqual(ally.use('spotify'), ally.use('spotify'))
    expectTypeOf(ally.use).parameters.toEqualTypeOf<['spotify']>()
    expectTypeOf(ally.use('spotify')).toMatchTypeOf<SpotifyDriver>()
  })

  test('configure twitter driver', async ({ assert, expectTypeOf }) => {
    const managerConfig = await defineConfig({
      twitter: services.twitter({
        clientId: '',
        clientSecret: '',
        callbackUrl: '',
      }),
    }).resolver(app)

    const ctx = new HttpContextFactory().create()
    const ally = new AllyManager(managerConfig, ctx)

    assert.instanceOf(ally.use('twitter'), TwitterDriver)
    assert.strictEqual(ally.use('twitter'), ally.use('twitter'))
    expectTypeOf(ally.use).parameters.toEqualTypeOf<['twitter']>()
    expectTypeOf(ally.use('twitter')).toMatchTypeOf<TwitterDriver>()
  })
})

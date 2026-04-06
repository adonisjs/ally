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
import { type ApplicationService } from '@adonisjs/core/types'
import { HttpContextFactory } from '@adonisjs/core/factories/http'

import { AllyManager } from '../src/ally_manager.ts'
import { GoogleDriver } from '../src/drivers/google.ts'
import { GithubDriver } from '../src/drivers/github.ts'
import { services, defineConfig } from '../src/define_config.ts'
import { DiscordDriver } from '../src/drivers/discord.ts'
import { FacebookDriver } from '../src/drivers/facebook.ts'
import { LinkedInDriver } from '../src/drivers/linked_in.ts'
import { SpotifyDriver } from '../src/drivers/spotify.ts'
import { TwitterDriver } from '../src/drivers/twitter.ts'
import { TwitterXDriver } from '../src/drivers/twitter_x.ts'
import { LinkedInOpenidConnectDriver } from '../src/drivers/linked_in_openid_connect.ts'

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

  test('configure linkedin openid connect driver', async ({ assert, expectTypeOf }) => {
    const managerConfig = await defineConfig({
      linkedinOpenidConnect: services.linkedinOpenidConnect({
        clientId: '',
        clientSecret: '',
        callbackUrl: '',
        scopes: ['email', 'profile'],
      }),
    }).resolver(app)

    const ctx = new HttpContextFactory().create()
    const ally = new AllyManager(managerConfig, ctx)

    assert.instanceOf(ally.use('linkedinOpenidConnect'), LinkedInOpenidConnectDriver)
    assert.strictEqual(ally.use('linkedinOpenidConnect'), ally.use('linkedinOpenidConnect'))
    expectTypeOf(ally.use).parameters.toEqualTypeOf<['linkedinOpenidConnect']>()
    expectTypeOf(ally.use('linkedinOpenidConnect')).toMatchTypeOf<LinkedInOpenidConnectDriver>()
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

  test('configure twitter x driver', async ({ assert, expectTypeOf }) => {
    const managerConfig = await defineConfig({
      twitterX: services.twitterX({
        clientId: '',
        clientSecret: '',
        callbackUrl: '',
      }),
    }).resolver(app)

    const ctx = new HttpContextFactory().create()
    const ally = new AllyManager(managerConfig, ctx)

    assert.instanceOf(ally.use('twitterX'), TwitterXDriver)
    assert.strictEqual(ally.use('twitterX'), ally.use('twitterX'))
    expectTypeOf(ally.use).parameters.toEqualTypeOf<['twitterX']>()
    expectTypeOf(ally.use('twitterX')).toMatchTypeOf<TwitterXDriver>()
  })
})

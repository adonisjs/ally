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

import { GithubDriver } from '../src/drivers/github.js'
import { GoogleDriver } from '../src/drivers/google.js'
import { TwitterDriver } from '../src/drivers/twitter.js'
import { DiscordDriver } from '../src/drivers/discord.js'
import { SpotifyDriver } from '../src/drivers/spotify.js'
import { FacebookDriver } from '../src/drivers/facebook.js'
import { LinkedInDriver } from '../src/drivers/linked_in.js'
import allyDriversCollection from '../src/drivers_collection.js'
import type {
  DiscordDriverContract,
  FacebookDriverContract,
  GithubDriverContract,
  GoogleDriverContract,
  LinkedInDriverContract,
  SpotifyDriverContract,
  TwitterDriverContract,
} from '../src/types.js'

test.group('Drivers Collection', (group) => {
  group.each.setup(() => {
    return () => {
      allyDriversCollection.list = {}
    }
  })

  test('create an instance of a known driver', async ({ assert, expectTypeOf }) => {
    const ctx = new HttpContextFactory().create()
    await allyDriversCollection.registerBundledDrivers(
      new Set(['github', 'google', 'discord', 'facebook', 'linkedin', 'spotify', 'twitter'])
    )

    const discord = allyDriversCollection.create(
      'discord',
      { clientId: '', clientSecret: '', callbackUrl: '' },
      ctx
    )
    assert.instanceOf(discord, DiscordDriver)
    expectTypeOf(discord).toEqualTypeOf<DiscordDriverContract>()

    const github = allyDriversCollection.create(
      'github',
      { clientId: '', clientSecret: '', callbackUrl: '' },
      ctx
    )
    assert.instanceOf(github, GithubDriver)
    expectTypeOf(github).toEqualTypeOf<GithubDriverContract>()

    const google = allyDriversCollection.create(
      'google',
      { clientId: '', clientSecret: '', callbackUrl: '' },
      ctx
    )
    assert.instanceOf(google, GoogleDriver)
    expectTypeOf(google).toEqualTypeOf<GoogleDriverContract>()

    const facebook = allyDriversCollection.create(
      'facebook',
      { clientId: '', clientSecret: '', callbackUrl: '' },
      ctx
    )
    assert.instanceOf(facebook, FacebookDriver)
    expectTypeOf(facebook).toEqualTypeOf<FacebookDriverContract>()

    const linkedin = allyDriversCollection.create(
      'linkedin',
      { clientId: '', clientSecret: '', callbackUrl: '' },
      ctx
    )
    assert.instanceOf(linkedin, LinkedInDriver)
    expectTypeOf(linkedin).toEqualTypeOf<LinkedInDriverContract>()

    const spotify = allyDriversCollection.create(
      'spotify',
      { clientId: '', clientSecret: '', callbackUrl: '' },
      ctx
    )
    assert.instanceOf(spotify, SpotifyDriver)
    expectTypeOf(spotify).toEqualTypeOf<SpotifyDriverContract>()

    const twitter = allyDriversCollection.create(
      'twitter',
      { clientId: '', clientSecret: '', callbackUrl: '' },
      ctx
    )
    assert.instanceOf(twitter, TwitterDriver)
    expectTypeOf(twitter).toEqualTypeOf<TwitterDriverContract>()
  })

  test('extend drivers collection', ({ assert }) => {
    class Foo {}

    allyDriversCollection.extend('foo' as any, () => {
      return new Foo()
    })

    const ctx = new HttpContextFactory().create()
    assert.instanceOf(allyDriversCollection.create('foo' as any, {}, ctx), Foo)
  })

  test('throw error when trying to create an unknown driver', () => {
    const ctx = new HttpContextFactory().create()
    allyDriversCollection.create('bar' as any, {}, ctx)
  }).throws('Unknown ally driver "bar". Make sure the driver is registered')
})

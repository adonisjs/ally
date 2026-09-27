/*
 * @adonisjs/ally
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import type { HttpContext } from '@adonisjs/core/http'
import { HttpContextFactory } from '@adonisjs/core/factories/http'

import { GithubDriver } from '../src/drivers/github.js'
import { TwitterDriver } from '../src/drivers/twitter.js'
import { E_OAUTH_STATE_MISMATCH } from '../src/errors.js'

/**
 * Creates an HTTP context for a callback request with the given
 * query string and encrypted cookies
 */
function createCallbackContext(
  qs: Record<string, string>,
  cookies: Record<string, string> = {}
): HttpContext {
  const ctx = new HttpContextFactory().create()
  ctx.request.updateQs(qs)
  ctx.request.encryptedCookie = (key: string) => cookies[key]
  return ctx
}

function createGithubDriver(ctx: HttpContext) {
  return new GithubDriver(ctx, {
    clientId: 'client-id',
    clientSecret: 'client-secret',
    callbackUrl: 'http://localhost/callback',
  })
}

function createTwitterDriver(ctx: HttpContext) {
  return new TwitterDriver(ctx, {
    clientId: 'client-id',
    clientSecret: 'client-secret',
    callbackUrl: 'http://localhost/callback',
  })
}

test.group('OAuth2 | state mismatch', () => {
  test('report mismatch when state cookie and state param are both missing', async ({ assert }) => {
    const github = createGithubDriver(createCallbackContext({ code: 'attacker-code' }))

    assert.isTrue(github.stateMisMatch())
    await assert.rejects(() => github.accessToken(), E_OAUTH_STATE_MISMATCH)
  })

  test('report mismatch when state cookie is missing', ({ assert }) => {
    const github = createGithubDriver(
      createCallbackContext({ code: 'attacker-code', state: 'attacker-state' })
    )

    assert.isTrue(github.stateMisMatch())
  })

  test('report mismatch when state param differs from state cookie', ({ assert }) => {
    const github = createGithubDriver(
      createCallbackContext({ code: 'code', state: 'other' }, { gh_oauth_state: 'state' })
    )

    assert.isTrue(github.stateMisMatch())
  })

  test('accept matching state', ({ assert }) => {
    const github = createGithubDriver(
      createCallbackContext({ code: 'code', state: 'state' }, { gh_oauth_state: 'state' })
    )

    assert.isFalse(github.stateMisMatch())
  })

  test('skip state validation in stateless mode', ({ assert }) => {
    const github = createGithubDriver(createCallbackContext({ code: 'code' })).stateless()

    assert.isFalse(github.stateMisMatch())
  })
})

test.group('OAuth1 | state mismatch', () => {
  test('report mismatch when oauth token cookie and param are both missing', async ({ assert }) => {
    const twitter = createTwitterDriver(createCallbackContext({ oauth_verifier: 'verifier' }))

    assert.isTrue(twitter.stateMisMatch())
    await assert.rejects(() => twitter.accessToken(), E_OAUTH_STATE_MISMATCH)
  })

  test('report mismatch when oauth token param differs from cookie', ({ assert }) => {
    const twitter = createTwitterDriver(
      createCallbackContext(
        { oauth_verifier: 'verifier', oauth_token: 'other' },
        { twitter_oauth_token: 'token' }
      )
    )

    assert.isTrue(twitter.stateMisMatch())
  })

  test('accept matching oauth token', ({ assert }) => {
    const twitter = createTwitterDriver(
      createCallbackContext(
        { oauth_verifier: 'verifier', oauth_token: 'token' },
        { twitter_oauth_token: 'token' }
      )
    )

    assert.isFalse(twitter.stateMisMatch())
  })
})

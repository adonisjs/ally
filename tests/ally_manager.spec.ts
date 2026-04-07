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

import { AllyManager } from '../src/ally_manager.ts'
import { GithubDriver } from '../src/drivers/github.ts'
import { E_LOCAL_SIGNUP_DISALLOWED, E_UNKNOWN_ALLY_PROVIDER } from '../src/errors.ts'

test.group('Ally manager', () => {
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
    expectTypeOf(ally.use).parameters.toEqualTypeOf<
      [provider: 'github', options?: { intent?: 'signup' | 'login' | 'link' }]
    >()
    expectTypeOf(ally.use('github')).toMatchTypeOf<GithubDriver>()
  })

  test('throw 404 error when making an unknown driver', ({ assert }) => {
    const ctx = new HttpContextFactory().create()

    const ally = new AllyManager({}, ctx)

    try {
      ;(ally.use as any)('github')
      assert.fail('Expected use to throw for an unknown provider')
    } catch (error) {
      assert.isDefined(error)
      assert.instanceOf(error, E_UNKNOWN_ALLY_PROVIDER)

      if (error instanceof E_UNKNOWN_ALLY_PROVIDER) {
        assert.equal(error.status, 404)
        assert.equal(error.message, 'Unknown authentication provider "github"')
      }
    }
  })

  test('check if a provider exists and narrow its type', ({ assert, expectTypeOf }) => {
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

    const provider: string = 'github'
    assert.isTrue(ally.has(provider))

    if (ally.has(provider)) {
      expectTypeOf(provider).toEqualTypeOf<'github'>()
      assert.instanceOf(ally.use(provider), GithubDriver)
    }

    assert.isFalse(ally.has('google'))
  })

  test('check if a provider allows local signup', ({ assert }) => {
    const ctx = new HttpContextFactory().create()

    const ally = new AllyManager(
      {
        github: ($ctx) => {
          return new GithubDriver($ctx, {
            clientId: '',
            clientSecret: '',
            callbackUrl: '',
            disallowLocalSignup: true,
          })
        },
      },
      ctx
    )

    assert.isFalse(ally.allowsLocalSignup('github'))
  })

  test('allow local signup when provider does not define the signup flag', ({ assert }) => {
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

    assert.isTrue(ally.allowsLocalSignup('github'))
  })

  test('get configured provider names', ({ assert, expectTypeOf }) => {
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

    assert.deepEqual(ally.configuredProviderNames(), ['github'])
    expectTypeOf(ally.configuredProviderNames()).toEqualTypeOf<Array<'github'>>()
  })

  test('get provider names that allow local signup', ({ assert, expectTypeOf }) => {
    const ctx = new HttpContextFactory().create()

    const ally = new AllyManager(
      {
        github: ($ctx) => {
          return new GithubDriver($ctx, {
            clientId: '',
            clientSecret: '',
            callbackUrl: '',
            disallowLocalSignup: true,
          })
        },
        google: ($ctx) => {
          return new GithubDriver($ctx, {
            clientId: '',
            clientSecret: '',
            callbackUrl: '',
          })
        },
      },
      ctx
    )

    assert.deepEqual(ally.signupProviderNames(), ['google'])
    expectTypeOf(ally.signupProviderNames()).toEqualTypeOf<Array<'github' | 'google'>>()
  })

  test('throw 404 when checking local signup for an unknown provider', ({ assert }) => {
    const ctx = new HttpContextFactory().create()

    const ally = new AllyManager({}, ctx)

    try {
      ;(ally.allowsLocalSignup as any)('github')
      assert.fail('Expected allowsLocalSignup to throw for an unknown provider')
    } catch (error) {
      assert.isDefined(error)
      assert.instanceOf(error, E_UNKNOWN_ALLY_PROVIDER)

      if (error instanceof E_UNKNOWN_ALLY_PROVIDER) {
        assert.equal(error.status, 404)
        assert.equal(error.message, 'Unknown authentication provider "github"')
      }
    }
  })

  test('throw 403 error when signup is disallowed for a provider', ({ assert }) => {
    const ctx = new HttpContextFactory().create()

    const ally = new AllyManager(
      {
        github: ($ctx) => {
          return new GithubDriver($ctx, {
            clientId: '',
            clientSecret: '',
            callbackUrl: '',
            disallowLocalSignup: true,
          })
        },
      },
      ctx
    )

    try {
      ally.use('github', { intent: 'signup' })
      assert.fail('Expected use to throw when signup is disallowed')
    } catch (error) {
      assert.isDefined(error)
      assert.instanceOf(error, E_LOCAL_SIGNUP_DISALLOWED)

      if (error instanceof E_LOCAL_SIGNUP_DISALLOWED) {
        assert.equal(error.status, 403)
        assert.equal(
          error.message,
          'Cannot signup using "github". Local signup is disabled for this provider'
        )
      }
    }
  })
})

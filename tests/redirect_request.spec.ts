/*
 * @adonisjs/ally
 *
 * (c) Ally
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { RedirectRequest } from '../src/redirect_request.js'

test.group('Redirect request', () => {
  test('define scopes param', ({ assert }) => {
    const redirect = new RedirectRequest('http://foo.com', 'scopes', ',')
    redirect.scopes(['username', 'email'])

    assert.deepEqual(redirect.getParams(), { scopes: ['username', 'email'].join(',') })
  })

  test('merge to existing scopes', ({ assert }) => {
    const redirect = new RedirectRequest('http://foo.com', 'scopes', ',')
    redirect.scopes(['username', 'email'])
    redirect.mergeScopes(['avatar_url'])

    assert.deepEqual(redirect.getParams(), {
      scopes: ['username', 'email', 'avatar_url'].join(','),
    })
  })

  test('clear existing scopes', ({ assert }) => {
    const redirect = new RedirectRequest('http://foo.com', 'scopes', ',')
    redirect.scopes(['username', 'email'])
    redirect.clearScopes()
    redirect.mergeScopes(['avatar_url'])

    assert.deepEqual(redirect.getParams(), {
      scopes: ['avatar_url'].join(','),
    })
  })

  test('use scopes transformer', ({ assert }) => {
    const redirect = new RedirectRequest('http://foo.com', 'scopes', ',')
    redirect.transformScopes((scopes) => {
      return scopes.map((scope) => `foo.com/${scope}`)
    })

    redirect.scopes(['username', 'email'])
    redirect.mergeScopes(['avatar_url'])

    assert.deepEqual(redirect.getParams(), {
      scopes: ['foo.com/username', 'foo.com/email', 'foo.com/avatar_url'].join(','),
    })
  })
})

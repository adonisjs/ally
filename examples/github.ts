/*
 * @adonisjs/ally
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import Route from '@ioc:Adonis/Core/Route'

Route.get('github', async ({ response }) => {
  return response.send('<a href="/github/redirect"> Login with Github </a>')
})

Route.get('/github/redirect', async ({ ally }) => {
  return ally.use('github').redirect((request) => {
    request.scopes(['user', 'repo'])
  })
})

Route.get('/github/callback', async ({ ally }) => {
  try {
    const gh = ally.use('github')
    if (gh.accessDenied()) {
      return 'Access was denied'
    }

    if (gh.stateMisMatch()) {
      return 'Request expired. Retry again'
    }

    if (gh.hasError()) {
      return gh.getError()
    }

    const user = await gh.user()
    return user
  } catch (error) {
    console.log({ error: error.response })
    throw error
  }
})

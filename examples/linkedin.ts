/*
 * @adonisjs/ally
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import Route from '@ioc:Adonis/Core/Route'

Route.get('linkedin', async ({ response }) => {
  return response.send('<a href="/linkedin/redirect"> Login with linkedin </a>')
})

Route.get('/linkedin/redirect', async ({ ally }) => {
  return ally.use('linkedin').redirect()
})

Route.get('/linkedin/callback', async ({ ally }) => {
  try {
    const linkedin = ally.use('linkedin')
    if (linkedin.accessDenied()) {
      return 'Access was denied'
    }

    if (linkedin.stateMisMatch()) {
      return 'Request expired. Retry again'
    }

    if (linkedin.hasError()) {
      return linkedin.getError()
    }

    const user = await linkedin.user()
    return user
  } catch (error) {
    console.log({ error: error.response })
    throw error
  }
})

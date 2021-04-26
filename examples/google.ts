/*
 * @adonisjs/ally
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import Route from '@ioc:Adonis/Core/Route'

Route.get('google', async ({ response }) => {
  return response.send('<a href="/google/redirect"> Login with Google </a>')
})

Route.get('/google/redirect', async ({ ally }) => {
  return ally.use('google').redirect()
})

Route.get('/google/callback', async ({ ally }) => {
  try {
    const google = ally.use('google')
    if (google.accessDenied()) {
      return 'Access was denied'
    }

    if (google.stateMisMatch()) {
      return 'Request expired. Retry again'
    }

    if (google.hasError()) {
      return google.getError()
    }

    const user = await google.user()
    return user
  } catch (error) {
    console.log({ error: error.response })
    throw error
  }
})

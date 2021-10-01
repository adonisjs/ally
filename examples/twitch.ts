/*
 * @adonisjs/ally
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import Route from '@ioc:Adonis/Core/Route'

Route.get('twitch', async ({ response }) => {
  return response.send('<a href="/twitch/redirect"> Login with twitch </a>')
})

Route.get('/twitch/redirect', async ({ ally }) => {
  return ally.use('twitch').redirect()
})

Route.get('/twitch/callback', async ({ ally, request }) => {
  console.log(request.cookiesList())

  try {
    const twitch = ally.use('twitch')
    if (twitch.accessDenied()) {
      return 'Access was denied'
    }

    if (twitch.hasError()) {
      console.log('shit')
      return twitch.getError()
    }

    if (twitch.stateMisMatch()) {
      return 'Request expired. Retry again'
    }

    const user = await twitch.user()
    return user
  } catch (error) {
    console.log({ error: error.response })
    throw error
  }
})

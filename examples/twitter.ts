/*
 * @adonisjs/ally
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import Route from '@ioc:Adonis/Core/Route'

Route.get('twitter', async ({ response }) => {
  return response.send('<a href="/twitter/redirect"> Login with twitter </a>')
})

Route.get('/twitter/redirect', async ({ ally }) => {
  return ally.use('twitter').redirect()
})

Route.get('/twitter/callback', async ({ ally, request }) => {
  console.log(request.cookiesList())

  try {
    const twitter = ally.use('twitter')

    if (twitter.accessDenied()) {
      return 'Access was denied'
    }

    if (twitter.hasError()) {
      return twitter.getError()
    }

    if (twitter.stateMisMatch()) {
      return 'Request expired. Retry again'
    }

    const user = await twitter.user()
    return user
  } catch (error) {
    console.log({ error: error.response })
    throw error
  }
})

/*
 * @adonisjs/ally
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import router from '@adonisjs/core/services/router'

router.get('spotify', async ({ response }) => {
  return response.send('<a href="/spotify/redirect"> Login with spotify </a>')
})

router.get('/spotify/redirect', async ({ ally }) => {
  return ally.use('spotify').redirect((request) => {
    request.scopes(['user-read-email'])
  })
})

router.get('/spotify/callback', async ({ ally }) => {
  try {
    const spotify = ally.use('spotify')
    if (spotify.accessDenied()) {
      return 'Access was denied'
    }

    if (spotify.stateMisMatch()) {
      return 'Request expired. Retry again'
    }

    if (spotify.hasError()) {
      return spotify.getError()
    }

    const user = await spotify.user()
    return user
  } catch (error) {
    console.log({ error: error.response })
    throw error
  }
})

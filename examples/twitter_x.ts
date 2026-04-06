/*
 * @adonisjs/ally
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import router from '@adonisjs/core/services/router'

router.get('twitter-x', async ({ response }) => {
  return response.send('<a href="/twitter-x/redirect"> Login with X </a>')
})

router.get('/twitter-x/redirect', async ({ ally }) => {
  return ally.use('twitterX').redirect()
})

router.get('/twitter-x/callback', async ({ ally }) => {
  try {
    const twitterX = ally.use('twitterX')

    if (twitterX.accessDenied()) {
      return 'Access was denied'
    }

    if (twitterX.hasError()) {
      return twitterX.getError()
    }

    if (twitterX.stateMisMatch()) {
      return 'Request expired. Retry again'
    }

    const user = await twitterX.user()
    return user
  } catch (error: any) {
    console.log({ error: error.response })
    throw error
  }
})

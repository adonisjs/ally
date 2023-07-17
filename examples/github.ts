/*
 * @adonisjs/ally
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import router from '@adonisjs/core/services/router'

router.get('github', async ({ response }) => {
  return response.send('<a href="/github/redirect"> Login with Github </a>')
})

router.get('/github/redirect', async ({ ally }) => {
  return ally.use('github').redirect((request) => {
    request.scopes(['read:user'])
  })
})

router.get('/github/callback', async ({ ally }) => {
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
    console.log({ error: error.cause })
    throw error
  }
})

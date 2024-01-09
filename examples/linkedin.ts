/*
 * @adonisjs/ally
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import router from '@adonisjs/core/services/router'

router.get('linkedin', async ({ response }) => {
  return response.send('<a href="/linkedin/redirect"> Login with linkedin </a>')
})

router.get('/linkedin/redirect', async ({ ally }) => {
  return ally.use('linkedin').redirect()
})

router.get('/linkedin/callback', async ({ ally }) => {
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

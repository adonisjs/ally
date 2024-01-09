/*
 * @adonisjs/ally
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import router from '@adonisjs/core/services/router'

router.get('discord', async ({ response }) => {
  return response.send('<a href="/discord/redirect"> Login with Discord</a>')
})

router.get('/discord/redirect', async ({ ally }) => {
  return ally.use('discord').redirect((request) => {
    request.scopes(['identify', 'guilds'])
  })
})

router.get('/discord/callback', async ({ ally }) => {
  try {
    const discord = ally.use('discord')
    if (discord.accessDenied()) {
      return 'Access was denied'
    }

    if (discord.stateMisMatch()) {
      return 'Request expired. Retry again'
    }

    if (discord.hasError()) {
      return discord.getError()
    }

    const user = await discord.user()
    return user
  } catch (error) {
    console.log({ error: error.response })
    throw error
  }
})

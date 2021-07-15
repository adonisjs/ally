import Route from '@ioc:Adonis/Core/Route'

Route.get('apple', async ({ response }) => {
  return response.send('<a href="/apple/redirect">Login with Apple</a>')
})

Route.get('/apple/redirect', async ({ ally }) => {
  return ally.use('apple').redirect((request) => {
    request.scopes(['email', 'name'])
  })
})

Route.post('/apple/callback', async ({ ally }) => {
  try {
    const apple = ally.use('apple')
    if (apple.accessDenied()) {
      return 'Access was denied'
    }

    if (apple.stateMisMatch()) {
      return 'Request expired. Retry again'
    }

    if (apple.hasError()) {
      return apple.getError()
    }

    const user = await apple.user()
    return user
  } catch (error) {
    console.log({ error: error.response })
    throw error
  }
})

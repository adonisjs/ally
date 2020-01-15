'use strict'

const { ioc } = require('@adonisjs/fold')
const config = require('./setup/config')
const http = require('./setup/http')
const Ally = require('../src/Ally')
ioc.bind('Adonis/Src/Config', () => config)

http.get('/discord', async (request, response) => {
  const ally = new Ally(ioc.use('Adonis/Src/Config'), request, response)
  const discord = ally.driver('discord')

  if (request.input('redirect')) {
    await discord.redirect()
  } else {
    response.writeHead(200, { 'content-type': 'text/html' })
    response.write(`<a href="/discord?redirect=true">Login With Discord</a>`)
    response.end()
  }
})

http.get('/discord/authenticated', async (request, response) => {
  const ally = new Ally(ioc.use('Adonis/Src/Config'), request, response)
  const discord = ally.driver('discord')

  try {
    const user = await discord.getUser()
    response.writeHead(200, { 'content-type': 'application/json' })
    response.write(JSON.stringify({ original: user.getOriginal(), profile: user.toJSON() }))
  } catch (error) {
    console.error(error)
    response.writeHead(500, { 'content-type': 'application/json' })
    response.write(JSON.stringify({ error }))
  }
  response.end()
})

http.start().listen(8000)

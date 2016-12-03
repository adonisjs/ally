'use strict'

const Ioc = require('adonis-fold').Ioc
const config = require('./setup/config')
const http = require('./setup/http')
const AllyManager = require('../src/AllyManager')
Ioc.bind('Adonis/Src/Config', () => {
  return config
})

http.get('/discord', function * (request, response) {
  const ally = new AllyManager(request, response)
  const discord = ally.driver('discord')
  response.writeHead(200, {'content-type': 'text/html'})
  const url = yield discord.getRedirectUrl()
  response.write(`<a href="${url}">Login With Discord</a>`)
  response.end()
})

http.get('/discord/authenticated', function * (request, response) {
  const ally = new AllyManager(request, response)
  const discord = ally.driver('discord')
  try {
    const user = yield discord.getUser()
    response.writeHead(200, {'content-type': 'application/json'})
    response.write(JSON.stringify({ original: user.getOriginal(), profile: user.toJSON() }))
  } catch (e) {
    response.writeHead(500, {'content-type': 'application/json'})
    response.write(JSON.stringify({ error: e }))
  }
  response.end()
})

http.start().listen(8000)

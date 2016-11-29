'use strict'

const Ioc = require('adonis-fold').Ioc
const config = require('./setup/config')
const http = require('./setup/http')
const AllyManager = require('../src/AllyManager')
Ioc.bind('Adonis/Src/Config', () => {
  return config
})

http.get('/spotify', function * (request, response) {
  const ally = new AllyManager(request, response)
  const spotify = ally.driver('spotify')
  response.writeHead(200, {'content-type': 'text/html'})
  const url = yield spotify.getRedirectUrl()
  response.write(`<a href="${url}">Login With Spotify</a>`)
  response.end()
})

http.get('/spotify/authenticated', function * (request, response) {
  const ally = new AllyManager(request, response)
  const spotify = ally.driver('spotify')
  try {
    const user = yield spotify.getUser()
    response.writeHead(200, {'content-type': 'application/json'})
    response.write(JSON.stringify({ original: user.getOriginal(), profile: user.toJSON() }))
  } catch (e) {
    response.writeHead(500, {'content-type': 'application/json'})
    response.write(JSON.stringify({ error: e }))
  }
  response.end()
})

http.start().listen(8000)

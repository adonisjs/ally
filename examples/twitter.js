'use strict'

const Ioc = require('adonis-fold').Ioc
const config = require('./setup/config')
const http = require('./setup/http')
const AllyManager = require('../src/AllyManager')
Ioc.bind('Adonis/Src/Config', () => {
  return config
})

http.get('/twitter', function * (request, response) {
  const ally = new AllyManager(request, response)
  try {
    const twitter = ally.driver('twitter')
    const url = yield twitter.getRedirectUrl()
    response.writeHead(200, {'content-type': 'text/html'})
    response.write(`<a href="${url}">Login With Twitter</a>`)
  } catch (e) {
    response.writeHead(500, {'content-type': 'application/json'})
    response.write(JSON.stringify({ error: e }))
  }
  response.end()
})

http.get('/twitter/authenticated', function * (request, response) {
  const ally = new AllyManager(request, response)
  const twitter = ally.driver('twitter')
  try {
    const user = yield twitter.getUser()
    response.writeHead(200, {'content-type': 'application/json'})
    response.write(JSON.stringify({ original: user.getOriginal(), profile: user.toJSON() }))
  } catch (e) {
    console.log(e)
    response.writeHead(500, {'content-type': 'application/json'})
    response.write(JSON.stringify({ error: e }))
  }
  response.end()
})

http.start().listen(8000)

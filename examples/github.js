'use strict'

const Ioc = require('adonis-fold').Ioc
const config = require('./setup/config')
const http = require('./setup/http')
const AllyManager = require('../src/AllyManager')
Ioc.bind('Adonis/Src/Config', () => {
  return config
})

http.get('/github', function * (request, response) {
  const ally = new AllyManager(request, response)
  const github = ally.driver('github')
  response.writeHead(200, {'content-type': 'text/html'})
  const url = yield github.getRedirectUrl()
  response.write(`<a href="${url}">Login With Github</a>`)
  response.end()
})

http.get('/github/authenticated', function * (request, response) {
  const ally = new AllyManager(request, response)
  const github = ally.driver('github')
  try {
    const user = yield github.getUser()
    response.writeHead(200, {'content-type': 'application/json'})
    response.write(JSON.stringify({ original: user.getOriginal(), profile: user.toJSON() }))
  } catch (e) {
    response.writeHead(500, {'content-type': 'application/json'})
    response.write(JSON.stringify({ error: e }))
  }
  response.end()
})

http.start().listen(8000)

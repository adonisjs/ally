'use strict'

const Ioc = require('adonis-fold').Ioc
const config = require('./setup/config')
const http = require('./setup/http')
const AllyManager = require('../src/AllyManager')
Ioc.bind('Adonis/Src/Config', () => {
  return config
})

http.get('/google', function * (request, response) {
  const ally = new AllyManager(request, response)
  const google = ally.driver('google')
  response.writeHead(200, {'content-type': 'text/html'})
  const url = yield google.getRedirectUrl()
  response.write(`<a href="${url}">Login With Google</a>`)
  response.end()
})

http.get('/google/authenticated', function * (request, response) {
  const ally = new AllyManager(request, response)
  const google = ally.driver('google')
  try {
    const user = yield google.getUser()
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

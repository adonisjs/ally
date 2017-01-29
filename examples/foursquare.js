/**
 * Created by Raphson on 1/1/17.
 */
'use strict'

const Ioc = require('adonis-fold').Ioc
const config = require('./setup/config')
const http = require('./setup/http')
const AllyManager = require('../src/AllyManager')
Ioc.bind('Adonis/Src/Config', () => {
  return config
})

http.get('/foursquare', function * (request, response) {
  const ally = new AllyManager(request, response)
  const foursquare = ally.driver('foursquare')
  response.writeHead(200, {'content-type': 'text/html'})
  const url = yield foursquare.getRedirectUrl()
  response.write(`<a href="${url}">Login With Foursquare</a>`)
  response.end()
})

http.get('/foursquare/authenticated', function * (request, response) {
  const ally = new AllyManager(request, response)
  const foursquare = ally.driver('foursquare')
  try {
    const user = yield foursquare.getUser()
    response.writeHead(200, {'content-type': 'application/json'})
    response.write(JSON.stringify({ original: user.getOriginal(), profile: user.toJSON() }))
  } catch (e) {
    response.writeHead(500, {'content-type': 'application/json'})
    response.write(JSON.stringify({ error: e }))
  }
  response.end()
})

http.start().listen(8000)

'use strict'

const { ioc } = require('@adonisjs/fold')
const config = require('./setup/config')
const http = require('./setup/http')
const AllyManager = require('../src/AllyManager')

ioc.bind('Adonis/Src/Config', () => {
  return config
})

http.get('/facebook', async function (request, response) {
  const ally = new AllyManager(request, response)
  const facebook = ally.driver('facebook')
  response.writeHead(200, {'content-type': 'text/html'})
  const url = await facebook.getRedirectUrl()
  response.write(`<a href="${url}">Login With Facebook</a>`)
  response.end()
})

http.get('/facebook/authenticated', async function (request, response) {
  const ally = new AllyManager(request, response)
  const facebook = ally.driver('facebook')
  try {
    const user = await facebook.getUser()
    response.writeHead(200, {'content-type': 'application/json'})
    response.write(JSON.stringify({ original: user.getOriginal(), profile: user.toJSON() }))
  } catch (e) {
    response.writeHead(500, {'content-type': 'application/json'})
    response.write(JSON.stringify({ error: e }))
  }
  response.end()
})

http.start().listen(8000)

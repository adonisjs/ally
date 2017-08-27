'use strict'

const { ioc } = require('@adonisjs/fold')
const config = require('./setup/config')
const http = require('./setup/http')
const Ally = require('../src/Ally')
ioc.bind('Adonis/Src/Config', () => {
  return config
})

http.get('/instagram', async function (request, response) {
  const ally = new Ally(request, response)
  const instagram = ally.driver('instagram')
  response.writeHead(200, {'content-type': 'text/html'})
  const url = await instagram.getRedirectUrl()
  response.write(`<a href="${url}">Login With Instagram</a>`)
  response.end()
})

http.get('/instagram/authenticated', async function (request, response) {
  const ally = new Ally(request, response)
  const instagram = ally.driver('instagram')
  try {
    const user = await instagram.getUser()
    response.writeHead(200, {'content-type': 'application/json'})
    response.write(JSON.stringify({ original: user.getOriginal(), profile: user.toJSON() }))
  } catch (e) {
    response.writeHead(500, {'content-type': 'application/json'})
    response.write(JSON.stringify({ error: e }))
  }
  response.end()
})

http.start().listen(8000)

'use strict'

const { ioc } = require('@adonisjs/fold')
const config = require('./setup/config')
const http = require('./setup/http')
const Ally = require('../src/Ally')
ioc.bind('Adonis/Src/Config', () => {
  return config
})

http.get('/google', async function (request, response) {
  const ally = new Ally(ioc.use('Adonis/Src/Config'), request, response)
  const google = ally.driver('google')

  if (request.input('redirect')) {
    await google.redirect()
  } else {
    response.writeHead(200, { 'content-type': 'text/html' })
    response.write(`<a href="/google?redirect=true">Login With Google</a>`)
    response.end()
  }
})

http.get('/google/authenticated', async function (request, response) {
  const ally = new Ally(ioc.use('Adonis/Src/Config'), request, response)
  const google = ally.driver('google')
  try {
    const user = await google.getUser()
    response.writeHead(200, { 'content-type': 'application/json' })
    response.write(JSON.stringify({ original: user.getOriginal(), profile: user.toJSON() }))
  } catch (e) {
    console.log(e)
    response.writeHead(500, { 'content-type': 'application/json' })
    response.write(JSON.stringify({ error: e }))
  }
  response.end()
})

http.start().listen(8000)

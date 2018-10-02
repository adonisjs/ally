'use strict'

const { ioc } = require('@adonisjs/fold')
const config = require('./setup/config')
const http = require('./setup/http')
const Ally = require('../src/Ally')
ioc.bind('Adonis/Src/Config', () => {
  return config
})

http.get('/linkedin', async function (request, response) {
  const ally = new Ally(ioc.use('Adonis/Src/Config'), request, response)
  const linkedin = ally.driver('linkedin')

  if (request.input('redirect')) {
    await linkedin.redirect()
  } else {
    response.writeHead(200, { 'content-type': 'text/html' })
    response.write(`<a href="/linkedin?redirect=true">Login With Linkedin</a>`)
    response.end()
  }
})

http.get('/linkedin/authenticated', async function (request, response) {
  const ally = new Ally(ioc.use('Adonis/Src/Config'), request, response)
  const linkedin = ally.driver('linkedin')
  try {
    const user = await linkedin.getUser()
    response.writeHead(200, { 'content-type': 'application/json' })
    response.write(JSON.stringify({ original: user.getOriginal(), profile: user.toJSON() }))
  } catch (e) {
    response.writeHead(500, { 'content-type': 'application/json' })
    response.write(JSON.stringify({ error: e }))
  }
  response.end()
})

http.start().listen(8000)

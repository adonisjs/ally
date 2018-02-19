'use strict'

const { ioc } = require('@adonisjs/fold')
const config = require('./setup/config')
const http = require('./setup/http')
const Ally = require('../src/Ally')

ioc.bind('Adonis/Src/Config', () => {
  return config
})

http.get('/naver', async function (request, response) {
  const ally = new Ally(request, response)
  const naver = ally.driver('naver')
  response.writeHead(200, {'content-type': 'text/html'})
  const url = await naver.getRedirectUrl()
  response.write(`<a href="${url}">Login With Naver</a>`)
  response.end()
})

http.get('/naver/authenticated', async function (request, response) {
  const ally = new Ally(request, response)
  const naver = ally.driver('naver')
  try {
    const user = await naver.getUser()
    response.writeHead(200, {'content-type': 'application/json'})
    response.write(JSON.stringify({ original: user.getOriginal(), profile: user.toJSON() }))
  } catch (e) {
    response.writeHead(500, {'content-type': 'application/json'})
    response.write(JSON.stringify({ error: e }))
  }
  response.end()
})

http.start().listen(8000)

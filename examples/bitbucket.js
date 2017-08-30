/**
 * Created by Raphson on 1/4/17.
 */
'use strict'

const { ioc } = require('@adonisjs/fold')
const config = require('./setup/config')
const http = require('./setup/http')
const Ally = require('../src/Ally')
ioc.bind('Adonis/Src/Config', () => {
  return config
})

http.get('/bitbucket', async function (request, response) {
  const ally = new Ally(request, response)
  const bitbucket = ally.driver('bitbucket')
  response.writeHead(200, {'content-type': 'text/html'})
  const url = await bitbucket.getRedirectUrl()
  response.write(`<a href="${url}">Login With Bit-Bucket</a>`)
  response.end()
})

http.get('/bitbucket/authenticated', async function (request, response) {
  const ally = new Ally(request, response)
  const bitbucket = ally.driver('bitbucket')
  try {
    const user = await bitbucket.getUser()
    response.writeHead(200, {'content-type': 'application/json'})
    response.write(JSON.stringify({ original: user.getOriginal(), profile: user.toJSON() }))
  } catch (e) {
    response.writeHead(500, {'content-type': 'application/json'})
    response.write(JSON.stringify({ error: e }))
  }
  response.end()
})

http.start().listen(8000)

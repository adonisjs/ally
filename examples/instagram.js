'use strict'

const Ioc = require('adonis-fold').Ioc
const config = require('./setup/config')
const http = require('./setup/http')
const AllyManager = require('../src/AllyManager')
Ioc.bind('Adonis/Src/Config', () => {
    return config
})

http.get('/instagram', function * (request, response) {
    const ally = new AllyManager(request, response)
    const instagram = ally.driver('instagram')
    response.writeHead(200, {'content-type': 'text/html'})
    const url = yield instagram.getRedirectUrl()
    response.write(`<a href="${url}">Login With Instagram</a>`)
    response.end()
})

http.get('/instagram/authenticated', function * (request, response) {
    const ally = new AllyManager(request, response)
    const instagram = ally.driver('instagram')
    try {
        const user = yield instagram.getUser();
        response.writeHead(200, {'content-type': 'application/json'});
        response.write(JSON.stringify({ original: user.getOriginal(), profile: user.toJSON() }))
    } catch (e) {
        response.writeHead(500, {'content-type': 'application/json'});
        response.write(JSON.stringify({ error: e }))
    }
    response.end()
})

http.start().listen(8000)

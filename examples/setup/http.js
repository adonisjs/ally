'use strict'

/*
 * adonis-ally
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const http = require('http')
const url = require('url')
const qs = require('querystring')
const nodeCookie = require('node-cookie')

const routes = {}

class Request {
  constructor (req) {
    this.req = req
  }

  input (key) {
    const queryString = this.get()
    return queryString[key]
  }

  cookie (key) {
    return nodeCookie.get(this.req, key)
  }

  get () {
    const parsedUrl = url.parse(this.req.url)
    return parsedUrl.search ? qs.parse(parsedUrl.search.replace('?', '')) : {}
  }
}

class Response {
  constructor (res) {
    this.res = res
  }

  cookie (key, value) {
    nodeCookie.create(this.res, key, value)
  }

  clearCookie (key) {
    nodeCookie.clear(this.res, key)
  }

  status (code) {
    this.res.statusCode = code
    return this
  }

  redirect (url) {
    this.res.setHeader('Location', url)
    this.res.end()
  }

  write (data) {
    this.res.write(data)
  }

  writeHead (status, headers) {
    this.res.writeHead(status, headers)
  }

  end (data) {
    this.res.end(data)
  }
}

const httpServer = exports = module.exports = {}

httpServer.get = function (route, closure) {
  routes[route] = closure
}

httpServer.start = function () {
  return http.createServer(function (req, res) {
    const parsedUrl = url.parse(req.url)
    if (routes[parsedUrl.pathname]) {
      return routes[parsedUrl.pathname](new Request(req), new Response(res))
    }
    res.writeHead(400)
    res.write('404 Not Found')
    res.end()
  })
}

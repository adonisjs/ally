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
const co = require('co')
const routes = {}

class Request {
  constructor (req) {
    this.req = req
  }

  input (key) {
    const queryString = this.get()
    return queryString[key]
  }

  get () {
    const parsedUrl = url.parse(this.req.url)
    return parsedUrl.search ? qs.parse(parsedUrl.search.replace('?', '')) : {}
  }

}

const httpServer = exports = module.exports = {}

httpServer.get = function (route, closure) {
  routes[route] = co.wrap(closure)
}

httpServer.start = function () {
  return http.createServer(function (req, res) {
    const parsedUrl = url.parse(req.url)
    if (routes[parsedUrl.pathname]) {
      return routes[parsedUrl.pathname](new Request(req), res)
    }
    res.writeHead(400)
    res.write('404 Not Found')
    res.end()
  })
}

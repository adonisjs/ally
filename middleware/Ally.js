'use strict'

class Ally {

  * handle (request, response, next) {
    const Ally = use('Adonis/Addons/Ally')
    request.ally = new Ally(request, response)
    yield next
  }

}

module.exports = Ally

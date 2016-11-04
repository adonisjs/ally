'use strict'

/*
 * adonis-ally
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const qs = require('querystring')
const chai = require('chai')
const drivers = require('../../src/Drivers')
const config = require('./setup/config')
const Google = drivers.google
const Facebook = drivers.facebook
const Github = drivers.github
const LinkedIn = drivers.linkedin
const assert = chai.assert

describe('Oauth Drivers', function () {
  context('Google', function () {
    it('should generate the redirect_uri with correct signature', function * () {
      const google = new Google(config)
      const redirectUrl = qs.escape(config.get().redirectUri)
      const scope = qs.escape(['openid', 'profile', 'email'].join(' '))
      const providerUrl = `https://accounts.google.com/o/oauth2/auth?redirect_uri=${redirectUrl}&scope=${scope}&response_type=code&client_id=${config.get().clientId}`
      const redirectToUrl = yield google.getRedirectUrl()
      assert.equal(redirectToUrl, providerUrl)
    })

    it('should make use of the scopes defined in the config file', function * () {
      const customConfig = {
        get: function () {
          return {
            clientId: 12,
            clientSecret: 123,
            redirectUri: 'http://localhost',
            scope: ['foo', 'bar']
          }
        }
      }
      const google = new Google(customConfig)
      const redirectUrl = qs.escape(customConfig.get().redirectUri)
      const scope = qs.escape(['foo', 'bar'].join(' '))
      const providerUrl = `https://accounts.google.com/o/oauth2/auth?redirect_uri=${redirectUrl}&scope=${scope}&response_type=code&client_id=${customConfig.get().clientId}`
      const redirectToUrl = yield google.getRedirectUrl()
      assert.equal(redirectToUrl, providerUrl)
    })

    it('should make use of the scopes passed to the generate method', function * () {
      const google = new Google(config)
      const redirectUrl = qs.escape(config.get().redirectUri)
      const scope = qs.escape(['foo'].join(' '))
      const providerUrl = `https://accounts.google.com/o/oauth2/auth?redirect_uri=${redirectUrl}&scope=${scope}&response_type=code&client_id=${config.get().clientId}`
      const redirectToUrl = yield google.getRedirectUrl(['foo'])
      assert.equal(redirectToUrl, providerUrl)
    })
  })

  context('Facebook', function () {
    it('should generate the redirect_uri with correct signature', function * () {
      const facebook = new Facebook(config)
      const redirectUrl = qs.escape(config.get().redirectUri)
      const scope = qs.escape(['email'].join(','))
      const providerUrl = `https://graph.facebook.com/v2.1/oauth/authorize?redirect_uri=${redirectUrl}&scope=${scope}&response_type=code&client_id=${config.get().clientId}`
      const redirectToUrl = yield facebook.getRedirectUrl()
      assert.equal(redirectToUrl, providerUrl)
    })

    it('should make use of the scopes defined in the config file', function * () {
      const customConfig = {
        get: function () {
          return {
            clientId: 12,
            clientSecret: 123,
            redirectUri: 'http://localhost',
            scope: ['email', 'name']
          }
        }
      }
      const facebook = new Facebook(customConfig)
      const redirectUrl = qs.escape(customConfig.get().redirectUri)
      const scope = qs.escape(['email', 'name'].join(','))
      const providerUrl = `https://graph.facebook.com/v2.1/oauth/authorize?redirect_uri=${redirectUrl}&scope=${scope}&response_type=code&client_id=${customConfig.get().clientId}`
      const redirectToUrl = yield facebook.getRedirectUrl()
      assert.equal(redirectToUrl, providerUrl)
    })

    it('should make use of the scopes passed to the generate method', function * () {
      const facebook = new Facebook(config)
      const redirectUrl = qs.escape(config.get().redirectUri)
      const scope = qs.escape(['foo'].join(','))
      const providerUrl = `https://graph.facebook.com/v2.1/oauth/authorize?redirect_uri=${redirectUrl}&scope=${scope}&response_type=code&client_id=${config.get().clientId}`
      const redirectToUrl = yield facebook.getRedirectUrl(['foo'])
      assert.equal(redirectToUrl, providerUrl)
    })
  })

  context('Github', function () {
    it('should generate the redirect_uri with correct signature', function * () {
      const github = new Github(config)
      const redirectUrl = qs.escape(config.get().redirectUri)
      const scope = qs.escape(['user'].join(' '))
      const providerUrl = `https://github.com/login/oauth/authorize?redirect_uri=${redirectUrl}&scope=${scope}&response_type=code&client_id=${config.get().clientId}`
      const redirectToUrl = yield github.getRedirectUrl()
      assert.equal(redirectToUrl, providerUrl)
    })

    it('should make use of the scopes defined in the config file', function * () {
      const customConfig = {
        get: function () {
          return {
            clientId: 12,
            clientSecret: 123,
            redirectUri: 'http://localhost',
            scope: ['email', 'name']
          }
        }
      }
      const github = new Github(customConfig)
      const redirectUrl = qs.escape(customConfig.get().redirectUri)
      const scope = qs.escape(['email', 'name'].join(' '))
      const providerUrl = `https://github.com/login/oauth/authorize?redirect_uri=${redirectUrl}&scope=${scope}&response_type=code&client_id=${customConfig.get().clientId}`
      const redirectToUrl = yield github.getRedirectUrl()
      assert.equal(redirectToUrl, providerUrl)
    })

    it('should make use of the scopes passed to the generate method', function * () {
      const github = new Github(config)
      const redirectUrl = qs.escape(config.get().redirectUri)
      const scope = qs.escape(['foo'].join(' '))
      const providerUrl = `https://github.com/login/oauth/authorize?redirect_uri=${redirectUrl}&scope=${scope}&response_type=code&client_id=${config.get().clientId}`
      const redirectToUrl = yield github.getRedirectUrl(['foo'])
      assert.equal(redirectToUrl, providerUrl)
    })
  })

  context('LinkedIn', function () {
    it('should generate the redirect_uri with correct signature', function * () {
      const linkedin = new LinkedIn(config)
      const redirectUrl = qs.escape(config.get().redirectUri)
      const scope = qs.escape(['r_basicprofile', 'r_emailaddress'].join(' '))
      const providerUrl = `https://www.linkedin.com/oauth/v2/authorization?redirect_uri=${redirectUrl}&scope=${scope}&response_type=code&client_id=${config.get().clientId}`
      const redirectToUrl = yield linkedin.getRedirectUrl()
      assert.equal(redirectToUrl, providerUrl)
    })

    it('should make use of the scopes defined in the config file', function * () {
      const customConfig = {
        get: function () {
          return {
            clientId: 12,
            clientSecret: 123,
            redirectUri: 'http://localhost',
            scope: ['email', 'name']
          }
        }
      }
      const linkedin = new LinkedIn(customConfig)
      const redirectUrl = qs.escape(customConfig.get().redirectUri)
      const scope = qs.escape(['email', 'name'].join(' '))
      const providerUrl = `https://www.linkedin.com/oauth/v2/authorization?redirect_uri=${redirectUrl}&scope=${scope}&response_type=code&client_id=${customConfig.get().clientId}`
      const redirectToUrl = yield linkedin.getRedirectUrl()
      assert.equal(redirectToUrl, providerUrl)
    })

    it('should make use of the scopes passed to the generate method', function * () {
      const linkedin = new LinkedIn(config)
      const redirectUrl = qs.escape(config.get().redirectUri)
      const scope = qs.escape(['foo'].join(' '))
      const providerUrl = `https://www.linkedin.com/oauth/v2/authorization?redirect_uri=${redirectUrl}&scope=${scope}&response_type=code&client_id=${config.get().clientId}`
      const redirectToUrl = yield linkedin.getRedirectUrl(['foo'])
      assert.equal(redirectToUrl, providerUrl)
    })
  })
})

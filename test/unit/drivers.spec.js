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
const Instagram = drivers.instagram
const Twitter = drivers.twitter
const Foursquare = drivers.foursquare
const Bitbucket = drivers.bitbucket
const assert = chai.assert
require('co-mocha')

describe('Oauth Drivers', function () {
  context('Google', function () {
    it('should throw an exception when config has not been defined', function () {
      const google = () => new Google({get: function () { return null }})
      assert.throw(google, 'OAuthException: E_MISSING_OAUTH_CONFIG: Make sure to define google configuration inside config/services.js file')
    })

    it('should throw an exception when clientid is missing', function () {
      const google = () => new Google({get: function () { return {clientSecret: '1', redirectUri: '2'} }})
      assert.throw(google, 'OAuthException: E_MISSING_OAUTH_CONFIG: Make sure to define google configuration inside config/services.js file')
    })

    it('should throw an exception when clientSecret is missing', function () {
      const google = () => new Google({get: function () { return {clientId: '1', redirectUri: '2'} }})
      assert.throw(google, 'OAuthException: E_MISSING_OAUTH_CONFIG: Make sure to define google configuration inside config/services.js file')
    })

    it('should throw an exception when redirectUri is missing', function () {
      const google = () => new Google({get: function () { return {clientId: '1', clientSecret: '2'} }})
      assert.throw(google, 'OAuthException: E_MISSING_OAUTH_CONFIG: Make sure to define google configuration inside config/services.js file')
    })

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
    it('should throw an exception when config has not been defined', function () {
      const facebook = () => new Facebook({get: function () { return null }})
      assert.throw(facebook, 'OAuthException: E_MISSING_OAUTH_CONFIG: Make sure to define facebook configuration inside config/services.js file')
    })

    it('should throw an exception when clientid is missing', function () {
      const facebook = () => new Facebook({get: function () { return {clientSecret: '1', redirectUri: '2'} }})
      assert.throw(facebook, 'OAuthException: E_MISSING_OAUTH_CONFIG: Make sure to define facebook configuration inside config/services.js file')
    })

    it('should throw an exception when clientSecret is missing', function () {
      const facebook = () => new Facebook({get: function () { return {clientId: '1', redirectUri: '2'} }})
      assert.throw(facebook, 'OAuthException: E_MISSING_OAUTH_CONFIG: Make sure to define facebook configuration inside config/services.js file')
    })

    it('should throw an exception when redirectUri is missing', function () {
      const facebook = () => new Facebook({get: function () { return {clientId: '1', clientSecret: '2'} }})
      assert.throw(facebook, 'OAuthException: E_MISSING_OAUTH_CONFIG: Make sure to define facebook configuration inside config/services.js file')
    })

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
    it('should throw an exception when config has not been defined', function () {
      const github = () => new Github({get: function () { return null }})
      assert.throw(github, 'OAuthException: E_MISSING_OAUTH_CONFIG: Make sure to define github configuration inside config/services.js file')
    })

    it('should throw an exception when clientid is missing', function () {
      const github = () => new Github({get: function () { return {clientSecret: '1', redirectUri: '2'} }})
      assert.throw(github, 'OAuthException: E_MISSING_OAUTH_CONFIG: Make sure to define github configuration inside config/services.js file')
    })

    it('should throw an exception when clientSecret is missing', function () {
      const github = () => new Github({get: function () { return {clientId: '1', redirectUri: '2'} }})
      assert.throw(github, 'OAuthException: E_MISSING_OAUTH_CONFIG: Make sure to define github configuration inside config/services.js file')
    })

    it('should throw an exception when redirectUri is missing', function () {
      const github = () => new Github({get: function () { return {clientId: '1', clientSecret: '2'} }})
      assert.throw(github, 'OAuthException: E_MISSING_OAUTH_CONFIG: Make sure to define github configuration inside config/services.js file')
    })

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
    it('should throw an exception when config has not been defined', function () {
      const linkedin = () => new LinkedIn({get: function () { return null }})
      assert.throw(linkedin, 'OAuthException: E_MISSING_OAUTH_CONFIG: Make sure to define linkedin configuration inside config/services.js file')
    })

    it('should throw an exception when clientid is missing', function () {
      const linkedin = () => new LinkedIn({get: function () { return {clientSecret: '1', redirectUri: '2'} }})
      assert.throw(linkedin, 'OAuthException: E_MISSING_OAUTH_CONFIG: Make sure to define linkedin configuration inside config/services.js file')
    })

    it('should throw an exception when clientSecret is missing', function () {
      const linkedin = () => new LinkedIn({get: function () { return {clientId: '1', redirectUri: '2'} }})
      assert.throw(linkedin, 'OAuthException: E_MISSING_OAUTH_CONFIG: Make sure to define linkedin configuration inside config/services.js file')
    })

    it('should throw an exception when redirectUri is missing', function () {
      const linkedin = () => new LinkedIn({get: function () { return {clientId: '1', clientSecret: '2'} }})
      assert.throw(linkedin, 'OAuthException: E_MISSING_OAUTH_CONFIG: Make sure to define linkedin configuration inside config/services.js file')
    })

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

  context('Instagram', function () {
    it('should throw an exception when config has not been defined', function () {
      const instagram = () => new Instagram({get: function () { return null }})
      assert.throw(instagram, 'OAuthException: E_MISSING_OAUTH_CONFIG: Make sure to define instagram configuration inside config/services.js file')
    })

    it('should throw an exception when clientid is missing', function () {
      const instagram = () => new Instagram({get: function () { return {clientSecret: '1', redirectUri: '2'} }})
      assert.throw(instagram, 'OAuthException: E_MISSING_OAUTH_CONFIG: Make sure to define instagram configuration inside config/services.js file')
    })

    it('should throw an exception when clientSecret is missing', function () {
      const instagram = () => new Instagram({get: function () { return {clientId: '1', redirectUri: '2'} }})
      assert.throw(instagram, 'OAuthException: E_MISSING_OAUTH_CONFIG: Make sure to define instagram configuration inside config/services.js file')
    })

    it('should throw an exception when redirectUri is missing', function () {
      const instagram = () => new Instagram({get: function () { return {clientId: '1', clientSecret: '2'} }})
      assert.throw(instagram, 'OAuthException: E_MISSING_OAUTH_CONFIG: Make sure to define instagram configuration inside config/services.js file')
    })

    it('should generate the redirect_uri with correct signature', function * () {
      const instagram = new Instagram(config)
      const redirectUrl = qs.escape(config.get().redirectUri)
      const scope = qs.escape(['basic'].join(' '))
      const providerUrl = `https://api.instagram.com/oauth/authorize?redirect_uri=${redirectUrl}&scope=${scope}&response_type=code&client_id=${config.get().clientId}`
      const redirectToUrl = yield instagram.getRedirectUrl()
      assert.equal(redirectToUrl, providerUrl)
    })

    it('should make use of the scopes defined in the config file', function * () {
      const customConfig = {
        get: function () {
          return {
            clientId: 12,
            clientSecret: 123,
            redirectUri: 'http://localhost',
            scope: ['basic']
          }
        }
      }
      const instagram = new Instagram(customConfig)
      const redirectUrl = qs.escape(customConfig.get().redirectUri)
      const scope = qs.escape(['basic'].join(' '))
      const providerUrl = `https://api.instagram.com/oauth/authorize?redirect_uri=${redirectUrl}&scope=${scope}&response_type=code&client_id=${customConfig.get().clientId}`
      const redirectToUrl = yield instagram.getRedirectUrl()
      assert.equal(redirectToUrl, providerUrl)
    })

    it('should make use of the scopes passed to the generate method', function * () {
      const instagram = new Instagram(config)
      const redirectUrl = qs.escape(config.get().redirectUri)
      const scope = qs.escape(['basic'].join(' '))
      const providerUrl = `https://api.instagram.com/oauth/authorize?redirect_uri=${redirectUrl}&scope=${scope}&response_type=code&client_id=${config.get().clientId}`
      const redirectToUrl = yield instagram.getRedirectUrl(['basic'])
      assert.equal(redirectToUrl, providerUrl)
    })
  })

  context('Twitter', function () {
    it('should throw an exception when config has not been defined', function () {
      const twitter = () => new Twitter({get: function () { return null }})
      assert.throw(twitter, 'OAuthException: E_MISSING_OAUTH_CONFIG: Make sure to define twitter configuration inside config/services.js file')
    })

    it('should throw an exception when clientid is missing', function () {
      const twitter = () => new Twitter({get: function () { return {clientSecret: '1', redirectUri: '2'} }})
      assert.throw(twitter, 'OAuthException: E_MISSING_OAUTH_CONFIG: Make sure to define twitter configuration inside config/services.js file')
    })

    it('should throw an exception when clientSecret is missing', function () {
      const twitter = () => new Twitter({get: function () { return {clientId: '1', redirectUri: '2'} }})
      assert.throw(twitter, 'OAuthException: E_MISSING_OAUTH_CONFIG: Make sure to define twitter configuration inside config/services.js file')
    })

    it('should throw an exception when redirectUri is missing', function () {
      const twitter = () => new Twitter({get: function () { return {clientId: '1', clientSecret: '2'} }})
      assert.throw(twitter, 'OAuthException: E_MISSING_OAUTH_CONFIG: Make sure to define twitter configuration inside config/services.js file')
    })
  })

  context('Foursquare', function () {
    it('should throw an exception when config has not been defined', function () {
      const foursquare = () => new Foursquare({get: function () { return null }})
      assert.throw(foursquare, 'OAuthException: E_MISSING_OAUTH_CONFIG: Make sure to define foursquare configuration inside config/services.js file')
    })

    it('should throw an exception when clientid is missing', function () {
      const foursquare = () => new Foursquare({get: function () { return {clientSecret: '1', redirectUri: '2'} }})
      assert.throw(foursquare, 'OAuthException: E_MISSING_OAUTH_CONFIG: Make sure to define foursquare configuration inside config/services.js file')
    })

    it('should throw an exception when clientSecret is missing', function () {
      const foursquare = () => new Foursquare({get: function () { return {clientId: '1', redirectUri: '2'} }})
      assert.throw(foursquare, 'OAuthException: E_MISSING_OAUTH_CONFIG: Make sure to define foursquare configuration inside config/services.js file')
    })

    it('should throw an exception when redirectUri is missing', function () {
      const foursquare = () => new Foursquare({get: function () { return {clientId: '1', clientSecret: '2'} }})
      assert.throw(foursquare, 'OAuthException: E_MISSING_OAUTH_CONFIG: Make sure to define foursquare configuration inside config/services.js file')
    })

    it('should generate the redirect_uri with correct signature', function * () {
      const foursquare = new Foursquare(config)
      const redirectUrl = qs.escape(config.get().redirectUri)
      const providerUrl = `https://foursquare.com/oauth2/authenticate?redirect_uri=${redirectUrl}&response_type=code&client_id=${config.get().clientId}`
      const redirectToUrl = yield foursquare.getRedirectUrl()
      assert.equal(redirectToUrl, providerUrl)
    })

    it('should make use of the scopes defined in the config file', function * () {
      const customConfig = {
        get: function () {
          return {
            clientId: 12,
            clientSecret: 123,
            redirectUri: 'http://localhost',
            scope: ['basic']
          }
        }
      }
      const foursquare = new Foursquare(customConfig)
      const redirectUrl = qs.escape(customConfig.get().redirectUri)
      const providerUrl = `https://foursquare.com/oauth2/authenticate?redirect_uri=${redirectUrl}&response_type=code&client_id=${customConfig.get().clientId}`
      const redirectToUrl = yield foursquare.getRedirectUrl()
      assert.equal(redirectToUrl, providerUrl)
    })

    it('should make use of the scopes passed to the generate method', function * () {
      const foursquare = new Foursquare(config)
      const redirectUrl = qs.escape(config.get().redirectUri)
      const providerUrl = `https://foursquare.com/oauth2/authenticate?redirect_uri=${redirectUrl}&response_type=code&client_id=${config.get().clientId}`
      const redirectToUrl = yield foursquare.getRedirectUrl(['basic'])
      assert.equal(redirectToUrl, providerUrl)
    })
  })

  context('Bitbucket', function () {
    it('should throw an exception when config has not been defined', function () {
      const bitbucket = () => new Bitbucket({get: function () { return null }})
      assert.throw(bitbucket, 'OAuthException: E_MISSING_OAUTH_CONFIG: Make sure to define bitbucket configuration inside config/services.js file')
    })

    it('should throw an exception when clientid is missing', function () {
      const bitbucket = () => new Bitbucket({get: function () { return {clientSecret: '1', redirectUri: '2'} }})
      assert.throw(bitbucket, 'OAuthException: E_MISSING_OAUTH_CONFIG: Make sure to define bitbucket configuration inside config/services.js file')
    })

    it('should throw an exception when clientSecret is missing', function () {
      const bitbucket = () => new Bitbucket({get: function () { return {clientId: '1', redirectUri: '2'} }})
      assert.throw(bitbucket, 'OAuthException: E_MISSING_OAUTH_CONFIG: Make sure to define bitbucket configuration inside config/services.js file')
    })

    it('should throw an exception when redirectUri is missing', function () {
      const bitbucket = () => new Bitbucket({get: function () { return {clientId: '1', clientSecret: '2'} }})
      assert.throw(bitbucket, 'OAuthException: E_MISSING_OAUTH_CONFIG: Make sure to define bitbucket configuration inside config/services.js file')
    })

    it('should generate the redirect_uri with correct signature', function * () {
      const bitbucket = new Bitbucket(config)
      const redirectUrl = qs.escape(config.get().redirectUri)
      const scope = qs.escape(['account', 'email'].join(' '))
      const providerUrl = `https://bitbucket.org/site/oauth2/authorize?redirect_uri=${redirectUrl}&scope=${scope}&response_type=code&client_id=${config.get().clientId}`
      const redirectToUrl = yield bitbucket.getRedirectUrl()
      assert.equal(redirectToUrl, providerUrl)
    })
  })
})

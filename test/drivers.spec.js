'use strict'

/*
 * adonis-ally
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const test = require('japa')
const qs = require('querystring')
const drivers = require('../../src/Drivers')
const config = require('./setup/config')
const Google = drivers.google
const Facebook = drivers.facebook
const Github = drivers.github
const LinkedIn = drivers.linkedin
const Instagram = drivers.instagram
const Twitter = drivers.twitter
const Foursquare = drivers.foursquare

test.group('Oauth Drivers | Google', function () {
  test('should throw an exception when config has not been defined', function (assert) {
    const google = () => new Google({get: function () { return null }})
    assert.throw(google, 'OAuthException: E_MISSING_OAUTH_CONFIG: Make sure to define google configuration inside config/services.js file')
  })

  test('should throw an exception when clientid is missing', function (assert) {
    const google = () => new Google({get: function () { return {clientSecret: '1', redirectUri: '2'} }})
    assert.throw(google, 'OAuthException: E_MISSING_OAUTH_CONFIG: Make sure to define google configuration inside config/services.js file')
  })

  test('should throw an exception when clientSecret is missing', function (assert) {
    const google = () => new Google({get: function () { return {clientId: '1', redirectUri: '2'} }})
    assert.throw(google, 'OAuthException: E_MISSING_OAUTH_CONFIG: Make sure to define google configuration inside config/services.js file')
  })

  test('should throw an exception when redirectUri is missing', function (assert) {
    const google = () => new Google({get: function () { return {clientId: '1', clientSecret: '2'} }})
    assert.throw(google, 'OAuthException: E_MISSING_OAUTH_CONFIG: Make sure to define google configuration inside config/services.js file')
  })

  test('should generate the redirect_uri with correct signature', async function (assert) {
    const google = new Google(config)
    const redirectUrl = qs.escape(config.get().redirectUri)
    const scope = qs.escape(['openid', 'profile', 'email'].join(' '))
    const providerUrl = `https://accounts.google.com/o/oauth2/auth?redirect_uri=${redirectUrl}&scope=${scope}&response_type=code&client_id=${config.get().clientId}`
    const redirectToUrl = await google.getRedirectUrl()
    assert.equal(redirectToUrl, providerUrl)
  })

  test('should make use of the scopes defined in the config file', async function (assert) {
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
    const redirectToUrl = await google.getRedirectUrl()
    assert.equal(redirectToUrl, providerUrl)
  })

  test('should make use of the scopes passed to the generate method', async function (assert) {
    const google = new Google(config)
    const redirectUrl = qs.escape(config.get().redirectUri)
    const scope = qs.escape(['foo'].join(' '))
    const providerUrl = `https://accounts.google.com/o/oauth2/auth?redirect_uri=${redirectUrl}&scope=${scope}&response_type=code&client_id=${config.get().clientId}`
    const redirectToUrl = await google.getRedirectUrl(['foo'])
    assert.equal(redirectToUrl, providerUrl)
  })
})

test.group('Oauth Drivers | Facebook', function () {
  test('should throw an exception when config has not been defined', function (assert) {
    const facebook = () => new Facebook({get: function () { return null }})
    assert.throw(facebook, 'OAuthException: E_MISSING_OAUTH_CONFIG: Make sure to define facebook configuration inside config/services.js file')
  })

  test('should throw an exception when clientid is missing', function (assert) {
    const facebook = () => new Facebook({get: function () { return {clientSecret: '1', redirectUri: '2'} }})
    assert.throw(facebook, 'OAuthException: E_MISSING_OAUTH_CONFIG: Make sure to define facebook configuration inside config/services.js file')
  })

  test('should throw an exception when clientSecret is missing', function (assert) {
    const facebook = () => new Facebook({get: function () { return {clientId: '1', redirectUri: '2'} }})
    assert.throw(facebook, 'OAuthException: E_MISSING_OAUTH_CONFIG: Make sure to define facebook configuration inside config/services.js file')
  })

  test('should throw an exception when redirectUri is missing', function (assert) {
    const facebook = () => new Facebook({get: function () { return {clientId: '1', clientSecret: '2'} }})
    assert.throw(facebook, 'OAuthException: E_MISSING_OAUTH_CONFIG: Make sure to define facebook configuration inside config/services.js file')
  })

  test('should generate the redirect_uri with correct signature', async function (assert) {
    const facebook = new Facebook(config)
    const redirectUrl = qs.escape(config.get().redirectUri)
    const scope = qs.escape(['email'].join(','))
    const providerUrl = `https://graph.facebook.com/v2.1/oauth/authorize?redirect_uri=${redirectUrl}&scope=${scope}&response_type=code&client_id=${config.get().clientId}`
    const redirectToUrl = await facebook.getRedirectUrl()
    assert.equal(redirectToUrl, providerUrl)
  })

  test('should make use of the scopes defined in the config file', async function (assert) {
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
    const redirectToUrl = await facebook.getRedirectUrl()
    assert.equal(redirectToUrl, providerUrl)
  })

  test('should make use of the scopes passed to the generate method', async function (assert) {
    const facebook = new Facebook(config)
    const redirectUrl = qs.escape(config.get().redirectUri)
    const scope = qs.escape(['foo'].join(','))
    const providerUrl = `https://graph.facebook.com/v2.1/oauth/authorize?redirect_uri=${redirectUrl}&scope=${scope}&response_type=code&client_id=${config.get().clientId}`
    const redirectToUrl = await facebook.getRedirectUrl(['foo'])
    assert.equal(redirectToUrl, providerUrl)
  })
})

test.group('Oauth Drivers | Github', function () {
  test('should throw an exception when config has not been defined', function (assert) {
    const github = () => new Github({get: function () { return null }})
    assert.throw(github, 'OAuthException: E_MISSING_OAUTH_CONFIG: Make sure to define github configuration inside config/services.js file')
  })

  test('should throw an exception when clientid is missing', function (assert) {
    const github = () => new Github({get: function () { return {clientSecret: '1', redirectUri: '2'} }})
    assert.throw(github, 'OAuthException: E_MISSING_OAUTH_CONFIG: Make sure to define github configuration inside config/services.js file')
  })

  test('should throw an exception when clientSecret is missing', function (assert) {
    const github = () => new Github({get: function () { return {clientId: '1', redirectUri: '2'} }})
    assert.throw(github, 'OAuthException: E_MISSING_OAUTH_CONFIG: Make sure to define github configuration inside config/services.js file')
  })

  test('should throw an exception when redirectUri is missing', function (assert) {
    const github = () => new Github({get: function () { return {clientId: '1', clientSecret: '2'} }})
    assert.throw(github, 'OAuthException: E_MISSING_OAUTH_CONFIG: Make sure to define github configuration inside config/services.js file')
  })

  test('should generate the redirect_uri with correct signature', async function (assert) {
    const github = new Github(config)
    const redirectUrl = qs.escape(config.get().redirectUri)
    const scope = qs.escape(['user'].join(' '))
    const providerUrl = `https://github.com/login/oauth/authorize?redirect_uri=${redirectUrl}&scope=${scope}&response_type=code&client_id=${config.get().clientId}`
    const redirectToUrl = await github.getRedirectUrl()
    assert.equal(redirectToUrl, providerUrl)
  })

  test('should make use of the scopes defined in the config file', async function (assert) {
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
    const redirectToUrl = await github.getRedirectUrl()
    assert.equal(redirectToUrl, providerUrl)
  })

  test('should make use of the scopes passed to the generate method', async function (assert) {
    const github = new Github(config)
    const redirectUrl = qs.escape(config.get().redirectUri)
    const scope = qs.escape(['foo'].join(' '))
    const providerUrl = `https://github.com/login/oauth/authorize?redirect_uri=${redirectUrl}&scope=${scope}&response_type=code&client_id=${config.get().clientId}`
    const redirectToUrl = await github.getRedirectUrl(['foo'])
    assert.equal(redirectToUrl, providerUrl)
  })
})

test.group('Oauth Drivers | LinkedIn', function () {
  test('should throw an exception when config has not been defined', function (assert) {
    const linkedin = () => new LinkedIn({get: function () { return null }})
    assert.throw(linkedin, 'OAuthException: E_MISSING_OAUTH_CONFIG: Make sure to define linkedin configuration inside config/services.js file')
  })

  test('should throw an exception when clientid is missing', function (assert) {
    const linkedin = () => new LinkedIn({get: function () { return {clientSecret: '1', redirectUri: '2'} }})
    assert.throw(linkedin, 'OAuthException: E_MISSING_OAUTH_CONFIG: Make sure to define linkedin configuration inside config/services.js file')
  })

  test('should throw an exception when clientSecret is missing', function (assert) {
    const linkedin = () => new LinkedIn({get: function () { return {clientId: '1', redirectUri: '2'} }})
    assert.throw(linkedin, 'OAuthException: E_MISSING_OAUTH_CONFIG: Make sure to define linkedin configuration inside config/services.js file')
  })

  test('should throw an exception when redirectUri is missing', function (assert) {
    const linkedin = () => new LinkedIn({get: function () { return {clientId: '1', clientSecret: '2'} }})
    assert.throw(linkedin, 'OAuthException: E_MISSING_OAUTH_CONFIG: Make sure to define linkedin configuration inside config/services.js file')
  })

  test('should generate the redirect_uri with correct signature', async function (assert) {
    const linkedin = new LinkedIn(config)
    const redirectUrl = qs.escape(config.get().redirectUri)
    const scope = qs.escape(['r_basicprofile', 'r_emailaddress'].join(' '))
    const providerUrl = `https://www.linkedin.com/oauth/v2/authorization?redirect_uri=${redirectUrl}&scope=${scope}&response_type=code&client_id=${config.get().clientId}`
    const redirectToUrl = await linkedin.getRedirectUrl()
    assert.equal(redirectToUrl, providerUrl)
  })

  test('should make use of the scopes defined in the config file', async function (assert) {
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
    const redirectToUrl = await linkedin.getRedirectUrl()
    assert.equal(redirectToUrl, providerUrl)
  })

  test('should make use of the scopes passed to the generate method', async function (assert) {
    const linkedin = new LinkedIn(config)
    const redirectUrl = qs.escape(config.get().redirectUri)
    const scope = qs.escape(['foo'].join(' '))
    const providerUrl = `https://www.linkedin.com/oauth/v2/authorization?redirect_uri=${redirectUrl}&scope=${scope}&response_type=code&client_id=${config.get().clientId}`
    const redirectToUrl = await linkedin.getRedirectUrl(['foo'])
    assert.equal(redirectToUrl, providerUrl)
  })
})

test.group('Oauth Drivers | Instagram', function () {
  test('should throw an exception when config has not been defined', function (assert) {
    const instagram = () => new Instagram({get: function () { return null }})
    assert.throw(instagram, 'OAuthException: E_MISSING_OAUTH_CONFIG: Make sure to define instagram configuration inside config/services.js file')
  })

  test('should throw an exception when clientid is missing', function (assert) {
    const instagram = () => new Instagram({get: function () { return {clientSecret: '1', redirectUri: '2'} }})
    assert.throw(instagram, 'OAuthException: E_MISSING_OAUTH_CONFIG: Make sure to define instagram configuration inside config/services.js file')
  })

  test('should throw an exception when clientSecret is missing', function (assert) {
    const instagram = () => new Instagram({get: function () { return {clientId: '1', redirectUri: '2'} }})
    assert.throw(instagram, 'OAuthException: E_MISSING_OAUTH_CONFIG: Make sure to define instagram configuration inside config/services.js file')
  })

  test('should throw an exception when redirectUri is missing', function (assert) {
    const instagram = () => new Instagram({get: function () { return {clientId: '1', clientSecret: '2'} }})
    assert.throw(instagram, 'OAuthException: E_MISSING_OAUTH_CONFIG: Make sure to define instagram configuration inside config/services.js file')
  })

  test('should generate the redirect_uri with correct signature', async function (assert) {
    const instagram = new Instagram(config)
    const redirectUrl = qs.escape(config.get().redirectUri)
    const scope = qs.escape(['basic'].join(' '))
    const providerUrl = `https://api.instagram.com/oauth/authorize?redirect_uri=${redirectUrl}&scope=${scope}&response_type=code&client_id=${config.get().clientId}`
    const redirectToUrl = await instagram.getRedirectUrl()
    assert.equal(redirectToUrl, providerUrl)
  })

  test('should make use of the scopes defined in the config file', async function (assert) {
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
    const redirectToUrl = await instagram.getRedirectUrl()
    assert.equal(redirectToUrl, providerUrl)
  })

  test('should make use of the scopes passed to the generate method', async function (assert) {
    const instagram = new Instagram(config)
    const redirectUrl = qs.escape(config.get().redirectUri)
    const scope = qs.escape(['basic'].join(' '))
    const providerUrl = `https://api.instagram.com/oauth/authorize?redirect_uri=${redirectUrl}&scope=${scope}&response_type=code&client_id=${config.get().clientId}`
    const redirectToUrl = await instagram.getRedirectUrl(['basic'])
    assert.equal(redirectToUrl, providerUrl)
  })
})

test.group('Oauth Drivers | Twitter', function () {
  test('should throw an exception when config has not been defined', function (assert) {
    const twitter = () => new Twitter({get: function () { return null }})
    assert.throw(twitter, 'OAuthException: E_MISSING_OAUTH_CONFIG: Make sure to define twitter configuration inside config/services.js file')
  })

  test('should throw an exception when clientid is missing', function (assert) {
    const twitter = () => new Twitter({get: function () { return {clientSecret: '1', redirectUri: '2'} }})
    assert.throw(twitter, 'OAuthException: E_MISSING_OAUTH_CONFIG: Make sure to define twitter configuration inside config/services.js file')
  })

  test('should throw an exception when clientSecret is missing', function (assert) {
    const twitter = () => new Twitter({get: function () { return {clientId: '1', redirectUri: '2'} }})
    assert.throw(twitter, 'OAuthException: E_MISSING_OAUTH_CONFIG: Make sure to define twitter configuration inside config/services.js file')
  })

  test('should throw an exception when redirectUri is missing', function (assert) {
    const twitter = () => new Twitter({get: function () { return {clientId: '1', clientSecret: '2'} }})
    assert.throw(twitter, 'OAuthException: E_MISSING_OAUTH_CONFIG: Make sure to define twitter configuration inside config/services.js file')
  })
})

test.group('Foursquare', function () {
  test('should throw an exception when config has not been defined', function (assert) {
    const foursquare = () => new Foursquare({get: function () { return null }})
    assert.throw(foursquare, 'OAuthException: E_MISSING_OAUTH_CONFIG: Make sure to define foursquare configuration inside config/services.js file')
  })

  test('should throw an exception when clientid is missing', function (assert) {
    const foursquare = () => new Foursquare({get: function () { return {clientSecret: '1', redirectUri: '2'} }})
    assert.throw(foursquare, 'OAuthException: E_MISSING_OAUTH_CONFIG: Make sure to define foursquare configuration inside config/services.js file')
  })

  test('should throw an exception when clientSecret is missing', function (assert) {
    const foursquare = () => new Foursquare({get: function () { return {clientId: '1', redirectUri: '2'} }})
    assert.throw(foursquare, 'OAuthException: E_MISSING_OAUTH_CONFIG: Make sure to define foursquare configuration inside config/services.js file')
  })

  test('should throw an exception when redirectUri is missing', function (assert) {
    const foursquare = () => new Foursquare({get: function () { return {clientId: '1', clientSecret: '2'} }})
    assert.throw(foursquare, 'OAuthException: E_MISSING_OAUTH_CONFIG: Make sure to define foursquare configuration inside config/services.js file')
  })

  test('should generate the redirect_uri with correct signature', async function (assert) {
    const foursquare = new Foursquare(config)
    const redirectUrl = qs.escape(config.get().redirectUri)
    const providerUrl = `https://foursquare.com/oauth2/authenticate?redirect_uri=${redirectUrl}&response_type=code&client_id=${config.get().clientId}`
    const redirectToUrl = await foursquare.getRedirectUrl()
    assert.equal(redirectToUrl, providerUrl)
  })

  test('should make use of the scopes defined in the config file', async function (assert) {
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
    const redirectToUrl = await foursquare.getRedirectUrl()
    assert.equal(redirectToUrl, providerUrl)
  })

  test('should make use of the scopes passed to the generate method', async function (assert) {
    const foursquare = new Foursquare(config)
    const redirectUrl = qs.escape(config.get().redirectUri)
    const providerUrl = `https://foursquare.com/oauth2/authenticate?redirect_uri=${redirectUrl}&response_type=code&client_id=${config.get().clientId}`
    const redirectToUrl = await foursquare.getRedirectUrl(['basic'])
    assert.equal(redirectToUrl, providerUrl)
  })
})

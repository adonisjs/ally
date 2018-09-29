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
const drivers = require('../src/Drivers')
const config = require('./setup/config')
const Google = drivers.google
const Facebook = drivers.facebook
const Github = drivers.github
const LinkedIn = drivers.linkedin
const Instagram = drivers.instagram
const Twitter = drivers.twitter
const Foursquare = drivers.foursquare

test.group('Oauth Drivers | Google', function () {
  test('should throw an exception when config has not been defined', (assert) => {
    const google = () => new Google({ get: function () { return null } })
    assert.throw(google, 'E_MISSING_CONFIG: google is not defined inside config/services.js file')
  })

  test('should throw an exception when clientid is missing', (assert) => {
    const google = () => new Google({ get: function () { return { clientSecret: '1', redirectUri: '2' } } })
    assert.throw(google, 'E_MISSING_CONFIG: google is not defined inside config/services.js file')
  })

  test('should throw an exception when clientSecret is missing', (assert) => {
    const google = () => new Google({ get: function () { return { clientId: '1', redirectUri: '2' } } })
    assert.throw(google, 'E_MISSING_CONFIG: google is not defined inside config/services.js file')
  })

  test('should throw an exception when redirectUri is missing', (assert) => {
    const google = () => new Google({ get: function () { return { clientId: '1', clientSecret: '2' } } })
    assert.throw(google, 'E_MISSING_CONFIG: google is not defined inside config/services.js file')
  })

  test('should generate the redirect_uri with correct signature', async (assert) => {
    const google = new Google(config)
    const redirectUrl = qs.escape(config.get().redirectUri)
    const scope = qs.escape(['openid', 'profile', 'email'].join(' '))
    const providerUrl = `https://accounts.google.com/o/oauth2/auth?redirect_uri=${redirectUrl}&scope=${scope}&response_type=code&client_id=${config.get().clientId}`
    const redirectToUrl = await google.getRedirectUrl()
    assert.equal(redirectToUrl, providerUrl)
  })

  test('should make use of the scopes defined in the config file', async (assert) => {
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

  test('should make use of the scopes defined on instance later', async (assert) => {
    const google = new Google(config)
    const redirectUrl = qs.escape(config.get().redirectUri)
    const scope = qs.escape(['foo'].join(' '))
    const providerUrl = `https://accounts.google.com/o/oauth2/auth?redirect_uri=${redirectUrl}&scope=${scope}&response_type=code&client_id=${config.get().clientId}`

    google.scope = ['foo']
    const redirectToUrl = await google.getRedirectUrl()
    assert.equal(redirectToUrl, providerUrl)
  })

  test('should set expires_in to null if not provided', async (assert) => {
    const google = new Google(config)

    // Mock getAccessToken
    google.getAccessToken = () => ({})

    // Mock _getUserProfile
    google._getUserProfile = () => ({})

    const user = await google.getUser({ code: '12345' })

    assert.equal(user.getExpires(), null)
  })

  test('should correctly parse a valid expires_in', async (assert) => {
    const google = new Google(config)

    // Mock getAccessToken
    google.getAccessToken = () => ({ result: { expires_in: '12345' } })

    // Mock _getUserProfile
    google._getUserProfile = () => ({})

    const user = await google.getUser({ code: '12345' })

    assert.equal(user.getExpires(), 12345)
  })

  test('pass state when exists', async (assert) => {
    const google = new Google(config)
    const redirectUrl = qs.escape(config.get().redirectUri)
    const scope = qs.escape(['openid', 'profile', 'email'].join(' '))
    const state = '1234'

    const providerUrl = `https://accounts.google.com/o/oauth2/auth?redirect_uri=${redirectUrl}&scope=${scope}&response_type=code&state=${state}&client_id=${config.get().clientId}`

    const redirectToUrl = await google.getRedirectUrl(state)
    assert.equal(redirectToUrl, providerUrl)
  })

  test('return error when state exists and original state is missing', async (assert) => {
    const google = new Google(config)
    assert.plan(1)

    try {
      await google.getUser({ code: 1, state: '1234' })
    } catch (error) {
      assert.equal(error.message, 'E_OAUTH_STATE_MISMATCH: Oauth state mis-match')
    }
  })

  test('return error when state exists and original state is different', async (assert) => {
    const google = new Google(config)
    assert.plan(1)

    try {
      await google.getUser({ code: 1, state: '1234' }, '123')
    } catch (error) {
      assert.equal(error.message, 'E_OAUTH_STATE_MISMATCH: Oauth state mis-match')
    }
  })

  test('work fine when state and original state are same', async (assert) => {
    const google = new Google(config)
    assert.plan(1)

    google.getAccessToken = function () {
      return { accessToken: null }
    }
    google._getUserProfile = function () {}
    google._buildAllyUser = function () {
      return 'fakeuser'
    }

    const user = await google.getUser({ code: 1, state: '1234' }, '1234')
    assert.equal(user, 'fakeuser')
  })
})

test.group('Oauth Drivers | Facebook', function () {
  test('should throw an exception when config has not been defined', (assert) => {
    const facebook = () => new Facebook({ get: function () { return null } })
    assert.throw(facebook, 'E_MISSING_CONFIG: facebook is not defined inside config/services.js file')
  })

  test('should throw an exception when clientid is missing', (assert) => {
    const facebook = () => new Facebook({ get: function () { return { clientSecret: '1', redirectUri: '2' } } })
    assert.throw(facebook, 'E_MISSING_CONFIG: facebook is not defined inside config/services.js file')
  })

  test('should throw an exception when clientSecret is missing', (assert) => {
    const facebook = () => new Facebook({ get: function () { return { clientId: '1', redirectUri: '2' } } })
    assert.throw(facebook, 'E_MISSING_CONFIG: facebook is not defined inside config/services.js file')
  })

  test('should throw an exception when redirectUri is missing', (assert) => {
    const facebook = () => new Facebook({ get: function () { return { clientId: '1', clientSecret: '2' } } })
    assert.throw(facebook, 'E_MISSING_CONFIG: facebook is not defined inside config/services.js file')
  })

  test('should generate the redirect_uri with correct signature', async (assert) => {
    const facebook = new Facebook(config)
    const redirectUrl = qs.escape(config.get().redirectUri)
    const scope = qs.escape(['email'].join(','))
    const providerUrl = `https://graph.facebook.com/v2.1/oauth/authorize?redirect_uri=${redirectUrl}&scope=${scope}&response_type=code&client_id=${config.get().clientId}`
    const redirectToUrl = await facebook.getRedirectUrl()
    assert.equal(redirectToUrl, providerUrl)
  })

  test('should make use of the scopes defined in the config file', async (assert) => {
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

  test('should make use of the scopes defined on the instance', async (assert) => {
    const facebook = new Facebook(config)
    const redirectUrl = qs.escape(config.get().redirectUri)
    const scope = qs.escape(['foo'].join(','))
    const providerUrl = `https://graph.facebook.com/v2.1/oauth/authorize?redirect_uri=${redirectUrl}&scope=${scope}&response_type=code&client_id=${config.get().clientId}`

    facebook.scope = ['foo']
    const redirectToUrl = await facebook.getRedirectUrl()
    assert.equal(redirectToUrl, providerUrl)
  })

  test('should set expires_in to null if not provided', async (assert) => {
    const facebook = new Facebook(config)

    // Mock getAccessToken
    facebook.getAccessToken = () => ({})

    // Mock _getUserProfile
    facebook._getUserProfile = () => ({})

    const user = await facebook.getUser({ code: '12345' })

    assert.equal(user.getExpires(), null)
  })

  test('should correctly parse a valid expires_in', async (assert) => {
    const facebook = new Facebook(config)

    // Mock getAccessToken
    facebook.getAccessToken = () => ({ result: { expires_in: '12345' } })

    // Mock _getUserProfile
    facebook._getUserProfile = () => ({})

    const user = await facebook.getUser({ code: '12345' })

    assert.equal(user.getExpires(), 12345)
  })

  test('pass state when exists', async (assert) => {
    const facebook = new Facebook(config)
    const redirectUrl = qs.escape(config.get().redirectUri)
    const scope = qs.escape(['email'].join(','))
    const state = '1234'

    const providerUrl = `https://graph.facebook.com/v2.1/oauth/authorize?redirect_uri=${redirectUrl}&scope=${scope}&response_type=code&state=${state}&client_id=${config.get().clientId}`

    const redirectToUrl = await facebook.getRedirectUrl(state)
    assert.equal(redirectToUrl, providerUrl)
  })

  test('return error when state exists and original state is missing', async (assert) => {
    const facebook = new Facebook(config)
    assert.plan(1)

    try {
      await facebook.getUser({ code: 1, state: '1234' })
    } catch (error) {
      assert.equal(error.message, 'E_OAUTH_STATE_MISMATCH: Oauth state mis-match')
    }
  })

  test('return error when state exists and original state is different', async (assert) => {
    const facebook = new Facebook(config)
    assert.plan(1)

    try {
      await facebook.getUser({ code: 1, state: '1234' }, '123')
    } catch (error) {
      assert.equal(error.message, 'E_OAUTH_STATE_MISMATCH: Oauth state mis-match')
    }
  })

  test('work fine when state and original state are same', async (assert) => {
    const facebook = new Facebook(config)
    assert.plan(1)

    facebook.getAccessToken = function () {
      return { accessToken: null }
    }
    facebook._getUserProfile = function () {}
    facebook._buildAllyUser = function () {
      return 'fakeuser'
    }

    const user = await facebook.getUser({ code: 1, state: '1234' }, '1234')
    assert.equal(user, 'fakeuser')
  })
})

test.group('Oauth Drivers | Github', function () {
  test('should throw an exception when config has not been defined', (assert) => {
    const github = () => new Github({ get: function () { return null } })
    assert.throw(github, 'E_MISSING_CONFIG: github is not defined inside config/services.js file')
  })

  test('should throw an exception when clientid is missing', (assert) => {
    const github = () => new Github({ get: function () { return { clientSecret: '1', redirectUri: '2' } } })
    assert.throw(github, 'E_MISSING_CONFIG: github is not defined inside config/services.js file')
  })

  test('should throw an exception when clientSecret is missing', (assert) => {
    const github = () => new Github({ get: function () { return { clientId: '1', redirectUri: '2' } } })
    assert.throw(github, 'E_MISSING_CONFIG: github is not defined inside config/services.js file')
  })

  test('should throw an exception when redirectUri is missing', (assert) => {
    const github = () => new Github({ get: function () { return { clientId: '1', clientSecret: '2' } } })
    assert.throw(github, 'E_MISSING_CONFIG: github is not defined inside config/services.js file')
  })

  test('should generate the redirect_uri with correct signature', async (assert) => {
    const github = new Github(config)
    const redirectUrl = qs.escape(config.get().redirectUri)
    const scope = qs.escape(['user'].join(' '))
    const providerUrl = `https://github.com/login/oauth/authorize?redirect_uri=${redirectUrl}&scope=${scope}&response_type=code&client_id=${config.get().clientId}`
    const redirectToUrl = await github.getRedirectUrl()
    assert.equal(redirectToUrl, providerUrl)
  })

  test('should make use of the scopes defined in the config file', async (assert) => {
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

  test('should make use of the scopes defined on the instance', async (assert) => {
    const github = new Github(config)
    const redirectUrl = qs.escape(config.get().redirectUri)
    const scope = qs.escape(['foo'].join(' '))
    const providerUrl = `https://github.com/login/oauth/authorize?redirect_uri=${redirectUrl}&scope=${scope}&response_type=code&client_id=${config.get().clientId}`

    github.scope = ['foo']
    const redirectToUrl = await github.getRedirectUrl()
    assert.equal(redirectToUrl, providerUrl)
  })

  test('should set expires_in to null if not provided', async (assert) => {
    const github = new Github(config)

    // Mock getAccessToken
    github.getAccessToken = () => ({})

    // Mock _getUserProfile
    github._getUserProfile = () => ({})

    const user = await github.getUser({ code: '12345' })

    assert.equal(user.getExpires(), null)
  })

  test('should correctly parse a valid expires_in', async (assert) => {
    const github = new Github(config)

    // Mock getAccessToken
    github.getAccessToken = () => ({ result: { expires_in: '12345' } })

    // Mock _getUserProfile
    github._getUserProfile = () => ({})

    const user = await github.getUser({ code: '12345' })

    assert.equal(user.getExpires(), 12345)
  })

  test('pass state when exists', async (assert) => {
    const github = new Github(config)
    const redirectUrl = qs.escape(config.get().redirectUri)
    const scope = qs.escape(['user'].join(','))
    const state = '1234'

    const providerUrl = `https://github.com/login/oauth/authorize?redirect_uri=${redirectUrl}&scope=${scope}&response_type=code&state=${state}&client_id=${config.get().clientId}`

    const redirectToUrl = await github.getRedirectUrl(state)
    assert.equal(redirectToUrl, providerUrl)
  })

  test('return error when state exists and original state is missing', async (assert) => {
    const github = new Github(config)
    assert.plan(1)

    try {
      await github.getUser({ code: 1, state: '1234' })
    } catch (error) {
      assert.equal(error.message, 'E_OAUTH_STATE_MISMATCH: Oauth state mis-match')
    }
  })

  test('return error when state exists and original state is different', async (assert) => {
    const github = new Github(config)
    assert.plan(1)

    try {
      await github.getUser({ code: 1, state: '1234' }, '123')
    } catch (error) {
      assert.equal(error.message, 'E_OAUTH_STATE_MISMATCH: Oauth state mis-match')
    }
  })

  test('work fine when state and original state are same', async (assert) => {
    const github = new Github(config)
    assert.plan(1)

    github.getAccessToken = function () {
      return { accessToken: null }
    }
    github._getUserProfile = function () {}
    github._buildAllyUser = function () {
      return 'fakeuser'
    }

    const user = await github.getUser({ code: 1, state: '1234' }, '1234')
    assert.equal(user, 'fakeuser')
  })
})

test.group('Oauth Drivers | LinkedIn', function () {
  test('should throw an exception when config has not been defined', (assert) => {
    const linkedin = () => new LinkedIn({ get: function () { return null } })
    assert.throw(linkedin, 'E_MISSING_CONFIG: linkedin is not defined inside config/services.js file')
  })

  test('should throw an exception when clientid is missing', (assert) => {
    const linkedin = () => new LinkedIn({ get: function () { return { clientSecret: '1', redirectUri: '2' } } })
    assert.throw(linkedin, 'E_MISSING_CONFIG: linkedin is not defined inside config/services.js file')
  })

  test('should throw an exception when clientSecret is missing', (assert) => {
    const linkedin = () => new LinkedIn({ get: function () { return { clientId: '1', redirectUri: '2' } } })
    assert.throw(linkedin, 'E_MISSING_CONFIG: linkedin is not defined inside config/services.js file')
  })

  test('should throw an exception when redirectUri is missing', (assert) => {
    const linkedin = () => new LinkedIn({ get: function () { return { clientId: '1', clientSecret: '2' } } })
    assert.throw(linkedin, 'E_MISSING_CONFIG: linkedin is not defined inside config/services.js file')
  })

  test('should generate the redirect_uri with correct signature', async (assert) => {
    const linkedin = new LinkedIn(config)
    const redirectUrl = qs.escape(config.get().redirectUri)
    const scope = qs.escape(['r_basicprofile', 'r_emailaddress'].join(' '))
    const providerUrl = `https://www.linkedin.com/oauth/v2/authorization?redirect_uri=${redirectUrl}&scope=${scope}&response_type=code&client_id=${config.get().clientId}`
    const redirectToUrl = await linkedin.getRedirectUrl()
    assert.equal(redirectToUrl, providerUrl)
  })

  test('should make use of the scopes defined in the config file', async (assert) => {
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

  test('should make use of the scopes defined on the instance', async (assert) => {
    const linkedin = new LinkedIn(config)
    const redirectUrl = qs.escape(config.get().redirectUri)
    const scope = qs.escape(['foo'].join(' '))
    const providerUrl = `https://www.linkedin.com/oauth/v2/authorization?redirect_uri=${redirectUrl}&scope=${scope}&response_type=code&client_id=${config.get().clientId}`

    linkedin.scope = ['foo']
    const redirectToUrl = await linkedin.getRedirectUrl()
    assert.equal(redirectToUrl, providerUrl)
  })

  test('should set expires_in to null if not provided', async (assert) => {
    const linkedin = new LinkedIn(config)

    // Mock getAccessToken
    linkedin.getAccessToken = () => ({})

    // Mock _getUserProfile
    linkedin._getUserProfile = () => ({})

    const user = await linkedin.getUser({ code: '12345' })

    assert.equal(user.getExpires(), null)
  })

  test('should correctly parse a valid expires_in', async (assert) => {
    const linkedin = new LinkedIn(config)

    // Mock getAccessToken
    linkedin.getAccessToken = () => ({ result: { expires_in: '12345' } })

    // Mock _getUserProfile
    linkedin._getUserProfile = () => ({})

    const user = await linkedin.getUser({ code: '12345' })

    assert.equal(user.getExpires(), 12345)
  })

  test('pass state when exists', async (assert) => {
    const linkedin = new LinkedIn(config)
    const redirectUrl = qs.escape(config.get().redirectUri)
    const scope = qs.escape(['r_basicprofile', 'r_emailaddress'].join(' '))
    const state = '1234'

    const providerUrl = `https://www.linkedin.com/oauth/v2/authorization?redirect_uri=${redirectUrl}&scope=${scope}&response_type=code&state=${state}&client_id=${config.get().clientId}`

    const redirectToUrl = await linkedin.getRedirectUrl(state)
    assert.equal(redirectToUrl, providerUrl)
  })

  test('return error when state exists and original state is missing', async (assert) => {
    const linkedin = new LinkedIn(config)
    assert.plan(1)

    try {
      await linkedin.getUser({ code: 1, state: '1234' })
    } catch (error) {
      assert.equal(error.message, 'E_OAUTH_STATE_MISMATCH: Oauth state mis-match')
    }
  })

  test('return error when state exists and original state is different', async (assert) => {
    const linkedin = new LinkedIn(config)
    assert.plan(1)

    try {
      await linkedin.getUser({ code: 1, state: '1234' }, '123')
    } catch (error) {
      assert.equal(error.message, 'E_OAUTH_STATE_MISMATCH: Oauth state mis-match')
    }
  })

  test('work fine when state and original state are same', async (assert) => {
    const linkedin = new LinkedIn(config)
    assert.plan(1)

    linkedin.getAccessToken = function () {
      return { accessToken: null }
    }
    linkedin._getUserProfile = function () {}
    linkedin._buildAllyUser = function () {
      return 'fakeuser'
    }

    const user = await linkedin.getUser({ code: 1, state: '1234' }, '1234')
    assert.equal(user, 'fakeuser')
  })
})

test.group('Oauth Drivers | Instagram', function () {
  test('should throw an exception when config has not been defined', (assert) => {
    const instagram = () => new Instagram({ get: function () { return null } })
    assert.throw(instagram, 'E_MISSING_CONFIG: instagram is not defined inside config/services.js file')
  })

  test('should throw an exception when clientid is missing', (assert) => {
    const instagram = () => new Instagram({ get: function () { return { clientSecret: '1', redirectUri: '2' } } })
    assert.throw(instagram, 'E_MISSING_CONFIG: instagram is not defined inside config/services.js file')
  })

  test('should throw an exception when clientSecret is missing', (assert) => {
    const instagram = () => new Instagram({ get: function () { return { clientId: '1', redirectUri: '2' } } })
    assert.throw(instagram, 'E_MISSING_CONFIG: instagram is not defined inside config/services.js file')
  })

  test('should throw an exception when redirectUri is missing', (assert) => {
    const instagram = () => new Instagram({ get: function () { return { clientId: '1', clientSecret: '2' } } })
    assert.throw(instagram, 'E_MISSING_CONFIG: instagram is not defined inside config/services.js file')
  })

  test('should generate the redirect_uri with correct signature', async (assert) => {
    const instagram = new Instagram(config)
    const redirectUrl = qs.escape(config.get().redirectUri)
    const scope = qs.escape(['basic'].join(' '))
    const providerUrl = `https://api.instagram.com/oauth/authorize?redirect_uri=${redirectUrl}&scope=${scope}&response_type=code&client_id=${config.get().clientId}`
    const redirectToUrl = await instagram.getRedirectUrl()
    assert.equal(redirectToUrl, providerUrl)
  })

  test('should make use of the scopes defined in the config file', async (assert) => {
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

  test('should make use of the scopes defined on the instance', async (assert) => {
    const instagram = new Instagram(config)
    const redirectUrl = qs.escape(config.get().redirectUri)
    const scope = qs.escape(['basic'].join(' '))
    const providerUrl = `https://api.instagram.com/oauth/authorize?redirect_uri=${redirectUrl}&scope=${scope}&response_type=code&client_id=${config.get().clientId}`

    instagram.scope = ['basic']
    const redirectToUrl = await instagram.getRedirectUrl()
    assert.equal(redirectToUrl, providerUrl)
  })

  test('pass state when exists', async (assert) => {
    const instagram = new Instagram(config)
    const redirectUrl = qs.escape(config.get().redirectUri)
    const scope = qs.escape(['basic'].join(' '))
    const state = '1234'

    const providerUrl = `https://api.instagram.com/oauth/authorize?redirect_uri=${redirectUrl}&scope=${scope}&response_type=code&state=${state}&client_id=${config.get().clientId}`

    const redirectToUrl = await instagram.getRedirectUrl(state)
    assert.equal(redirectToUrl, providerUrl)
  })

  test('return error when state exists and original state is missing', async (assert) => {
    const instagram = new Instagram(config)
    assert.plan(1)

    try {
      await instagram.getUser({ code: 1, state: '1234' })
    } catch (error) {
      assert.equal(error.message, 'E_OAUTH_STATE_MISMATCH: Oauth state mis-match')
    }
  })

  test('return error when state exists and original state is different', async (assert) => {
    const instagram = new Instagram(config)
    assert.plan(1)

    try {
      await instagram.getUser({ code: 1, state: '1234' }, '123')
    } catch (error) {
      assert.equal(error.message, 'E_OAUTH_STATE_MISMATCH: Oauth state mis-match')
    }
  })

  test('work fine when state and original state are same', async (assert) => {
    const instagram = new Instagram(config)
    assert.plan(1)

    instagram.getAccessToken = function () {
      return { accessToken: null }
    }
    instagram._getUserProfile = function () {}
    instagram._buildAllyUser = function () {
      return 'fakeuser'
    }

    const user = await instagram.getUser({ code: 1, state: '1234' }, '1234')
    assert.equal(user, 'fakeuser')
  })
})

test.group('Oauth Drivers | Twitter', function () {
  test('should throw an exception when config has not been defined', (assert) => {
    const twitter = () => new Twitter({ get: function () { return null } })
    assert.throw(twitter, 'E_MISSING_CONFIG: twitter is not defined inside config/services.js file')
  })

  test('should throw an exception when clientid is missing', (assert) => {
    const twitter = () => new Twitter({ get: function () { return { clientSecret: '1', redirectUri: '2' } } })
    assert.throw(twitter, 'E_MISSING_CONFIG: twitter is not defined inside config/services.js file')
  })

  test('should throw an exception when clientSecret is missing', (assert) => {
    const twitter = () => new Twitter({ get: function () { return { clientId: '1', redirectUri: '2' } } })
    assert.throw(twitter, 'E_MISSING_CONFIG: twitter is not defined inside config/services.js file')
  })

  test('should throw an exception when redirectUri is missing', (assert) => {
    const twitter = () => new Twitter({ get: function () { return { clientId: '1', clientSecret: '2' } } })
    assert.throw(twitter, 'E_MISSING_CONFIG: twitter is not defined inside config/services.js file')
  })
})

test.group('Foursquare', function () {
  test('should throw an exception when config has not been defined', (assert) => {
    const foursquare = () => new Foursquare({ get: function () { return null } })
    assert.throw(foursquare, 'E_MISSING_CONFIG: foursquare is not defined inside config/services.js file')
  })

  test('should throw an exception when clientid is missing', (assert) => {
    const foursquare = () => new Foursquare({ get: function () { return { clientSecret: '1', redirectUri: '2' } } })
    assert.throw(foursquare, 'E_MISSING_CONFIG: foursquare is not defined inside config/services.js file')
  })

  test('should throw an exception when clientSecret is missing', (assert) => {
    const foursquare = () => new Foursquare({ get: function () { return { clientId: '1', redirectUri: '2' } } })
    assert.throw(foursquare, 'E_MISSING_CONFIG: foursquare is not defined inside config/services.js file')
  })

  test('should throw an exception when redirectUri is missing', (assert) => {
    const foursquare = () => new Foursquare({ get: function () { return { clientId: '1', clientSecret: '2' } } })
    assert.throw(foursquare, 'E_MISSING_CONFIG: foursquare is not defined inside config/services.js file')
  })

  test('should generate the redirect_uri with correct signature', async (assert) => {
    const foursquare = new Foursquare(config)
    const redirectUrl = qs.escape(config.get().redirectUri)
    const providerUrl = `https://foursquare.com/oauth2/authenticate?redirect_uri=${redirectUrl}&response_type=code&client_id=${config.get().clientId}`
    const redirectToUrl = await foursquare.getRedirectUrl()
    assert.equal(redirectToUrl, providerUrl)
  })

  test('should make use of the scopes defined in the config file', async (assert) => {
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

  test('should make use of the scopes defined on the instance', async (assert) => {
    const foursquare = new Foursquare(config)
    const redirectUrl = qs.escape(config.get().redirectUri)
    const providerUrl = `https://foursquare.com/oauth2/authenticate?redirect_uri=${redirectUrl}&response_type=code&client_id=${config.get().clientId}`

    foursquare.scope = ['basic']
    const redirectToUrl = await foursquare.getRedirectUrl()
    assert.equal(redirectToUrl, providerUrl)
  })

  test('should set expires_in to null if not provided', async (assert) => {
    const foursquare = new Foursquare(config)

    // Mock getAccessToken
    foursquare.getAccessToken = () => ({})

    // Mock _getUserProfile
    foursquare._getUserProfile = () => ({
      response: {
        user: {
          contact: {},
          photo: {}
        }
      }
    })

    const user = await foursquare.getUser({ code: '12345' })

    assert.equal(user.getExpires(), null)
  })

  test('should correctly parse a valid expires_in', async (assert) => {
    const foursquare = new Foursquare(config)

    // Mock getAccessToken
    foursquare.getAccessToken = () => ({ result: { expires_in: '12345' } })

    // Mock _getUserProfile
    foursquare._getUserProfile = () => ({
      response: {
        user: {
          contact: {},
          photo: {}
        }
      }
    })

    const user = await foursquare.getUser({ code: '12345' })

    assert.equal(user.getExpires(), 12345)
  })
})

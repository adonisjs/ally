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
const OAuth2 = require('../src/Schemes/OAuth2')
const qs = require('querystring')
const clientId = '10012020'
const clientSecret = '1000w0sa'

test.group('OAuth2', function () {
  test('should throw an exception when oauth2 class is initiated directly', function (assert) {
    const oauth2 = () => new OAuth2(clientId, clientSecret)
    assert.throw(oauth2, 'E_CANNOT_INSTANTIATE: OAuth2 class cannot be instantiated directly and must be extended')
  })

  test('should throw an exception when redirect uri is not passed to the getUrl method', function (assert) {
    class Facebook extends OAuth2 {
      get baseUrl () {
        return 'https://graph.facebook.com/v2.1'
      }

      get authorizeUrl () {
        return 'oauth/authorize'
      }

      get accessTokenUrl () {
        return 'oauth/access_token'
      }
    }

    const facebookUrl = () => new Facebook(clientId, clientSecret).getUrl()
    assert.throw(facebookUrl, 'E_MISSING_PARAMETER: Missing parameter redirectUri expected by getUrl method as 1st parameter')
  })

  test('should throw an exception when trying to initiate the class without clientId', function (assert) {
    class Facebook extends OAuth2 {
      get baseUrl () {
        return 'https://graph.facebook.com/v2.1'
      }

      get authorizeUrl () {
        return 'oauth/authorize'
      }

      get accessTokenUrl () {
        return 'oauth/access_token'
      }
    }

    const facebook = () => new Facebook()
    assert.throw(facebook, 'E_MISSING_PARAMETER: Missing parameter clientId expected by oauth2 method as 1st parameter')
  })

  test('should throw an exception when trying to initiate the class without clientSecret', function (assert) {
    class Facebook extends OAuth2 {
      get baseUrl () {
        return 'https://graph.facebook.com/v2.1'
      }

      get authorizeUrl () {
        return 'oauth/authorize'
      }

      get accessTokenUrl () {
        return 'oauth/access_token'
      }
    }

    const facebook = () => new Facebook(clientId)
    assert.throw(facebook, 'E_MISSING_PARAMETER: Missing parameter clientSecret expected by oauth2 method as 2nd parameter')
  })

  test('should not append / when the baseUrl ends with /', function (assert) {
    class Facebook extends OAuth2 {
      get baseUrl () {
        return 'https://graph.facebook.com/v2.1/'
      }

      get authorizeUrl () {
        return 'oauth/authorize'
      }

      get accessTokenUrl () {
        return 'oauth/access_token'
      }
    }

    const redirectUri = 'http://localhost:8000/logged'
    const facebookUrl = new Facebook(clientId, clientSecret).getUrl(redirectUri)
    const expectedUrl = `https://graph.facebook.com/v2.1/oauth/authorize?redirect_uri=${qs.escape(redirectUri)}&client_id=${clientId}`
    assert.equal(facebookUrl, expectedUrl)
  })

  test('should return the redirect url using the getUrl method', function (assert) {
    class Facebook extends OAuth2 {
      get baseUrl () {
        return 'https://graph.facebook.com/v2.1'
      }

      get authorizeUrl () {
        return 'oauth/authorize'
      }

      get accessTokenUrl () {
        return 'oauth/access_token'
      }
    }

    const redirectUri = 'http://localhost:8000/logged'
    const facebookUrl = new Facebook(clientId, clientSecret).getUrl(redirectUri)
    const expectedUrl = `https://graph.facebook.com/v2.1/oauth/authorize?redirect_uri=${qs.escape(redirectUri)}&client_id=${clientId}`
    assert.equal(facebookUrl, expectedUrl)
  })

  test('should append the scopes to the redirect url when defined', function (assert) {
    class Facebook extends OAuth2 {
      get baseUrl () {
        return 'https://graph.facebook.com/v2.1'
      }

      get authorizeUrl () {
        return 'oauth/authorize'
      }

      get accessTokenUrl () {
        return 'oauth/access_token'
      }
    }

    const redirectUri = 'http://localhost:8000/logged'
    const facebookUrl = new Facebook(clientId, clientSecret).getUrl(redirectUri, ['email', 'friends'])
    const expectedUrl = `https://graph.facebook.com/v2.1/oauth/authorize?redirect_uri=${qs.escape(redirectUri)}&scope=${qs.escape('email,friends')}&client_id=${clientId}`
    assert.equal(facebookUrl, expectedUrl)
  })

  test('should append the secret to the redirect url when defined', function (assert) {
    class Facebook extends OAuth2 {
      get baseUrl () {
        return 'https://graph.facebook.com/v2.1'
      }

      get authorizeUrl () {
        return 'oauth/authorize'
      }

      get accessTokenUrl () {
        return 'oauth/access_token'
      }
    }

    const redirectUri = 'http://localhost:8000/logged'
    const facebookUrl = new Facebook(clientId, clientSecret).getUrl(redirectUri, [], { state: 101010 })
    const expectedUrl = `https://graph.facebook.com/v2.1/oauth/authorize?redirect_uri=${qs.escape(redirectUri)}&state=101010&client_id=${clientId}`
    assert.equal(facebookUrl, expectedUrl)
  })

  test('should be able to parse standard oauth error', function (assert) {
    class Facebook extends OAuth2 {
    }
    const facebook = new Facebook(clientId, clientSecret)
    const parsedError = facebook.parseProviderError({ statusCode: 400, data: JSON.stringify({ error_description: 'foo' }) })
    assert.equal(parsedError.name, 'OAuthException')
    assert.equal(parsedError.message, 'E_OAUTH_TOKEN_EXCHANGE: foo')
  })

  test('should return original error back as a message when error message does not have data property', function (assert) {
    class Facebook extends OAuth2 {
    }
    const facebook = new Facebook(clientId, clientSecret)
    const parsedError = facebook.parseProviderError({ statusCode: 400 })
    assert.equal(parsedError.name, 'OAuthException')
    assert.equal(parsedError.message, 'E_OAUTH_TOKEN_EXCHANGE: null')
  })
})

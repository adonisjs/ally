/*
 * @adonisjs/ally
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import test from 'japa'
import nock from 'nock'
import { escape } from 'querystring'
import { Oauth1Request } from '../src/Spec/Oauth1Request'

test.group('Oauth1Request | request token', () => {
	test('make request for the oauth server with the correct auth header', async (assert) => {
		assert.plan(8)

		nock('https://www.twitter.com')
			.post('/request_token')
			.reply(function () {
				const authorization = this.req.headers.authorization.replace('OAuth ', '').split(',')
				const payload = authorization.reduce<any>((result, token) => {
					const [key, value] = token.split('=')
					result[key] = value.slice(1).slice(0, -1)
					return result
				}, {})

				assert.property(payload, 'oauth_consumer_key')
				assert.property(payload, 'oauth_nonce')
				assert.property(payload, 'oauth_signature')
				assert.property(payload, 'oauth_timestamp')
				assert.equal(payload.oauth_version, '1.0')
				assert.equal(payload.oauth_signature_method, 'HMAC-SHA1')

				return [200, 'oauth_token=1&oauth_token_secret=foo']
			})

		const request = new Oauth1Request('https://www.twitter.com/request_token', {
			consumerKey: 'a-dummy-consumer-key',
			consumerSecret: 'a-dummy-consumer-secret',
		})

		const token = await request.getRequestToken()
		assert.equal(token.oauthToken, '1')
		assert.equal(token.oauthTokenSecret, 'foo')
	})

	test('pass extra oauth params to the oauth server', async (assert) => {
		assert.plan(9)

		nock('https://www.twitter.com')
			.post('/request_token')
			.reply(function () {
				const authorization = this.req.headers.authorization.replace('OAuth ', '').split(',')
				const payload = authorization.reduce<any>((result, token) => {
					const [key, value] = token.split('=')
					result[key] = value.slice(1).slice(0, -1)
					return result
				}, {})

				assert.property(payload, 'oauth_consumer_key')
				assert.property(payload, 'oauth_nonce')
				assert.property(payload, 'oauth_signature')
				assert.property(payload, 'oauth_timestamp')
				assert.equal(payload.oauth_version, '1.0')
				assert.equal(payload.oauth_signature_method, 'HMAC-SHA1')
				assert.equal(payload.oauth_callback, escape('http://localhost:3000'))

				return [200, 'oauth_token=1&oauth_token_secret=foo']
			})

		const request = new Oauth1Request('https://www.twitter.com/request_token', {
			consumerKey: 'a-dummy-consumer-key',
			consumerSecret: 'a-dummy-consumer-secret',
		})
		request.oauthParam('oauth_callback', 'http://localhost:3000')

		const token = await request.getRequestToken()
		assert.equal(token.oauthToken, '1')
		assert.equal(token.oauthTokenSecret, 'foo')
	})

	test('throw error when response type is not urlencoded', async (assert) => {
		assert.plan(8)

		nock('https://www.twitter.com')
			.post('/request_token')
			.reply(function () {
				const authorization = this.req.headers.authorization.replace('OAuth ', '').split(',')
				const payload = authorization.reduce<any>((result, token) => {
					const [key, value] = token.split('=')
					result[key] = value.slice(1).slice(0, -1)
					return result
				}, {})

				assert.property(payload, 'oauth_consumer_key')
				assert.property(payload, 'oauth_nonce')
				assert.property(payload, 'oauth_signature')
				assert.property(payload, 'oauth_timestamp')
				assert.equal(payload.oauth_version, '1.0')
				assert.equal(payload.oauth_signature_method, 'HMAC-SHA1')
				assert.equal(payload.oauth_callback, escape('http://localhost:3000'))

				return [200, { hello: 'world' }]
			})

		const request = new Oauth1Request('https://www.twitter.com/request_token', {
			consumerKey: 'a-dummy-consumer-key',
			consumerSecret: 'a-dummy-consumer-secret',
		})
		request.oauthParam('oauth_callback', 'http://localhost:3000')

		try {
			await request.getRequestToken()
		} catch (error) {
			assert.equal(
				error.message,
				'Invalid oauth1 response. Missing "oauth_token" and "oauth_token_secret"'
			)
		}
	})

	test('throw error when oauth_token is missing', async (assert) => {
		assert.plan(8)

		nock('https://www.twitter.com')
			.post('/request_token')
			.reply(function () {
				const authorization = this.req.headers.authorization.replace('OAuth ', '').split(',')
				const payload = authorization.reduce<any>((result, token) => {
					const [key, value] = token.split('=')
					result[key] = value.slice(1).slice(0, -1)
					return result
				}, {})

				assert.property(payload, 'oauth_consumer_key')
				assert.property(payload, 'oauth_nonce')
				assert.property(payload, 'oauth_signature')
				assert.property(payload, 'oauth_timestamp')
				assert.equal(payload.oauth_version, '1.0')
				assert.equal(payload.oauth_signature_method, 'HMAC-SHA1')
				assert.equal(payload.oauth_callback, escape('http://localhost:3000'))

				return [200, '']
			})

		const request = new Oauth1Request('https://www.twitter.com/request_token', {
			consumerKey: 'a-dummy-consumer-key',
			consumerSecret: 'a-dummy-consumer-secret',
		})
		request.oauthParam('oauth_callback', 'http://localhost:3000')

		try {
			await request.getRequestToken()
		} catch (error) {
			assert.equal(
				error.message,
				'Invalid oauth1 response. Missing "oauth_token" and "oauth_token_secret"'
			)
		}
	})

	test('throw error when oauth_token_secret is missing', async (assert) => {
		assert.plan(8)

		nock('https://www.twitter.com')
			.post('/request_token')
			.reply(function () {
				const authorization = this.req.headers.authorization.replace('OAuth ', '').split(',')
				const payload = authorization.reduce<any>((result, token) => {
					const [key, value] = token.split('=')
					result[key] = value.slice(1).slice(0, -1)
					return result
				}, {})

				assert.property(payload, 'oauth_consumer_key')
				assert.property(payload, 'oauth_nonce')
				assert.property(payload, 'oauth_signature')
				assert.property(payload, 'oauth_timestamp')
				assert.equal(payload.oauth_version, '1.0')
				assert.equal(payload.oauth_signature_method, 'HMAC-SHA1')
				assert.equal(payload.oauth_callback, escape('http://localhost:3000'))

				return [200, 'oauth_token=1']
			})

		const request = new Oauth1Request('https://www.twitter.com/request_token', {
			consumerKey: 'a-dummy-consumer-key',
			consumerSecret: 'a-dummy-consumer-secret',
		})
		request.oauthParam('oauth_callback', 'http://localhost:3000')

		try {
			await request.getRequestToken()
		} catch (error) {
			assert.equal(
				error.message,
				'Invalid oauth1 response. Missing "oauth_token" and "oauth_token_secret"'
			)
		}
	})

	test('pass query string to the oauth server', async (assert) => {
		assert.plan(9)

		nock('https://www.twitter.com')
			.post('/request_token')
			.query(true)
			.reply(function () {
				const authorization = this.req.headers.authorization.replace('OAuth ', '').split(',')
				const payload = authorization.reduce<any>((result, token) => {
					const [key, value] = token.split('=')
					result[key] = value.slice(1).slice(0, -1)
					return result
				}, {})

				assert.property(payload, 'oauth_consumer_key')
				assert.property(payload, 'oauth_nonce')
				assert.property(payload, 'oauth_signature')
				assert.property(payload, 'oauth_timestamp')
				assert.equal(payload.oauth_version, '1.0')
				assert.equal(payload.oauth_signature_method, 'HMAC-SHA1')
				assert.equal(this.req['options'].searchParams.get('redirect_url'), 'http://localhost:3000')
				return [200, 'oauth_token=1&oauth_token_secret=foo']
			})

		const request = new Oauth1Request('https://www.twitter.com/request_token', {
			consumerKey: 'a-dummy-consumer-key',
			consumerSecret: 'a-dummy-consumer-secret',
		})
		request.param('redirect_url', 'http://localhost:3000')

		const token = await request.getRequestToken()
		assert.equal(token.oauthToken, '1')
		assert.equal(token.oauthTokenSecret, 'foo')
	})
})

test.group('Oauth1Request | access token', () => {
	test('make request to get the access token', async (assert) => {
		assert.plan(9)

		nock('https://www.twitter.com')
			.post('/access_token')
			.reply(function () {
				const authorization = this.req.headers.authorization.replace('OAuth ', '').split(',')
				const payload = authorization.reduce<any>((result, token) => {
					const [key, value] = token.split('=')
					result[key] = value.slice(1).slice(0, -1)
					return result
				}, {})

				assert.property(payload, 'oauth_consumer_key')
				assert.property(payload, 'oauth_nonce')
				assert.property(payload, 'oauth_signature')
				assert.property(payload, 'oauth_timestamp')
				assert.equal(payload.oauth_version, '1.0')
				assert.equal(payload.oauth_signature_method, 'HMAC-SHA1')
				assert.equal(payload.oauth_token, 'foo')

				return [200, 'oauth_token=1&oauth_token_secret=foo']
			})

		const request = new Oauth1Request('https://www.twitter.com/access_token', {
			consumerKey: 'a-dummy-consumer-key',
			consumerSecret: 'a-dummy-consumer-secret',
			oAuthToken: 'foo',
		})

		const token = await request.getAccessToken()
		assert.equal(token.oauthToken, '1')
		assert.equal(token.oauthTokenSecret, 'foo')
	})

	test('raise error if oauth_token is not passed inside the constructor options', async (assert) => {
		assert.plan(1)

		nock('https://www.twitter.com')
			.post('/access_token')
			.reply(function () {
				const authorization = this.req.headers.authorization.replace('OAuth ', '').split(',')
				const payload = authorization.reduce<any>((result, token) => {
					const [key, value] = token.split('=')
					result[key] = value.slice(1).slice(0, -1)
					return result
				}, {})

				assert.property(payload, 'oauth_consumer_key')
				assert.property(payload, 'oauth_nonce')
				assert.property(payload, 'oauth_signature')
				assert.property(payload, 'oauth_timestamp')
				assert.equal(payload.oauth_version, '1.0')
				assert.equal(payload.oauth_signature_method, 'HMAC-SHA1')
				assert.equal(payload.oauth_token, 'foo')

				return [200, 'oauth_token=1&oauth_token_secret=foo']
			})

		const request = new Oauth1Request('https://www.twitter.com/access_token', {
			consumerKey: 'a-dummy-consumer-key',
			consumerSecret: 'a-dummy-consumer-secret',
		})

		try {
			await request.getAccessToken()
		} catch (error) {
			assert.equal(error.message, '"oAuthToken" is required to generate the access token')
		}
	})
})

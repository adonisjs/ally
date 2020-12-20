/*
 * @adonisjs/ally
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import test from 'japa'
import { Oauth1Signature } from '../src/Spec/Oauth1Signature'

test.group('Oauth1Signature', () => {
	test('create signature for the oauth1 request token', (assert) => {
		const timestamp = 1582326295

		const { oauthParams, params, signature, oauthHeader } = new Oauth1Signature({
			nonce: '123456',
			consumerKey: 'a-sample-oauth-key',
			consumerSecret: 'a-sample-oauth-secret',
			method: 'POST',
			url: 'http://example.com/wp-json/wp/v2/posts',
			unixTimestamp: timestamp,
		}).generate()

		assert.deepEqual(oauthParams, {
			oauth_signature: 'lH/r+/YRqYMvGW1Pf05pp2jaNfY=',
			oauth_consumer_key: 'a-sample-oauth-key',
			oauth_nonce: '123456',
			oauth_signature_method: 'HMAC-SHA1',
			oauth_timestamp: timestamp,
			oauth_version: '1.0',
		})

		assert.deepEqual(params, {
			oauth_consumer_key: 'a-sample-oauth-key',
			oauth_nonce: '123456',
			oauth_signature_method: 'HMAC-SHA1',
			oauth_timestamp: timestamp,
			oauth_version: '1.0',
		})

		assert.equal(
			oauthHeader,
			'oauth_consumer_key="a-sample-oauth-key",oauth_nonce="123456",oauth_signature="lH%2Fr%2B%2FYRqYMvGW1Pf05pp2jaNfY%3D",oauth_signature_method="HMAC-SHA1",oauth_timestamp="1582326295",oauth_version="1.0"'
		)
		assert.equal(signature, 'lH/r+/YRqYMvGW1Pf05pp2jaNfY=')
	})

	test('do not add non "oauth_" tokens to the oauthParams', (assert) => {
		const timestamp = 1582326295

		const { oauthParams, params, signature, oauthHeader } = new Oauth1Signature({
			nonce: '123456',
			consumerKey: 'a-sample-oauth-key',
			consumerSecret: 'a-sample-oauth-secret',
			method: 'POST',
			url: 'http://example.com/wp-json/wp/v2/posts',
			unixTimestamp: timestamp,
			params: {
				name: 'foo',
			},
		}).generate()

		assert.deepEqual(oauthParams, {
			oauth_signature: 'E/uyE/m+t690+dQnrNyY71umQVE=',
			oauth_consumer_key: 'a-sample-oauth-key',
			oauth_nonce: '123456',
			oauth_signature_method: 'HMAC-SHA1',
			oauth_timestamp: timestamp,
			oauth_version: '1.0',
		})

		assert.deepEqual(params, {
			name: 'foo',
			oauth_consumer_key: 'a-sample-oauth-key',
			oauth_nonce: '123456',
			oauth_signature_method: 'HMAC-SHA1',
			oauth_timestamp: timestamp,
			oauth_version: '1.0',
		})

		assert.equal(
			oauthHeader,
			'oauth_consumer_key="a-sample-oauth-key",oauth_nonce="123456",oauth_signature="E%2FuyE%2Fm%2Bt690%2BdQnrNyY71umQVE%3D",oauth_signature_method="HMAC-SHA1",oauth_timestamp="1582326295",oauth_version="1.0"'
		)
		assert.equal(signature, 'E/uyE/m+t690+dQnrNyY71umQVE=')
	})

	test('allow extra oauth_ values', (assert) => {
		const timestamp = 1582326295

		const { oauthParams, params, signature, oauthHeader } = new Oauth1Signature({
			nonce: '123456',
			consumerKey: 'a-sample-oauth-key',
			consumerSecret: 'a-sample-oauth-secret',
			method: 'POST',
			url: 'http://example.com/wp-json/wp/v2/posts',
			unixTimestamp: timestamp,
			params: {
				oauth_callback: 'http://localhost:3000',
			},
		}).generate()

		assert.deepEqual(oauthParams, {
			oauth_callback: 'http://localhost:3000',
			oauth_signature: 'bgQ6mOOZ+UyEbqbR5zBIaakLdQ8=',
			oauth_consumer_key: 'a-sample-oauth-key',
			oauth_nonce: '123456',
			oauth_signature_method: 'HMAC-SHA1',
			oauth_timestamp: timestamp,
			oauth_version: '1.0',
		})

		assert.deepEqual(params, {
			oauth_callback: 'http://localhost:3000',
			oauth_consumer_key: 'a-sample-oauth-key',
			oauth_nonce: '123456',
			oauth_signature_method: 'HMAC-SHA1',
			oauth_timestamp: timestamp,
			oauth_version: '1.0',
		})

		assert.equal(
			oauthHeader,
			'oauth_callback="http%3A%2F%2Flocalhost%3A3000",oauth_consumer_key="a-sample-oauth-key",oauth_nonce="123456",oauth_signature="bgQ6mOOZ%2BUyEbqbR5zBIaakLdQ8%3D",oauth_signature_method="HMAC-SHA1",oauth_timestamp="1582326295",oauth_version="1.0"'
		)
		assert.equal(signature, 'bgQ6mOOZ+UyEbqbR5zBIaakLdQ8=')
	})
})
